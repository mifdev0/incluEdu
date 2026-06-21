'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DIMENSI_UNIVERSAL, DIMENSI_KHUSUS, type DimensiItem, type KategoriABK } from '@/lib/observasi-schema'
import { BrandLogo } from '@/components/brand-logo'
import { supabase } from '@/lib/supabase'
import { FullPageLoading } from '@/components/loading-state'
import { ArrowRight, CheckCircle2, Scale, X } from 'lucide-react'
import { normalizeObservationCategory } from '@/lib/observation-progress'

type ActiveGoal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  langkah_tugas: string[]
}

const legacyGoalScore: Record<string, number> = {
  belum_terlihat: 0,
  banyak_bantuan: 35,
  sedikit_bantuan: 65,
  mandiri_konsisten: 100,
}

const assistanceOptions = [
  { value: 'bf', label: 'Bf — Bantuan fisik penuh', bobot: 20 },
  { value: 'bv', label: 'Bv — Bantuan verbal', bobot: 40 },
  { value: 'd', label: 'D — Demonstrasi / contoh langsung', bobot: 55 },
  { value: 'p', label: 'P — Petunjuk atau gesture minimal', bobot: 75 },
  { value: 'inkonsisten', label: '+/- — Mampu tetapi belum konsisten', bobot: 85 },
  { value: 'mandiri', label: '+ — Mandiri, aman, dan konsisten', bobot: 100 },
]

const assistanceScore = Object.fromEntries(assistanceOptions.map((option) => [option.value, option.bobot]))

export default function ObservasiSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [kategori, setKategori] = useState<KategoriABK>('lainnya')
  const [categoryLabel, setCategoryLabel] = useState('lainnya')
  const [studentName, setStudentName] = useState('Siswa')
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([])
  const [week, setWeek] = useState(1)
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dimensiKhusus = DIMENSI_KHUSUS[kategori] || []
  const goalDimensions: DimensiItem[] = activeGoals.flatMap((goal) => {
    const taskSteps = Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0
      ? goal.langkah_tugas
      : [goal.indikator]
    return taskSteps.map((task, index) => ({
      key: `task_${goal.id}_${index}`,
      label: `Analisis tugas · ${goal.area}`,
      pertanyaan: `${task} Tingkat bantuan apa yang dibutuhkan ${studentName} pada langkah ini?`,
      opsi: assistanceOptions,
    }))
  })
  const semuaDimensi = [...DIMENSI_UNIVERSAL, ...dimensiKhusus, ...goalDimensions]
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [catatan, setCatatan] = useState('')
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [rubricOpen, setRubricOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return

    async function loadObservationData() {
      const [studentResult, countResult, ppiResult, guideResult] = await Promise.all([
        supabase.from('siswa').select('nama, kategori').eq('id', params.id).single(),
        supabase.from('observasi').select('id', { count: 'exact', head: true }).eq('siswa_id', params.id),
        supabase.from('ppi').select('id').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('panduan_konfirmasi').select('dikonfirmasi_at').eq('siswa_id', params.id).maybeSingle(),
      ])
      if (!guideResult.data?.dikonfirmasi_at) {
        router.replace(`/dashboard/siswa/${params.id}/panduan`)
        return
      }
      if (studentResult.data) {
        setStudentName(studentResult.data.nama)
        setCategoryLabel(studentResult.data.kategori)
        setKategori(normalizeObservationCategory(studentResult.data.kategori))
      }
      setWeek((countResult.count || 0) + 1)
      if (ppiResult.data) {
        const { data: goals } = await supabase
          .from('tujuan_ppi')
          .select('id, area, tujuan, indikator, target, langkah_tugas')
          .eq('ppi_id', ppiResult.data.id)
          .in('status', ['belum_dimulai', 'berkembang', 'hampir_tercapai'])
          .order('created_at')
        setActiveGoals((goals || []) as ActiveGoal[])
      }
      setDataLoading(false)
    }

    void loadObservationData()
  }, [user, authLoading, router, params.id])
  if (authLoading || !user || dataLoading) return <FullPageLoading label="Menyiapkan observasi..." />

  const pertanyaanSaatIni = semuaDimensi[step]
  const total = semuaDimensi.length
  const terjawab = Object.keys(jawaban).length
  const pct = Math.round((terjawab / total) * 100)
  const semuaTerisi = semuaDimensi.every(d => jawaban[d.key])

  function pilih(key: string, value: string) {
    setJawaban(prev => ({ ...prev, [key]: value }))
    setTimeout(() => {
      if (step < total - 1) setStep(step + 1)
      else setStep(total)
    }, 180)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const { error: insertError } = await supabase.from('observasi').insert({
        siswa_id: params.id,
        guru_id: user.id,
        minggu_ke: week,
        jawaban,
        catatan: catatan.trim() || null,
      })
      if (insertError) throw insertError

      if (activeGoals.length > 0) {
        const { data: observations, error: observationsError } = await supabase
          .from('observasi')
          .select('jawaban')
          .eq('siswa_id', params.id)
        if (observationsError) throw observationsError

        const updates = activeGoals.map((goal) => {
          const taskCount = Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0 ? goal.langkah_tugas.length : 1
          const values = (observations || []).flatMap((observation) => {
            const answers = observation.jawaban as Record<string, string> | null
            if (!answers) return []
            const taskValues = Array.from({ length: taskCount }, (_, index) => answers[`task_${goal.id}_${index}`])
              .filter((value): value is string => Boolean(value && value in assistanceScore))
              .map((value) => assistanceScore[value])
            const legacyValue = answers[`goal_${goal.id}`]
            if (taskValues.length > 0) return taskValues
            return legacyValue && legacyValue in legacyGoalScore ? [legacyGoalScore[legacyValue]] : []
          })
          const capaian = values.length > 0
            ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
            : 0
          const status = capaian >= goal.target
            ? 'tercapai'
            : capaian >= goal.target * 0.8
              ? 'hampir_tercapai'
              : capaian > 0
                ? 'berkembang'
                : 'belum_dimulai'
          return supabase.from('tujuan_ppi').update({ capaian, status }).eq('id', goal.id)
        })
        const updateResults = await Promise.all(updates)
        const updateError = updateResults.find((result) => result.error)?.error
        if (updateError) throw updateError
      }

      setCompleted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Observasi gagal disimpan.')
    } finally {
      setSaving(false)
    }
  }

  const FormContent = () => {
    if (step < total) {
      return (
        <div className="bg-surface rounded-3xl p-5 sm:p-lg border border-outline-variant/20 hard-shadow">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-xs font-label-sm text-primary uppercase tracking-wider">{pertanyaanSaatIni.label}</p>
            <button type="button" onClick={() => setRubricOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary">
              <Scale className="w-3.5 h-3.5" /> Lihat rubrik
            </button>
          </div>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-md">{pertanyaanSaatIni.pertanyaan}</p>
          <div className="space-y-3">
            {pertanyaanSaatIni.opsi.map((o) => (
              <button key={o.value} type="button" onClick={() => pilih(pertanyaanSaatIni.key, o.value)}
                className={`w-full text-left px-4 sm:px-5 py-3.5 rounded-2xl sm:rounded-full text-sm sm:text-body-md font-semibold transition-all ${
                  jawaban[pertanyaanSaatIni.key] === o.value
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-lg">
            <button type="button" onClick={() => step > 0 && setStep(step - 1)} className="text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors">← Sebelumnya</button>
            <span className="text-on-surface-variant text-body-md">{step + 1}/{total}</span>
          </div>
        </div>
      )
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-lg">
        <div className="bg-surface rounded-3xl p-5 sm:p-lg border border-outline-variant/20 hard-shadow">
          <div className="flex items-start gap-3 mb-md">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-headline-sm font-bold text-on-surface">Semua pertanyaan selesai</h3>
              <p className="text-sm text-on-surface-variant mt-1">Periksa jawaban, tambahkan catatan bila perlu, lalu simpan observasi.</p>
            </div>
          </div>
          {semuaDimensi.map((d) => (
            <div key={d.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-3 border-b border-outline-variant/10 last:border-0">
              <span className="text-on-surface text-sm sm:text-body-md font-semibold">{d.label}</span>
              <span className="text-primary text-sm font-bold">{d.opsi.find(o => o.value === jawaban[d.key])?.label}</span>
            </div>
          ))}
          <div className="mt-md">
            <label className="block text-on-surface font-body-md text-body-md mb-2">Catatan (opsional)</label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/40 text-body-md font-body-md resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" rows={3} placeholder="Tulis catatan tambahan..." />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3">
          <button type="button" onClick={() => setStep(0)} className="w-full px-6 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all">Periksa dari awal</button>
          <button type="submit" disabled={!semuaTerisi || saving} className="w-full py-3.5 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">{saving ? 'Menyimpan...' : 'Simpan Observasi'}</button>
        </div>
        {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
      </form>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[2rem] bg-white border border-outline-variant/20 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-headline-sm text-headline-sm mt-5">Observasi berhasil disimpan</h1>
          <p className="text-on-surface-variant mt-2 leading-relaxed">
            Data minggu ke-{week} sudah masuk ke profil {studentName}. Grafik dan capaian tujuan PPI telah diperbarui dari jawaban ini.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <a href={`/dashboard/siswa/${params.id}`} className="px-5 py-3.5 rounded-full bg-primary text-white font-bold inline-flex items-center justify-center gap-2">
              Lihat perkembangan <ArrowRight className="w-4 h-4" />
            </a>
            <button type="button" onClick={() => router.push('/dashboard')} className="px-5 py-3.5 rounded-full bg-surface-container-high font-bold">
              Kembali ke dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Profil</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-2xl mx-auto px-4 sm:px-gutter pb-xl">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{studentName}</h2>
          <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">{categoryLabel.replaceAll('_', ' ')}</span>
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md mb-lg">Observasi Minggu ke-{week}</p>

        {/* Progress Bar */}
        <div className="mb-lg">
          <div className="flex justify-between text-on-surface-variant font-label-md text-label-md mb-1.5">
            <span>{step < total ? `Pertanyaan ${step + 1} dari ${total}` : 'Ringkasan observasi'}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <FormContent />
      </main>

      {rubricOpen && step < total && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">Rubrik penilaian</div>
                <h2 className="text-xl font-bold mt-1">{pertanyaanSaatIni.label}</h2>
              </div>
              <button type="button" onClick={() => setRubricOpen(false)} className="p-2 rounded-full hover:bg-surface-container" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mt-2">
              Bobot digunakan sistem untuk menghitung perkembangan. Pilih jawaban berdasarkan kondisi yang benar-benar diamati.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/20">
              {pertanyaanSaatIni.opsi.map((option) => (
                <div key={option.value} className="flex items-center justify-between gap-4 border-b border-outline-variant/15 px-4 py-3 last:border-0">
                  <span className="text-sm">{option.label}</span>
                  <span className="text-lg font-bold text-primary">{option.bobot}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setRubricOpen(false)} className="w-full mt-5 py-3 rounded-full bg-primary text-white font-bold">Saya mengerti</button>
          </div>
        </div>
      )}
    </div>
  )
}

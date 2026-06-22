'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileDown, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { expectedPhaseFromClass, TRACKING_LEVELS, type CurriculumPhase } from '@/lib/ppi-v2-data'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  area: string
  tujuan: string
  target: number
  jenis_target: 'akademik' | 'non_akademik'
  cp_id: string | null
  fase_adaptasi: string | null
  kriteria_tuntas: string | null
}

type Tracking = {
  tujuan_ppi_id: string
  tanggal: string
  sesi_ke: number
  kode_bantuan: string
  benar: number | null
  total: number | null
}

type Result = Goal & {
  value: number
  recommendation: 'lanjut' | 'remedial'
  narrative?: string
}

export default function EvaluasiRaporPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<{ nama: string; kategori: string; status_diagnosis: string } | null>(null)
  const [classPhase, setClassPhase] = useState<CurriculumPhase | null>(null)
  const [curriculum, setCurriculum] = useState<Array<{ id: string; mata_pelajaran: string; nama_elemen: string }>>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [tracking, setTracking] = useState<Tracking[]>([])
  const [team, setTeam] = useState<Array<{ nama: string; peran: string }>>([])
  const [analysis, setAnalysis] = useState<{ ringkasan_semester: string; rekomendasi_guru: string[]; rekomendasi_orang_tua: string[] } | null>(null)
  const [narratives, setNarratives] = useState<Record<string, { narrative: string; recommendation: 'lanjut' | 'remedial' }>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    async function load() {
      const [studentResult, ppiResult, trackingResult, teamResult] = await Promise.all([
        supabase.from('siswa').select('nama, kategori, status_diagnosis, kelas(nama, jenjang, tingkat)').eq('id', params.id).single(),
        supabase.from('ppi').select('id').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('daily_tracking').select('tujuan_ppi_id, tanggal, sesi_ke, kode_bantuan, benar, total').eq('siswa_id', params.id).order('sesi_ke'),
        supabase.from('ppi_teams').select('nama, peran').eq('siswa_id', params.id),
      ])
      setStudent(studentResult.data)
      const classData = studentResult.data?.kelas as unknown as { nama: string; jenjang: string; tingkat: number | null } | null
      setClassPhase(classData ? expectedPhaseFromClass(classData.nama, classData.jenjang, classData.tingkat) : null)
      setTracking((trackingResult.data || []) as Tracking[])
      setTeam(teamResult.data || [])
      if (ppiResult.data) {
        const [{ data }, { data: cpRows }] = await Promise.all([
          supabase.from('tujuan_ppi').select('id, area, tujuan, target, jenis_target, cp_id, fase_adaptasi, kriteria_tuntas').eq('ppi_id', ppiResult.data.id).order('created_at'),
          supabase.from('curriculum_cp').select('id, mata_pelajaran, nama_elemen'),
        ])
        setGoals((data || []) as Goal[])
        setCurriculum(cpRows || [])
      }
      setLoading(false)
    }
    void load()
  }, [user, authLoading, router, params.id])

  const results = useMemo<Result[]>(() => goals.map((goal) => {
    const logs = tracking.filter((item) => item.tujuan_ppi_id === goal.id)
    let value = 0
    if (goal.jenis_target === 'akademik') {
      const bySession = new Map<number, { benar: number; total: number }>()
      logs.forEach((item) => {
        if (item.benar !== null && item.total) bySession.set(item.sesi_ke, { benar: item.benar, total: item.total })
      })
      const attempts = Array.from(bySession.values())
      const correct = attempts.reduce((sum, item) => sum + item.benar, 0)
      const total = attempts.reduce((sum, item) => sum + item.total, 0)
      value = total ? Math.round((correct / total) * 100) : 0
    } else {
      const scores: number[] = logs.map((item) => Number(TRACKING_LEVELS.find((level) => level.code === item.kode_bantuan)?.score || 0))
      value = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    }
    return { ...goal, value, recommendation: value >= goal.target ? 'lanjut' : 'remedial' }
  }), [goals, tracking])

  if (authLoading || !user || loading) return <FullPageLoading label="Menghitung evaluasi PPI..." />

  async function generate() {
    if (!student || results.length === 0) return
    setGenerating(true)
    setError('')
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluation-v2', student, results, team }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Narasi evaluasi belum berhasil dibuat.')
      const fallbackGuru = [
        'Fokus pada penguatan area yang masih di bawah target secara bertahap.',
        'Gunakan variasi media pembelajaran untuk menjaga minat dan konsentrasi siswa.',
        'Libatkan siswa dalam aktivitas yang mengembangkan kemandirian dan kepercayaan diri.',
      ]
      const fallbackOrtu = [
        'Dampingi anak saat mengulang pelajaran di rumah dengan suasana yang menyenangkan.',
        'Berikan penguatan positif setiap kali anak menunjukkan kemajuan, sekecil apa pun.',
        'Komunikasikan dengan guru secara berkala untuk memantau perkembangan anak.',
      ]
      setAnalysis({
        ringkasan_semester: result.ringkasan_semester,
        rekomendasi_guru: Array.isArray(result.rekomendasi_guru) && result.rekomendasi_guru.length > 0 ? result.rekomendasi_guru : fallbackGuru,
        rekomendasi_orang_tua: Array.isArray(result.rekomendasi_orang_tua) && result.rekomendasi_orang_tua.length > 0 ? result.rekomendasi_orang_tua : fallbackOrtu,
      })
      const map: Record<string, { narrative: string; recommendation: 'lanjut' | 'remedial' }> = {}
      for (const item of result.evaluasi_target || []) map[item.tujuan_id] = { narrative: item.narasi, recommendation: item.rekomendasi }
      setNarratives(map)
      const period = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      await supabase.from('evaluations').delete().eq('siswa_id', params.id).eq('periode', period)
      await supabase.from('evaluations').insert(results.map((item) => ({
        siswa_id: params.id,
        tujuan_ppi_id: item.id,
        periode: period,
        jenis_target: item.jenis_target,
        nilai_angka: item.jenis_target === 'akademik' ? item.value : null,
        ketercapaian: item.value,
        narasi: map[item.id]?.narrative || 'Narasi belum tersedia.',
        rekomendasi: map[item.id]?.recommendation || item.recommendation,
        model: 'deepseek-chat',
      })))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Narasi evaluasi belum berhasil dibuat.')
    } finally {
      setGenerating(false)
    }
  }

  function goalTitle(goal: Goal) {
    if (goal.jenis_target !== 'akademik') return goal.area
    const cp = curriculum.find((item) => item.id === goal.cp_id)
    if (cp) return `${cp.mata_pelajaran} (${cp.nama_elemen})`
    if (goal.area.toLowerCase().includes('membaca')) return 'Bahasa Indonesia (Membaca)'
    if (goal.area.toLowerCase().includes('menulis')) return 'Bahasa Indonesia (Menulis)'
    if (goal.area.toLowerCase().includes('matematika') || goal.area.toLowerCase().includes('berhitung')) return 'Matematika'
    return goal.area.replace(' · ', ' (') + (goal.area.includes(' · ') ? ')' : '')
  }

  return <div className="min-h-screen bg-[#FAFAF5] print:bg-white">
    {generating && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm"><div className="rounded-3xl bg-white p-8 text-center shadow-2xl"><LoadingSpinner label="Menyusun evaluasi..." /><p className="mt-4 text-sm text-on-surface-variant">AI sedang menganalisis data tracking dan menyusun narasi.</p></div></div>}
    <header className="app-header print:hidden"><nav className="app-nav"><a href={`/dashboard/siswa/${params.id}`} className="text-on-surface-variant">← Profil</a><BrandLogo compact mobileIconOnly /></nav></header>
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:pt-28 print:pt-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="text-xs font-bold text-primary">EVALUASI PROGRAM PEMBELAJARAN INDIVIDUAL</div><h1 className="mt-1 text-3xl font-bold">{student?.nama}</h1><p className="mt-1 text-on-surface-variant">Periode {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>
        <div className="flex gap-2 print:hidden"><button onClick={generate} disabled={generating || tracking.length === 0} className="rounded-full bg-primary px-5 py-3 font-bold text-white disabled:opacity-40"><Sparkles className="mr-2 inline h-4 w-4" />Buat narasi</button><button onClick={() => window.print()} className="rounded-full bg-surface-container-high px-5 py-3 font-bold"><FileDown className="mr-2 inline h-4 w-4" />Cetak / PDF</button></div>
      </div>
      {error && <div className="mt-4 rounded-2xl bg-error-container p-4 text-sm text-error">{error}</div>}
      {tracking.length === 0 && <div className="mt-6 rounded-3xl border-2 border-dashed bg-white p-8 text-center"><h2 className="font-bold">Belum ada tracking harian</h2><p className="mt-1 text-sm text-on-surface-variant">Rekomendasi penilaian dan evaluasi akan muncul setelah guru mencatat pelaksanaan target.</p></div>}

      <div className="mt-6 space-y-4">
        {results.map((item) => <section key={item.id} className="rounded-3xl border bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-xs font-bold text-primary">{goalTitle(item)}</div><div className="mt-2 flex flex-wrap gap-2">{item.jenis_target === 'akademik' && classPhase && <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">Fase kelas {classPhase}</span>}{item.fase_adaptasi && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Adaptasi CP Fase {item.fase_adaptasi}</span>}{item.jenis_target === 'non_akademik' && <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">Target non-akademik</span>}</div><h2 className="mt-3 text-lg font-bold">{item.tujuan}</h2><p className="mt-2 text-xs text-on-surface-variant">{item.kriteria_tuntas}</p></div><div className="shrink-0 text-left sm:text-right"><div className="text-4xl font-bold">{item.value}%</div><div className="max-w-[180px] text-xs text-on-surface-variant">{item.jenis_target === 'akademik' ? 'Rekomendasi nilai berdasarkan benar ÷ total' : 'Ketercapaian target individual'}</div></div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full bg-primary" style={{ width: `${item.value}%` }} /></div>
          <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${item.value >= item.target ? 'bg-secondary-container/40 text-secondary' : 'bg-tertiary-fixed/40 text-tertiary'}`}>{item.value >= item.target ? 'Lanjut / pengayaan' : 'Ulang / remedial'}</div>
          {narratives[item.id] && <p className="mt-4 leading-relaxed">{narratives[item.id].narrative}</p>}
          {item.jenis_target === 'akademik' && <p className="mt-4 rounded-2xl bg-primary/5 p-3 text-xs leading-relaxed text-on-surface-variant">Angka ini merupakan rekomendasi sistem berdasarkan bukti tracking pada target PPI. Guru tetap meninjau konteks pembelajaran dan mengesahkan nilai akhir mata pelajaran.</p>}
        </section>)}
      </div>

      {analysis && <div className="mt-6 space-y-4">
        <section className="rounded-3xl bg-primary/5 p-5 sm:p-6"><h2 className="font-bold">Ringkasan perkembangan</h2><p className="mt-3 leading-relaxed">{analysis.ringkasan_semester}</p></section>
        <div className="grid gap-4 md:grid-cols-2"><section className="rounded-3xl bg-[#E4F8EE] p-5"><h2 className="font-bold">Rekomendasi guru</h2>{analysis.rekomendasi_guru.length > 0 ? <ul className="mt-3 space-y-2 text-sm">{analysis.rekomendasi_guru.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{item}</li>)}</ul> : <p className="mt-3 text-sm text-on-surface-variant">Klik <strong>Buat narasi</strong> lagi untuk mendapatkan rekomendasi guru, atau isi manual.</p>}</section><section className="rounded-3xl bg-tertiary-fixed/30 p-5"><h2 className="font-bold">Rekomendasi orang tua</h2>{analysis.rekomendasi_orang_tua.length > 0 ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{analysis.rekomendasi_orang_tua.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-3 text-sm text-on-surface-variant">Klik <strong>Buat narasi</strong> lagi untuk mendapatkan rekomendasi orang tua, atau isi manual.</p>}</section></div>
      </div>}
    </main>
  </div>
}

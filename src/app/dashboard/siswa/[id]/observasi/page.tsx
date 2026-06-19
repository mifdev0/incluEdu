'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DIMENSI_UNIVERSAL, DIMENSI_KHUSUS, type KategoriABK } from '@/lib/observasi-schema'
import { BrandLogo } from '@/components/brand-logo'
import { supabase } from '@/lib/supabase'
import { FullPageLoading } from '@/components/loading-state'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ObservasiSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [kategori, setKategori] = useState<KategoriABK>('lainnya')
  const [studentName, setStudentName] = useState('Siswa')
  const [week, setWeek] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dimensiKhusus = DIMENSI_KHUSUS[kategori] || []
  const semuaDimensi = [...DIMENSI_UNIVERSAL, ...dimensiKhusus]
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [catatan, setCatatan] = useState('')
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) {
      supabase.from('siswa').select('nama, kategori').eq('id', params.id).single().then(({ data }) => {
        if (data) {
          setStudentName(data.nama)
          const supported = ['slow_learner', 'disleksia', 'adhd', 'autisme', 'sensorik', 'lainnya']
          setKategori((supported.includes(data.kategori) ? data.kategori : 'lainnya') as KategoriABK)
        }
      })
      supabase.from('observasi').select('id', { count: 'exact', head: true }).eq('siswa_id', params.id).then(({ count }) => setWeek((count || 0) + 1))
    }
  }, [user, authLoading, router, params.id])
  if (authLoading || !user) return <FullPageLoading label="Menyiapkan observasi..." />

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
    const { error: insertError } = await supabase.from('observasi').insert({
      siswa_id: params.id,
      guru_id: user.id,
      minggu_ke: week,
      jawaban,
      catatan: catatan.trim() || null,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setCompleted(true)
  }

  const FormContent = () => {
    if (step < total) {
      return (
        <div className="bg-surface rounded-3xl p-5 sm:p-lg border border-outline-variant/20 hard-shadow">
          <p className="text-xs font-label-sm text-primary uppercase tracking-wider mb-1">{pertanyaanSaatIni.label}</p>
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
            Data minggu ke-{week} sudah masuk ke profil {studentName}. Grafik akan terbentuk setelah tersedia minimal dua observasi.
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
          <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">{kategori}</span>
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DIMENSI_UNIVERSAL, DIMENSI_KHUSUS, type KategoriABK } from '@/lib/observasi-schema'
import { BrandLogo } from '@/components/brand-logo'

export default function ObservasiSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const kategori: KategoriABK = 'slow_learner'
  const dimensiKhusus = DIMENSI_KHUSUS[kategori] || []
  const semuaDimensi = [...DIMENSI_UNIVERSAL, ...dimensiKhusus]
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [catatan, setCatatan] = useState('')
  const [step, setStep] = useState(0)

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])
  if (authLoading || !user) return null

  const pertanyaanSaatIni = semuaDimensi[step]
  const total = semuaDimensi.length
  const terjawab = Object.keys(jawaban).length
  const pct = Math.round((terjawab / total) * 100)
  const semuaTerisi = semuaDimensi.every(d => jawaban[d.key])

  function pilih(key: string, value: string) {
    setJawaban(prev => ({ ...prev, [key]: value }))
    if (step < total - 1) setTimeout(() => setStep(step + 1), 150)
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); router.push(`/dashboard/siswa/${params.id}`) }

  const FormContent = () => {
    if (step < total) {
      return (
        <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
          <p className="text-xs font-label-sm text-primary uppercase tracking-wider mb-1">{pertanyaanSaatIni.label}</p>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-md">{pertanyaanSaatIni.pertanyaan}</p>
          <div className="space-y-2">
            {pertanyaanSaatIni.opsi.map((o) => (
              <button key={o.value} type="button" onClick={() => pilih(pertanyaanSaatIni.key, o.value)}
                className={`w-full text-left px-5 py-3.5 rounded-full text-body-md font-body-md transition-all ${
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
        <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Review Jawaban</h3>
          <p className="text-on-surface-variant font-body-md text-body-md mb-md">Periksa kembali sebelum menyimpan.</p>
          {semuaDimensi.map((d) => (
            <div key={d.key} className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
              <span className="text-on-surface font-body-md text-body-md">{d.label}</span>
              <span className="text-primary font-label-md text-label-md">{d.opsi.find(o => o.value === jawaban[d.key])?.label}</span>
            </div>
          ))}
          <div className="mt-md">
            <label className="block text-on-surface font-body-md text-body-md mb-2">Catatan (opsional)</label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/40 text-body-md font-body-md resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" rows={3} placeholder="Tulis catatan tambahan..." />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3">
          <button type="button" onClick={() => setStep(0)} className="w-full px-6 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all">Ubah Jawaban</button>
          <button type="submit" disabled={!semuaTerisi} className="w-full py-3.5 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">Simpan Observasi</button>
        </div>
      </form>
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
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Budi Santoso</h2>
          <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">Slow Learner</span>
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md mb-lg">Observasi Minggu ke-3</p>

        {/* Progress Bar */}
        <div className="mb-lg">
          <div className="flex justify-between text-on-surface-variant font-label-md text-label-md mb-1.5">
            <span>Pertanyaan {terjawab} dari {total}</span>
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

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { PANDUAN_ABK } from '@/lib/panduan-data'
import { Lightbulb } from 'lucide-react'

export default function PanduanSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const kategori = 'slow_learner'
  const panduan = PANDUAN_ABK[kategori]
  const semuaTercheck = panduan?.adaptasi_mengajar.every((_, i) => checked[i])

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])
  if (authLoading || !user) return null

  function handleConfirm() { router.push(`/dashboard/siswa/${params.id}/observasi`) }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="flex items-center gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← Profil</a>
            <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-3xl mx-auto px-gutter pb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Panduan Mengajar</h2>

        <div className="space-y-lg">
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{panduan?.judul}</h3>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{panduan?.deskripsi}</p>
          </div>

          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Checklist Adaptasi Mengajar</h4>
            <p className="text-on-surface-variant font-body-md text-body-md mb-md">Centang setiap adaptasi yang sudah Anda terapkan:</p>
            <div className="space-y-2">
              {panduan?.adaptasi_mengajar.map((item, i) => (
                <label key={i} className={`flex items-start gap-3 p-3.5 rounded-full cursor-pointer transition-all ${checked[i] ? 'bg-secondary-container/30 border border-secondary-container' : 'bg-surface-container-low border border-transparent'}`}>
                  <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))} className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
                  <span className="text-on-surface font-body-md text-body-md leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Tips Observasi</h4>
            <ul className="space-y-2">
              {panduan?.tips_observasi.map((tip, i) => (
                <li key={i} className="text-on-surface-variant font-body-md text-body-md flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={handleConfirm} disabled={!semuaTercheck}
            className="w-full py-4 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Saya sudah menerapkan ini selama minimal 1 minggu
          </button>
          {!semuaTercheck && (
            <p className="text-sm text-tertiary text-center font-label-md">Centang semua adaptasi mengajar untuk melanjutkan</p>
          )}
        </div>
      </main>
    </div>
  )
}

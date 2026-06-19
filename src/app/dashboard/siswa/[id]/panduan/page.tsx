'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { PANDUAN_ABK } from '@/lib/panduan-data'
import { Lightbulb } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'

export default function PanduanSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [studentName, setStudentName] = useState('')
  const [kategori, setKategori] = useState('lainnya')
  const [dataLoading, setDataLoading] = useState(true)
  const panduan = PANDUAN_ABK[kategori]
  const semuaTercheck = panduan?.adaptasi_mengajar.every((_, i) => checked[i])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) {
      supabase.from('siswa').select('nama, kategori').eq('id', params.id).single().then(({ data }) => {
        if (data) {
          setStudentName(data.nama)
          setKategori(['slow_learner', 'disleksia', 'adhd', 'autisme'].includes(data.kategori)
            ? data.kategori
            : ['tunanetra', 'tunarungu'].includes(data.kategori) ? 'sensorik' : 'lainnya')
        }
        setDataLoading(false)
      })
    }
  }, [user, authLoading, router, params.id])
  if (authLoading || !user || dataLoading) return <FullPageLoading label="Memuat panduan..." />

  function handleConfirm() { router.push(`/dashboard/siswa/${params.id}/observasi`) }

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

      <main className="pt-24 sm:pt-28 max-w-3xl mx-auto px-4 sm:px-gutter pb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Panduan Mengajar</h2>
        <p className="text-on-surface-variant mb-lg">{studentName}</p>

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
                <label key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl sm:rounded-full cursor-pointer transition-all ${checked[i] ? 'bg-secondary-container/30 border border-secondary-container' : 'bg-surface-container-low border border-transparent'}`}>
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

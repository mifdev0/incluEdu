'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="flex items-center gap-4">
            <a href="/dashboard/kelas/1" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← Kembali</a>
            <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-3xl mx-auto px-gutter pb-xl">
        <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow mb-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-pastel-purple text-primary flex items-center justify-center font-display text-headline-md shrink-0">B</div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Budi Santoso</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">Slow Learner</span>
                <span className="text-xs text-on-secondary-container bg-secondary-container/40 px-3 py-1 rounded-full font-label-sm">Panduan sudah dibaca</span>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md">Butuh penjelasan berulang dan waktu tambahan untuk memahami materi.</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href={`/dashboard/siswa/${params.id}/panduan`} className="px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all">Lihat Panduan</a>
          <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-6 py-3 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Isi Observasi</a>
          <a href={`/dashboard/siswa/${params.id}/rapor`} className="px-6 py-3 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Lihat Rapor</a>
        </div>
      </main>
    </div>
  )
}

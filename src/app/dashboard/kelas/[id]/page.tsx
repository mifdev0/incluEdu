'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const siswaData = [
  { id: '1', nama: 'Budi Santoso', kategori: 'Slow Learner', trend: 'membaik' as const, terakhir: '3 hari lalu' },
  { id: '2', nama: 'Siti Nurhaliza', kategori: 'Disleksia', trend: 'stagnan' as const, terakhir: '1 minggu lalu' },
  { id: '3', nama: 'Ahmad Rizki', kategori: 'ADHD', trend: 'menurun' as const, terakhir: '5 hari lalu' },
]

export default function DetailKelasPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])
  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← Dashboard</a>
            <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          </div>
          <button onClick={() => router.push('/login')} className="text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md">Keluar</button>
        </nav>
      </header>

      <main className="pt-28 max-w-container-max mx-auto px-gutter pb-xl">
        <div className="mb-lg">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">Kelas 7A</h2>
            <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">SMP</span>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full font-label-sm">2025/2026</span>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md">ID Kelompok: {params.id} · 3 siswa didampingi</p>
        </div>

        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Siswa dalam pendampingan</h3>
        <div className="space-y-3 mb-xl">
          {siswaData.map((siswa, i) => {
            const colors = ['bg-pastel-purple', 'bg-pastel-green', 'bg-pastel-yellow']
            return (
              <div key={siswa.id} className={`${colors[i]} rounded-xl p-md border border-primary/10 hard-shadow`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/60 text-primary flex items-center justify-center font-display text-headline-sm shrink-0">{siswa.nama.charAt(0)}</div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">{siswa.nama}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-primary bg-white/60 px-3 py-1 rounded-full font-label-sm">{siswa.kategori}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-label-sm ${
                          siswa.trend === 'membaik' ? 'text-on-secondary-container bg-secondary-container/40' :
                          siswa.trend === 'stagnan' ? 'text-tertiary bg-tertiary-container/30' : 'text-error bg-error-container/40'
                        }`}>
                          {siswa.trend === 'membaik' ? '↑ Membaik' : siswa.trend === 'stagnan' ? '→ Stagnan' : '↓ Menurun'}
                        </span>
                        <span className="text-xs text-on-surface-variant opacity-70">Observasi: {siswa.terakhir}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-16 sm:ml-0 flex-wrap">
                    <a href={`/dashboard/siswa/${siswa.id}`} className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/90 text-on-surface font-label-md text-label-md transition-all">Profil</a>
                    <a href={`/dashboard/siswa/${siswa.id}/panduan`} className="px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary font-label-md text-label-md transition-all">Observasi</a>
                    <a href={`/dashboard/siswa/${siswa.id}/rapor`} className="px-4 py-2 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Rapor</a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </main>
    </div>
  )
}

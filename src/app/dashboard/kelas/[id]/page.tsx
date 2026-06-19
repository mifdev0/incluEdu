'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { ProgressSparkline } from '@/components/progress-chart'
import { STUDENT_PROGRESS } from '@/lib/student-progress-data'

const siswaData = Object.values(STUDENT_PROGRESS)

export default function DetailKelasPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])
  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href="/dashboard" className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Dashboard</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          <button onClick={() => router.push('/login')} className="shrink-0 px-3 py-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors font-label-md text-label-md">Keluar</button>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <div className="mb-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
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
              <div key={siswa.id} className={`${colors[i]} rounded-3xl p-5 sm:p-md border border-primary/10 hard-shadow`}>
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
                  <div className="flex w-full sm:w-auto flex-col items-stretch sm:items-end gap-3 sm:ml-0">
                    <div className="self-end bg-white/50 rounded-2xl px-3 py-1">
                      <ProgressSparkline data={siswa.progress} trend={siswa.trend} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                    <a href={`/dashboard/siswa/${siswa.id}`} className="px-3 sm:px-4 py-2 text-center rounded-full bg-white/60 hover:bg-white/90 text-on-surface font-label-md text-label-md transition-all">Profil</a>
                    <a href={`/dashboard/siswa/${siswa.id}/panduan`} className="px-3 sm:px-4 py-2 text-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary font-label-md text-label-md transition-all">Observasi</a>
                    <a href={`/dashboard/siswa/${siswa.id}/rapor`} className="px-3 sm:px-4 py-2 text-center rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Rapor</a>
                    </div>
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

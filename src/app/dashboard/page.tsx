'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const kelasData = [
  { id: '1', nama: 'Kelas 7A', jenjang: 'SMP', total: 32, abk: 3, trend: { membaik: 2, stagnan: 1, menurun: 0 } },
  { id: '2', nama: 'Kelas 7B', jenjang: 'SMP', total: 30, abk: 1, trend: { membaik: 1, stagnan: 0, menurun: 0 } },
  { id: '3', nama: 'Kelas 8A', jenjang: 'SMP', total: 28, abk: 2, trend: { membaik: 0, stagnan: 1, menurun: 1 } },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  const totalAbk = kelasData.reduce((s, k) => s + k.abk, 0)
  const totalSiswa = kelasData.reduce((s, k) => s + k.total, 0)

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Top Nav */}
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-on-surface-variant font-label-md text-label-md">{user.nama}</span>
            <button onClick={logout} className="text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md">Keluar</button>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-container-max mx-auto px-gutter pb-xl">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">Kelola kelas dan pantau perkembangan siswa ABK</p>
          </div>
          <a href="/dashboard/kelas/baru" className="bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-gutter py-3 rounded-full font-label-md text-label-md shadow-sm">
            + Kelas Baru
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-xl">
          {[
            { label: 'Total Kelas', value: kelasData.length, color: 'text-primary' },
            { label: 'Total Siswa', value: totalSiswa, color: 'text-on-surface' },
            { label: 'Siswa ABK', value: totalAbk, color: 'text-on-secondary-container' },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-xl p-md border border-outline-variant/20 hard-shadow">
              <div className={`font-display text-display-lg-mobile font-bold ${s.color}`}>{s.value}</div>
              <div className="text-on-surface-variant font-label-md text-label-md">{s.label}</div>
            </div>
          ))}
        </div>

        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Kelas Anda</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {kelasData.map((kelas, i) => {
            const pastels = ['bg-pastel-purple', 'bg-pastel-green', 'bg-pastel-yellow']
            return (
              <div key={kelas.id} className={`${pastels[i]} rounded-xl p-md border border-primary/10 hard-shadow`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">{kelas.nama}</h4>
                    <span className="inline-block text-xs text-primary bg-white/60 px-3 py-1 rounded-full font-label-md mt-1">{kelas.jenjang}</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md text-body-md mb-3">{kelas.total} siswa · {kelas.abk} ABK</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {kelas.trend.membaik > 0 && <span className="text-xs text-on-secondary-container bg-secondary-container/40 px-3 py-1 rounded-full font-label-sm">↑ {kelas.trend.membaik} membaik</span>}
                  {kelas.trend.stagnan > 0 && <span className="text-xs text-tertiary bg-tertiary-container/30 px-3 py-1 rounded-full font-label-sm">→ {kelas.trend.stagnan} stagnan</span>}
                  {kelas.trend.menurun > 0 && <span className="text-xs text-error bg-error-container/40 px-3 py-1 rounded-full font-label-sm">↓ {kelas.trend.menurun} menurun</span>}
                </div>
                <a href={`/dashboard/kelas/${kelas.id}`} className="block w-full text-center py-3 bg-white/60 hover:bg-white/90 rounded-full font-label-md text-label-md text-on-surface transition-all">
                  Buka Kelas
                </a>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

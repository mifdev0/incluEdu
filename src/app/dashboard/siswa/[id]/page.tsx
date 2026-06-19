'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { ProgressChart } from '@/components/progress-chart'
import { getStudentProgress } from '@/lib/student-progress-data'
import { ArrowUpRight, Brain, Heart, MessageCircle, Target } from 'lucide-react'
import { getPpiGoals } from '@/lib/ppi-data'

export default function ProfilSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  if (loading || !user) return null
  const siswa = getStudentProgress(params.id)
  const latest = siswa.progress[siswa.progress.length - 1]
  const first = siswa.progress[0]
  const average = Math.round((latest.kognitif + latest.fokus + latest.sosial + latest.emosi) / 4)
  const previousAverage = Math.round((first.kognitif + first.fokus + first.sosial + first.emosi) / 4)
  const change = average - previousAverage
  const ppiGoals = getPpiGoals(params.id)

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href="/dashboard/kelas/1" className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Kembali</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <div className="bg-surface rounded-[2rem] p-md md:p-lg border border-outline-variant/20 mb-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-pastel-purple text-primary flex items-center justify-center font-display text-headline-md shrink-0">{siswa.nama.charAt(0)}</div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{siswa.nama}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-label-sm">{siswa.kategori}</span>
                <span className="text-xs text-on-secondary-container bg-secondary-container/40 px-3 py-1 rounded-full font-label-sm">Panduan sudah dibaca</span>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md">{siswa.deskripsi}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-md">
          <div className="col-span-2 lg:col-span-1 rounded-2xl bg-primary text-white p-4">
            <div className="text-sm text-white/75">Rata-rata saat ini</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold">{average}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {change >= 0 ? '+' : ''}{change}
              </span>
            </div>
          </div>
          {[
            { label: 'Kognitif', value: latest.kognitif, icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Fokus', value: latest.fokus, icon: Target, color: 'text-cyan-700', bg: 'bg-cyan-100' },
            { label: 'Sosial', value: latest.sosial, icon: MessageCircle, color: 'text-secondary', bg: 'bg-secondary-container/40' },
            { label: 'Emosi', value: latest.emosi, icon: Heart, color: 'text-amber-700', bg: 'bg-amber-100' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white border border-outline-variant/20 p-4">
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-on-surface">{item.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <section className="bg-white rounded-[2rem] p-md md:p-lg border border-outline-variant/20 mb-md">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Grafik perkembangan</h3>
              <p className="text-sm text-on-surface-variant mt-1">Perubahan berdasarkan hasil observasi empat minggu terakhir.</p>
            </div>
            <span className={`w-fit text-sm px-4 py-2 rounded-full font-label-md ${
              siswa.trend === 'membaik' ? 'text-on-secondary-container bg-secondary-container/40' :
              siswa.trend === 'stagnan' ? 'text-tertiary bg-tertiary-fixed/40' : 'text-error bg-error-container/50'
            }`}>
              {siswa.trend === 'membaik' ? '↑ Membaik' : siswa.trend === 'stagnan' ? '→ Stabil' : '↓ Perlu perhatian'}
            </span>
          </div>
          <ProgressChart data={siswa.progress} />
        </section>

        <section className="bg-[#F1E8FF] rounded-[2rem] p-5 sm:p-md border border-primary/10 mb-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary">PROGRAM PEMBELAJARAN INDIVIDUAL</span>
              <h3 className="font-headline-sm text-headline-sm mt-1">{ppiGoals.length} tujuan sedang dipantau</h3>
              <p className="text-sm text-on-surface-variant mt-1">Tujuan observasi disesuaikan dengan kemampuan awal dan kebutuhan siswa.</p>
            </div>
            <a href={`/dashboard/siswa/${params.id}/ppi`} className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-full bg-white text-primary text-center font-bold">Buka PPI</a>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <a href={`/dashboard/siswa/${params.id}/ppi`} className="px-6 py-3 text-center rounded-full bg-primary-fixed text-primary font-label-md text-label-md transition-all">Lihat PPI</a>
          <a href={`/dashboard/siswa/${params.id}/panduan`} className="px-6 py-3 text-center rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all">Lihat Panduan</a>
          <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-6 py-3 text-center rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Isi Observasi</a>
          <a href={`/dashboard/siswa/${params.id}/rapor`} className="px-6 py-3 text-center rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Lihat Rapor</a>
        </div>
      </main>
    </div>
  )
}

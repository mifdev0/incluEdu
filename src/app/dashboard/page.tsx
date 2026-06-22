'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, FileCheck2, Plus, Sparkles, UsersRound } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { FullPageLoading } from '@/components/loading-state'

type ClassCard = { id: string; nama: string; jenjang: string; siswa: number; tracking: number; warna: string; aksen: string; namaSiswa: string[] }
type AttentionStudent = { id: string; nama: string; days: number | null }

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [kelasData, setKelasData] = useState<ClassCard[]>([])
  const [activeGoals, setActiveGoals] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [attentionStudents, setAttentionStudents] = useState<AttentionStudent[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (user) {
      Promise.all([
        supabase.from('kelas').select('id, nama, jenjang').order('created_at'),
        supabase.from('siswa').select('id, nama, kelas_id, daily_tracking(tanggal)'),
        supabase.from('tujuan_ppi').select('id, ppi!inner(siswa!inner(guru_id))').neq('status', 'tercapai'),
        supabase.from('daily_tracking').select('id, siswa_id, sesi_ke, siswa!inner(kelas_id)').gte('tanggal', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
      ]).then(([classesResult, studentsResult, goalsResult, observationsResult]) => {
        const students = studentsResult.data || []
        const observations = observationsResult.data || []
        const colors = [
          { warna: 'bg-[#F1E8FF]', aksen: 'text-primary' },
          { warna: 'bg-[#E3F7ED]', aksen: 'text-secondary' },
          { warna: 'bg-[#FFF3C9]', aksen: 'text-tertiary' },
        ]
        setKelasData((classesResult.data || []).map((item, index) => {
          const classStudents = students.filter((student) => student.kelas_id === item.id)
          return {
            ...item,
            siswa: classStudents.length,
            tracking: new Set(observations
              .filter((observation) => (observation.siswa as unknown as { kelas_id: string })?.kelas_id === item.id)
              .map((observation) => `${observation.siswa_id}_${observation.sesi_ke}`)).size,
            namaSiswa: classStudents.slice(0, 3).map((student) => student.nama),
            ...colors[index % colors.length],
          }
        }))
        setActiveGoals(goalsResult.data?.length || 0)
        setAttentionStudents(students.map((student) => {
          const dates = ((student.daily_tracking || []) as Array<{ tanggal: string }>).map((item) => new Date(item.tanggal).getTime())
          const latest = dates.length > 0 ? Math.max(...dates) : null
          return {
            id: student.id,
            nama: student.nama,
            days: latest === null ? null : Math.floor((Date.now() - latest) / 86400000),
          }
        }).filter((student) => student.days === null || student.days >= 7).sort((a, b) => (b.days ?? 9999) - (a.days ?? 9999)).slice(0, 3))
        setDataLoading(false)
      })
    }
  }, [user, loading, router])

  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat dashboard..." />

  const totalSiswa = kelasData.reduce((s, k) => s + k.siswa, 0)
  const observasiMingguIni = kelasData.reduce((s, k) => s + k.tracking, 0)
  const firstName = user.nama.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{user.nama.charAt(0)}</div>
              <span className="text-on-surface-variant font-label-md text-label-md">{user.nama}</span>
            </div>
            <button onClick={logout} className="px-3 py-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors font-label-md text-label-md">Keluar</button>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-primary text-on-primary p-5 sm:p-md md:p-lg mb-md">
          <div className="absolute -right-14 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute right-40 -bottom-20 w-40 h-40 rounded-full bg-pastel-yellow/20" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-on-primary/80 font-label-md text-label-md mb-2">
                <Sparkles className="w-4 h-4" />
                Ruang pendampingan Anda
              </div>
              <h1 className="font-display text-[32px] leading-tight md:text-display-lg mb-2">Selamat datang, {firstName}.</h1>
              <p className="text-on-primary/80 text-base sm:text-body-lg">Susun PPI, pantau tujuan individual, dan tindak lanjuti perkembangan setiap siswa.</p>
            </div>
            <a href="/dashboard/siswa/baru" className="w-full md:w-auto shrink-0 bg-white text-primary hover:bg-primary-fixed px-5 py-3.5 rounded-full font-label-md text-label-md shadow-sm inline-flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Tambah siswa
            </a>
          </div>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-lg">
          {[
            { label: 'Kelas pendampingan', value: kelasData.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Siswa didampingi', value: totalSiswa, icon: UsersRound, color: 'text-secondary', bg: 'bg-secondary-container/40' },
            { label: 'Tujuan PPI aktif', value: activeGoals, icon: FileCheck2, color: 'text-cyan-700', bg: 'bg-cyan-100' },
            { label: 'Tracking minggu ini', value: observasiMingguIni, icon: ClipboardCheck, color: 'text-tertiary', bg: 'bg-tertiary-fixed/40' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-on-surface">{s.value}</div>
                <div className="text-on-surface-variant font-label-md text-label-md">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-md items-start">
          <section>
            <div className="flex items-end justify-between mb-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Kelas siswa</h2>
                <p className="text-on-surface-variant text-sm mt-1">Pilih kelas untuk membuka profil, PPI, dan perkembangan siswa.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-md">
              {kelasData.length === 0 && (
                <div className="sm:col-span-2 rounded-3xl border-2 border-dashed border-outline-variant/40 p-8 text-center">
                  <h3 className="font-bold text-lg">Belum ada kelas</h3>
                  <p className="text-sm text-on-surface-variant mt-1 mb-4">Buat kelas terlebih dahulu sebelum menambahkan siswa.</p>
                  <a href="/dashboard/kelas/baru" className="inline-flex px-5 py-3 rounded-full bg-primary text-white font-bold">Buat kelas</a>
                </div>
              )}
              {kelasData.map((kelas) => (
              <article key={kelas.id} className={`${kelas.warna} rounded-3xl sm:rounded-[2rem] p-5 sm:p-md border border-white transition-transform duration-300 hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">{kelas.nama}</h4>
                    <span className={`inline-block text-xs ${kelas.aksen} bg-white/70 px-3 py-1 rounded-full font-label-md mt-1`}>{kelas.jenjang}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {kelas.namaSiswa.map((nama) => <div key={nama} title={nama} className="w-9 h-9 rounded-full border-2 border-white bg-white/80 flex items-center justify-center text-xs font-bold text-on-surface">{nama.charAt(0)}</div>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-md">
                  <div className="bg-white/60 rounded-2xl p-3">
                    <div className="font-bold text-on-surface">{kelas.siswa}</div>
                    <div className="text-xs text-on-surface-variant">siswa didampingi</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3">
                    <div className="font-bold text-on-surface">{kelas.tracking}</div>
                    <div className="text-xs text-on-surface-variant">tracking baru</div>
                  </div>
                </div>
                <a href={`/dashboard/kelas/${kelas.id}`} className="flex w-full items-center justify-between py-3 px-4 bg-white/70 hover:bg-white rounded-full font-label-md text-label-md text-on-surface transition-colors">
                  Buka kelas
                  <ArrowRight className="w-4 h-4" />
                </a>
              </article>
              ))}
            </div>
          </section>

          <aside className="bg-white rounded-[2rem] p-md border border-outline-variant/20">
            <div className="w-11 h-11 rounded-2xl bg-error-container/60 text-error flex items-center justify-center mb-4">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Perlu perhatian</h2>
            <p className="text-sm text-on-surface-variant mb-4">Siswa yang belum memiliki tracking atau sudah tujuh hari tidak diperbarui.</p>
            <div className="space-y-2">
              {attentionStudents.length === 0 && <p className="rounded-2xl bg-secondary-container/30 p-3 text-sm text-secondary">Tidak ada siswa yang perlu ditindaklanjuti saat ini.</p>}
              {attentionStudents.map((item) => (
                <a key={item.nama} href={`/dashboard/siswa/${item.id}/panduan`} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white text-primary font-bold flex items-center justify-center">{item.nama.charAt(0)}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-on-surface truncate">{item.nama}</div>
                    <div className="text-xs text-error">{item.days === null ? 'Belum pernah ditracking' : `${item.days} hari tanpa tracking`}</div>
                  </div>
                </a>
              ))}
            </div>
            <a href="/dashboard/kelas/baru" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-high px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest">
              <Plus className="w-4 h-4" /> Buat kelas baru
            </a>
          </aside>
        </div>
      </main>
    </div>
  )
}

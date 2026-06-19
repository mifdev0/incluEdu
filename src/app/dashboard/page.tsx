'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, Plus, Sparkles, UsersRound } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

const kelasData = [
  { id: '1', nama: 'Kelas 7A', jenjang: 'SMP', siswa: 3, observasi: 2, warna: 'bg-[#F1E8FF]', aksen: 'text-primary', namaSiswa: ['Budi', 'Siti', 'Ahmad'] },
  { id: '2', nama: 'Kelas 7B', jenjang: 'SMP', siswa: 2, observasi: 1, warna: 'bg-[#E3F7ED]', aksen: 'text-secondary', namaSiswa: ['Raka', 'Nadia'] },
  { id: '3', nama: 'Kelas 8A', jenjang: 'SMP', siswa: 2, observasi: 0, warna: 'bg-[#FFF3C9]', aksen: 'text-tertiary', namaSiswa: ['Dimas', 'Alya'] },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  const totalSiswa = kelasData.reduce((s, k) => s + k.siswa, 0)
  const observasiMingguIni = kelasData.reduce((s, k) => s + k.observasi, 0)
  const firstName = user.nama.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-container-max rounded-full border border-outline-variant/20 bg-white/85 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact /></a>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{user.nama.charAt(0)}</div>
              <span className="text-on-surface-variant font-label-md text-label-md">{user.nama}</span>
            </div>
            <button onClick={logout} className="text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md">Keluar</button>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-container-max mx-auto px-gutter pb-xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-primary text-on-primary p-md md:p-lg mb-md">
          <div className="absolute -right-14 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute right-40 -bottom-20 w-40 h-40 rounded-full bg-pastel-yellow/20" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-on-primary/80 font-label-md text-label-md mb-2">
                <Sparkles className="w-4 h-4" />
                Ruang pendampingan Anda
              </div>
              <h1 className="font-display text-display-lg-mobile md:text-display-lg mb-2">Selamat datang, {firstName}.</h1>
              <p className="text-on-primary/80 font-body-lg text-body-lg">Lihat kebutuhan yang perlu ditindaklanjuti dan catat perkembangan siswa tanpa langkah yang membingungkan.</p>
            </div>
            <a href="/dashboard/kelas/baru" className="shrink-0 bg-white text-primary hover:bg-primary-fixed px-5 py-3.5 rounded-full font-label-md text-label-md shadow-sm inline-flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Tambah kelompok
            </a>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-lg">
          {[
            { label: 'Kelompok pendampingan', value: kelasData.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Siswa didampingi', value: totalSiswa, icon: UsersRound, color: 'text-secondary', bg: 'bg-secondary-container/40' },
            { label: 'Observasi minggu ini', value: observasiMingguIni, icon: ClipboardCheck, color: 'text-tertiary', bg: 'bg-tertiary-fixed/40' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-outline-variant/20 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
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
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Kelompok siswa</h2>
                <p className="text-on-surface-variant text-sm mt-1">Pilih kelompok untuk melihat profil dan perkembangan siswa.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-md">
              {kelasData.map((kelas) => (
              <article key={kelas.id} className={`${kelas.warna} rounded-[2rem] p-md border border-white transition-transform duration-300 hover:-translate-y-1`}>
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
                    <div className="font-bold text-on-surface">{kelas.observasi}</div>
                    <div className="text-xs text-on-surface-variant">observasi baru</div>
                  </div>
                </div>
                <a href={`/dashboard/kelas/${kelas.id}`} className="flex w-full items-center justify-between py-3 px-4 bg-white/70 hover:bg-white rounded-full font-label-md text-label-md text-on-surface transition-colors">
                  Buka kelompok
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
            <p className="text-sm text-on-surface-variant mb-4">Dua siswa belum memiliki catatan observasi terbaru.</p>
            <div className="space-y-2">
              {[
                { nama: 'Siti Nurhaliza', waktu: '7 hari tanpa observasi', id: '2' },
                { nama: 'Alya Putri', waktu: '6 hari tanpa observasi', id: '3' },
              ].map((item) => (
                <a key={item.nama} href={`/dashboard/siswa/${item.id}/panduan`} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white text-primary font-bold flex items-center justify-center">{item.nama.charAt(0)}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-on-surface truncate">{item.nama}</div>
                    <div className="text-xs text-error">{item.waktu}</div>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

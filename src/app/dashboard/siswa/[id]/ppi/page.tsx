'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { getStudentProgress } from '@/lib/student-progress-data'
import { getPpiGoals } from '@/lib/ppi-data'
import { CalendarDays, CheckCircle2, ClipboardList, Pencil, Target, Users } from 'lucide-react'

const statusMap = {
  berkembang: { label: 'Sedang berkembang', style: 'bg-primary/10 text-primary' },
  hampir_tercapai: { label: 'Hampir tercapai', style: 'bg-tertiary-fixed/50 text-tertiary' },
  tercapai: { label: 'Tercapai', style: 'bg-secondary-container/50 text-secondary' },
  perlu_revisi: { label: 'Perlu direvisi', style: 'bg-error-container/60 text-error' },
}

export default function PpiPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [draftName, setDraftName] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    const draft = localStorage.getItem('incluedu_student_draft')
    if (draft) setDraftName(JSON.parse(draft).nama ?? '')
  }, [user, loading, router])
  if (loading || !user) return null

  const student = getStudentProgress(params.id)
  const goals = getPpiGoals(params.id)
  const displayName = draftName || student.nama

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="font-label-md text-on-surface-variant">← <span className="hidden min-[390px]:inline">Profil</span></a>
            <a href="/dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">Isi observasi</a>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <section className="rounded-3xl bg-primary text-white p-5 sm:p-lg mb-md">
          <span className="text-sm font-bold text-white/70">PROGRAM PEMBELAJARAN INDIVIDUAL</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-display text-[34px] md:text-display-lg">{displayName}</h1>
              <p className="text-white/75 mt-2">Periode Januari–Juni 2026 · Evaluasi bulanan</p>
            </div>
            <button className="w-full md:w-auto px-5 py-3 rounded-full bg-white text-primary font-bold inline-flex items-center justify-center gap-2"><Pencil className="w-4 h-4" /> Edit rancangan PPI</button>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-3 mb-md">
          {[
            { icon: Target, label: 'Tujuan aktif', value: goals.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckCircle2, label: 'Hampir tercapai', value: goals.filter((item) => item.status === 'hampir_tercapai').length, color: 'text-secondary', bg: 'bg-secondary-container/40' },
            { icon: CalendarDays, label: 'Evaluasi berikutnya', value: '28 hari', color: 'text-tertiary', bg: 'bg-tertiary-fixed/40' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-outline-variant/20 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}><item.icon className="w-5 h-5" /></div>
              <div><div className="text-xl font-bold">{item.value}</div><div className="text-sm text-on-surface-variant">{item.label}</div></div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-md items-start">
          <section className="space-y-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm">Tujuan pembelajaran individual</h2>
              <p className="text-sm text-on-surface-variant mt-1">Observasi mingguan akan mengukur kemajuan terhadap tujuan berikut.</p>
            </div>
            {goals.map((goal) => {
              const status = statusMap[goal.status]
              return (
                <article key={goal.id} className="bg-white rounded-3xl border border-outline-variant/20 p-5 sm:p-md">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-primary">{goal.area.toUpperCase()}</span>
                      <h3 className="text-lg font-bold mt-1">{goal.tujuan}</h3>
                    </div>
                    <span className={`w-fit px-3 py-1.5 rounded-full text-xs font-bold ${status.style}`}>{status.label}</span>
                  </div>
                  <div className="mt-4 rounded-2xl bg-surface-container-low p-4">
                    <div className="text-xs font-bold text-on-surface-variant mb-1">INDIKATOR KEBERHASILAN</div>
                    <p className="text-sm">{goal.indikator}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-bold mb-2"><span>Capaian saat ini</span><span>{goal.capaian}% dari target {goal.target}%</span></div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((goal.capaian / goal.target) * 100, 100)}%` }} /></div>
                  </div>
                </article>
              )
            })}
            <button className="w-full py-4 rounded-full border-2 border-dashed border-primary/30 text-primary font-bold">+ Tambah tujuan jangka pendek</button>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-3xl border border-outline-variant/20 p-5">
              <ClipboardList className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold text-lg">Strategi pembelajaran</h3>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                <li>• Instruksi satu per satu dengan contoh visual</li>
                <li>• Waktu tambahan untuk tugas tertulis</li>
                <li>• Penguatan positif yang spesifik</li>
                <li>• Jeda singkat setelah aktivitas fokus</li>
              </ul>
            </div>
            <div className="bg-[#E4F8EE] rounded-3xl border border-secondary/10 p-5">
              <Users className="w-6 h-6 text-secondary mb-3" />
              <h3 className="font-bold text-lg">Tim PPI</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div><div className="font-bold">Guru kelas</div><div className="text-on-surface-variant">{user.nama}</div></div>
                <div><div className="font-bold">Orang tua / wali</div><div className="text-on-surface-variant">Belum dikonfirmasi</div></div>
                <div><div className="font-bold">Pendamping lain</div><div className="text-on-surface-variant">Belum ditambahkan</div></div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

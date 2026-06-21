'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { CalendarDays, CheckCircle2, ClipboardList, Pencil, Plus, Target, Users, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PpiGoal } from '@/lib/ppi-data'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'

const statusMap = {
  belum_dimulai: { label: 'Belum dimulai', style: 'bg-surface-container-high text-on-surface-variant' },
  berkembang: { label: 'Sedang berkembang', style: 'bg-primary/10 text-primary' },
  hampir_tercapai: { label: 'Hampir tercapai', style: 'bg-tertiary-fixed/50 text-tertiary' },
  tercapai: { label: 'Tercapai', style: 'bg-secondary-container/50 text-secondary' },
  perlu_revisi: { label: 'Perlu direvisi', style: 'bg-error-container/60 text-error' },
}

export default function PpiPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [goals, setGoals] = useState<PpiGoal[]>([])
  const [strategies, setStrategies] = useState<string[]>([])
  const [period, setPeriod] = useState('')
  const [daysUntilEvaluation, setDaysUntilEvaluation] = useState<number | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [hasPpi, setHasPpi] = useState(false)
  const [ppiId, setPpiId] = useState('')
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [goalForm, setGoalForm] = useState({
    area: '',
    tujuan: '',
    indikator: '',
    target: 80,
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (user) {
      supabase.from('siswa').select('nama').eq('id', params.id).single().then(({ data }) => setStudentName(data?.nama || ''))
      supabase.from('ppi').select('id, periode_mulai, periode_selesai, strategi').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle().then(async ({ data }) => {
        if (!data) {
          setDataLoading(false)
          return
        }
        setHasPpi(true)
        setPpiId(data.id)
        setStrategies(Array.isArray(data.strategi) ? data.strategi as string[] : [])
        setPeriod(`${data.periode_mulai} – ${data.periode_selesai}`)
        setDaysUntilEvaluation(Math.max(0, Math.ceil((new Date(data.periode_selesai).getTime() - Date.now()) / 86400000)))
        const { data: goalRows } = await supabase.from('tujuan_ppi').select('id, area, tujuan, indikator, target, capaian, status').eq('ppi_id', data.id).order('created_at')
        setGoals((goalRows || []) as PpiGoal[])
        setDataLoading(false)
      })
    }
  }, [user, loading, router, params.id])
  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat rancangan PPI..." />

  const displayName = studentName || 'Siswa'

  async function handleAddGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGoalError('')

    if (!ppiId) {
      setGoalError('Rancangan PPI belum tersedia.')
      return
    }

    const area = goalForm.area.trim()
    const tujuan = goalForm.tujuan.trim()
    const indikator = goalForm.indikator.trim()
    if (!area || !tujuan || !indikator) {
      setGoalError('Area, tujuan, dan indikator wajib diisi.')
      return
    }

    setSavingGoal(true)
    const { data, error } = await supabase
      .from('tujuan_ppi')
      .insert({
        ppi_id: ppiId,
        area,
        tujuan,
        indikator,
        target: goalForm.target,
        capaian: 0,
        status: 'belum_dimulai',
      })
      .select('id, area, tujuan, indikator, target, capaian, status')
      .single()

    setSavingGoal(false)
    if (error || !data) {
      setGoalError(error?.message || 'Tujuan belum berhasil disimpan.')
      return
    }

    setGoals((current) => [...current, data as PpiGoal])
    setGoalForm({ area: '', tujuan: '', indikator: '', target: 80 })
    setGoalModalOpen(false)
  }

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
              <p className="text-white/75 mt-2">{period || 'Belum ada periode PPI'}</p>
            </div>
            <button className="w-full md:w-auto px-5 py-3 rounded-full bg-white text-primary font-bold inline-flex items-center justify-center gap-2"><Pencil className="w-4 h-4" /> Edit rancangan PPI</button>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-3 mb-md">
          {[
            { icon: Target, label: 'Tujuan aktif', value: goals.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckCircle2, label: 'Hampir tercapai', value: goals.filter((item) => item.status === 'hampir_tercapai').length, color: 'text-secondary', bg: 'bg-secondary-container/40' },
            { icon: CalendarDays, label: 'Sisa periode', value: daysUntilEvaluation === null ? '—' : `${daysUntilEvaluation} hari`, color: 'text-tertiary', bg: 'bg-tertiary-fixed/40' },
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
            {!hasPpi && (
              <div className="rounded-3xl border-2 border-dashed border-outline-variant/40 bg-white p-8 text-center">
                <h3 className="font-bold text-lg">Belum ada rancangan PPI</h3>
                <p className="text-sm text-on-surface-variant mt-1">Susun PPI dari hasil asesmen awal siswa.</p>
              </div>
            )}
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
            <button
              type="button"
              onClick={() => {
                setGoalError('')
                setGoalModalOpen(true)
              }}
              disabled={!hasPpi}
              className="w-full py-4 rounded-full border-2 border-dashed border-primary/30 text-primary font-bold inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="w-5 h-5" />
              Tambah tujuan jangka pendek
            </button>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-3xl border border-outline-variant/20 p-5">
              <ClipboardList className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold text-lg">Strategi pembelajaran</h3>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                {strategies.length > 0
                  ? strategies.map((strategy) => <li key={strategy}>• {strategy}</li>)
                  : <li>Belum ada strategi pembelajaran yang tersimpan.</li>}
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

      {goalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-goal-title">
          <form onSubmit={handleAddGoal} className="w-full max-w-xl max-h-full overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary">TUJUAN PPI</span>
                <h2 id="add-goal-title" className="mt-1 text-xl font-bold text-on-surface">Tambah tujuan jangka pendek</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Buat tujuan yang spesifik, dapat diamati, dan dapat diukur melalui observasi.</p>
              </div>
              <button type="button" onClick={() => setGoalModalOpen(false)} disabled={savingGoal} className="shrink-0 p-2 rounded-full hover:bg-surface-container disabled:opacity-40" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-on-surface">Area perkembangan</span>
                <input
                  value={goalForm.area}
                  onChange={(event) => setGoalForm((current) => ({ ...current, area: event.target.value }))}
                  placeholder="Contoh: Membaca permulaan"
                  className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-on-surface">Tujuan jangka pendek</span>
                <textarea
                  value={goalForm.tujuan}
                  onChange={(event) => setGoalForm((current) => ({ ...current, tujuan: event.target.value }))}
                  placeholder={`Contoh: ${displayName} mampu membaca lima suku kata pola KV tanpa mengeja.`}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-on-surface">Indikator keberhasilan</span>
                <textarea
                  value={goalForm.indikator}
                  onChange={(event) => setGoalForm((current) => ({ ...current, indikator: event.target.value }))}
                  placeholder="Contoh: Jumlah suku kata yang dibaca benar tanpa bantuan."
                  rows={2}
                  className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-4 text-sm font-bold text-on-surface">
                  Target keberhasilan
                  <span className="text-primary">{goalForm.target}%</span>
                </span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={goalForm.target}
                  onChange={(event) => setGoalForm((current) => ({ ...current, target: Number(event.target.value) }))}
                  className="mt-3 w-full accent-primary"
                />
              </label>
            </div>

            {goalError && <p className="mt-4 rounded-2xl bg-error-container/60 px-4 py-3 text-sm font-medium text-error">{goalError}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setGoalModalOpen(false)} disabled={savingGoal} className="py-3 rounded-full bg-surface-container-high font-bold disabled:opacity-40">Batal</button>
              <button type="submit" disabled={savingGoal} className="py-3 rounded-full bg-primary text-white font-bold disabled:opacity-60">
                {savingGoal ? <LoadingSpinner label="Menyimpan..." /> : 'Simpan tujuan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

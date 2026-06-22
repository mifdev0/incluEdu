'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { CalendarDays, CheckCircle2, ClipboardList, ListChecks, Pencil, Plus, Target, Users, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PpiGoal } from '@/lib/ppi-data'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { buildNonAcademicGoal, type AssessmentResponseRow } from '@/lib/ppi-v2-data'

const statusMap = {
  belum_dimulai: { label: 'Belum dimulai', style: 'bg-surface-container-high text-on-surface-variant' },
  berkembang: { label: 'Sedang berkembang', style: 'bg-primary/10 text-primary' },
  hampir_tercapai: { label: 'Hampir tercapai', style: 'bg-tertiary-fixed/50 text-tertiary' },
  tercapai: { label: 'Tercapai', style: 'bg-secondary-container/50 text-secondary' },
  perlu_revisi: { label: 'Perlu direvisi', style: 'bg-error-container/60 text-error' },
}

const emptyGoalForm = {
  area: '',
  tujuan: '',
  indikator: '',
  target: 80,
  aktivitas: '',
  media_alat: '',
  pelaksana: 'Guru kelas',
  frekuensi: '',
  metode_evaluasi: 'Observasi kinerja',
  langkah_tugas: ['', ''],
  catatan_evaluasi: '',
  tindak_lanjut: 'lanjutkan',
  jenis_target: 'non_akademik',
  cp_id: '',
  kriteria_tuntas: '',
  skor_benar_target: '',
  skor_total_target: '',
}

export default function PpiPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [goals, setGoals] = useState<PpiGoal[]>([])
  const [strategies, setStrategies] = useState<string[]>([])
  const [longTermGoal, setLongTermGoal] = useState('')
  const [period, setPeriod] = useState('')
  const [daysUntilEvaluation, setDaysUntilEvaluation] = useState<number | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [hasPpi, setHasPpi] = useState(false)
  const [ppiId, setPpiId] = useState('')
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [editingGoal, setEditingGoal] = useState<PpiGoal | null>(null)
  const [goalForm, setGoalForm] = useState(emptyGoalForm)
  const [cpOptions, setCpOptions] = useState<Array<{ id: string; mata_pelajaran: string; fase: string; jenjang: string; nama_elemen: string; deskripsi_cp: string; indikator_operasional: string[] }>>([])
  const [assessmentResponses, setAssessmentResponses] = useState<AssessmentResponseRow[]>([])
  const [addingNonAcademic, setAddingNonAcademic] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (user) {
      supabase.from('siswa').select('nama').eq('id', params.id).single().then(({ data }) => setStudentName(data?.nama || ''))
      supabase.from('assessment_responses').select('item_key, item_label, domain, nilai').eq('siswa_id', params.id).then(({ data }) => {
        setAssessmentResponses((data || []) as AssessmentResponseRow[])
      })
      supabase.from('ppi').select('id, periode_mulai, periode_selesai, strategi, tujuan_jangka_panjang').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle().then(async ({ data }) => {
        if (!data) {
          setDataLoading(false)
          return
        }
        setHasPpi(true)
        setPpiId(data.id)
        setLongTermGoal(data.tujuan_jangka_panjang || '')
        setStrategies(Array.isArray(data.strategi) ? data.strategi as string[] : [])
        setPeriod(`${data.periode_mulai} – ${data.periode_selesai}`)
        setDaysUntilEvaluation(Math.max(0, Math.ceil((new Date(data.periode_selesai).getTime() - Date.now()) / 86400000)))
        const [{ data: goalRows }, { data: curriculumRows }] = await Promise.all([
          supabase.from('tujuan_ppi').select('id, area, tujuan, indikator, target, capaian, status, aktivitas, media_alat, pelaksana, frekuensi, metode_evaluasi, langkah_tugas, jenis_target, cp_id, fase_adaptasi, kriteria_tuntas, skor_benar_target, skor_total_target').eq('ppi_id', data.id).order('created_at'),
          supabase.from('curriculum_cp').select('id, mata_pelajaran, fase, jenjang, nama_elemen, deskripsi_cp, indikator_operasional').order('mata_pelajaran').order('fase'),
        ])
        setGoals((goalRows || []) as PpiGoal[])
        setCpOptions((curriculumRows || []) as typeof cpOptions)
        setDataLoading(false)
      })
    }
  }, [user, loading, router, params.id])
  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat rancangan PPI..." />

  const displayName = studentName || 'Siswa'
  const hasNonAcademicGoal = goals.some((goal) => goal.jenis_target === 'non_akademik')

  function openNewGoal() {
    setEditingGoal(null)
    setGoalForm(emptyGoalForm)
    setGoalError('')
    setGoalModalOpen(true)
  }

  function openEditGoal(goal: PpiGoal) {
    setEditingGoal(goal)
    setGoalForm({
      area: goal.area,
      tujuan: goal.tujuan,
      indikator: goal.indikator,
      target: goal.target,
      aktivitas: goal.aktivitas || '',
      media_alat: goal.media_alat || '',
      pelaksana: goal.pelaksana || 'Guru kelas',
      frekuensi: goal.frekuensi || '',
      metode_evaluasi: goal.metode_evaluasi || 'Observasi kinerja',
      langkah_tugas: Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0 ? goal.langkah_tugas : ['', ''],
      catatan_evaluasi: '',
      tindak_lanjut: goal.status === 'tercapai' ? 'tercapai' : 'lanjutkan',
      jenis_target: goal.jenis_target || 'non_akademik',
      cp_id: goal.cp_id || '',
      kriteria_tuntas: goal.kriteria_tuntas || '',
      skor_benar_target: goal.skor_benar_target?.toString() || '',
      skor_total_target: goal.skor_total_target?.toString() || '',
    })
    setGoalError('')
    setGoalModalOpen(true)
  }

  async function handleSaveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGoalError('')

    if (!ppiId) {
      setGoalError('Rancangan PPI belum tersedia.')
      return
    }

    const area = goalForm.area.trim()
    const tujuan = goalForm.tujuan.trim()
    const indikator = goalForm.indikator.trim()
    const taskSteps = goalForm.langkah_tugas.map((item) => item.trim()).filter(Boolean)
    if (!area || !tujuan || !indikator || !goalForm.aktivitas.trim() || !goalForm.metode_evaluasi.trim() || taskSteps.length === 0) {
      setGoalError('Area, tujuan, indikator, aktivitas, metode evaluasi, dan minimal satu langkah tugas wajib diisi.')
      return
    }

    setSavingGoal(true)
    const payload = {
      area,
      tujuan,
      indikator,
      target: goalForm.target,
      aktivitas: goalForm.aktivitas.trim(),
      media_alat: goalForm.media_alat.trim() || null,
      pelaksana: goalForm.pelaksana.trim() || 'Guru kelas',
      frekuensi: goalForm.frekuensi.trim() || null,
      metode_evaluasi: goalForm.metode_evaluasi.trim(),
      langkah_tugas: taskSteps,
      updated_at: new Date().toISOString(),
      jenis_target: goalForm.jenis_target,
      cp_id: goalForm.jenis_target === 'akademik' && goalForm.cp_id ? goalForm.cp_id : null,
      fase_adaptasi: goalForm.jenis_target === 'akademik' && goalForm.cp_id
        ? cpOptions.find((item) => item.id === goalForm.cp_id)?.fase || null
        : null,
      kriteria_tuntas: goalForm.kriteria_tuntas.trim() || `Tuntas apabila mencapai minimal ${goalForm.target}%`,
      skor_benar_target: goalForm.jenis_target === 'akademik' && goalForm.skor_benar_target ? Number(goalForm.skor_benar_target) : null,
      skor_total_target: goalForm.jenis_target === 'akademik' && goalForm.skor_total_target ? Number(goalForm.skor_total_target) : null,
    }
    const query = editingGoal
      ? supabase.from('tujuan_ppi').update({
          ...payload,
          status: goalForm.tindak_lanjut === 'revisi'
            ? 'perlu_revisi'
            : goalForm.tindak_lanjut === 'hentikan'
              ? 'perlu_revisi'
            : goalForm.tindak_lanjut === 'tercapai'
              ? 'tercapai'
              : editingGoal.status,
        }).eq('id', editingGoal.id)
      : supabase.from('tujuan_ppi').insert({
          ppi_id: ppiId,
          ...payload,
          capaian: 0,
          status: 'belum_dimulai',
        })
    const { data, error } = await query
      .select('id, area, tujuan, indikator, target, capaian, status, aktivitas, media_alat, pelaksana, frekuensi, metode_evaluasi, langkah_tugas, jenis_target, cp_id, fase_adaptasi, kriteria_tuntas, skor_benar_target, skor_total_target')
      .single()

    if (error || !data) {
      setSavingGoal(false)
      setGoalError(error?.message || 'Tujuan belum berhasil disimpan.')
      return
    }

    await supabase.from('goal_accommodations').delete().eq('tujuan_ppi_id', data.id)
    const accommodations = [
      payload.media_alat ? { tujuan_ppi_id: data.id, jenis: 'media', deskripsi: payload.media_alat } : null,
      payload.aktivitas ? { tujuan_ppi_id: data.id, jenis: 'strategi', deskripsi: payload.aktivitas } : null,
      payload.frekuensi ? { tujuan_ppi_id: data.id, jenis: 'durasi', deskripsi: payload.frekuensi } : null,
    ].filter((item): item is { tujuan_ppi_id: string; jenis: string; deskripsi: string } => item !== null)
    if (accommodations.length > 0) {
      const { error: accommodationError } = await supabase.from('goal_accommodations').insert(accommodations)
      if (accommodationError) {
        setSavingGoal(false)
        setGoalError(`Tujuan tersimpan, tetapi akomodasi belum tersimpan: ${accommodationError.message}`)
        return
      }
    }

    if (editingGoal && user) {
      const note = goalForm.catatan_evaluasi.trim() || 'Tujuan ditinjau dan diperbarui oleh guru.'
      const { error: evaluationError } = await supabase.from('evaluasi_tujuan_ppi').insert({
        tujuan_ppi_id: editingGoal.id,
        capaian_sebelum: editingGoal.capaian,
        status_sebelum: editingGoal.status,
        catatan: note,
        tindak_lanjut: goalForm.tindak_lanjut,
        dibuat_oleh: user.id,
      })
      if (evaluationError) {
        setSavingGoal(false)
        setGoalError(`Tujuan tersimpan, tetapi riwayat evaluasi gagal: ${evaluationError.message}`)
        return
      }
      setGoals((current) => current.map((item) => item.id === editingGoal.id ? data as PpiGoal : item))
    } else {
      setGoals((current) => [...current, data as PpiGoal])
    }
    setSavingGoal(false)
    setGoalForm(emptyGoalForm)
    setEditingGoal(null)
    setGoalModalOpen(false)
  }

  async function addRecommendedNonAcademicGoal() {
    if (!ppiId || hasNonAcademicGoal) return
    setAddingNonAcademic(true)
    setGoalError('')
    const draft = buildNonAcademicGoal(displayName, assessmentResponses)
    const { data, error } = await supabase.from('tujuan_ppi').insert({
      ppi_id: ppiId,
      ...draft,
      capaian: 0,
      status: 'belum_dimulai',
      cp_id: null,
      fase_adaptasi: null,
    }).select('id, area, tujuan, indikator, target, capaian, status, aktivitas, media_alat, pelaksana, frekuensi, metode_evaluasi, langkah_tugas, jenis_target, cp_id, fase_adaptasi, kriteria_tuntas, skor_benar_target, skor_total_target').single()
    if (error || !data) {
      setGoalError(error?.message || 'Target non-akademik belum berhasil dibuat.')
      setAddingNonAcademic(false)
      return
    }
    await supabase.from('goal_accommodations').insert([
      { tujuan_ppi_id: data.id, jenis: 'media', deskripsi: draft.media_alat },
      { tujuan_ppi_id: data.id, jenis: 'strategi', deskripsi: draft.aktivitas },
      { tujuan_ppi_id: data.id, jenis: 'durasi', deskripsi: draft.frekuensi },
    ])
    setGoals((current) => [...current, data as PpiGoal])
    setAddingNonAcademic(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="font-label-md text-on-surface-variant">← <span className="hidden min-[390px]:inline">Profil</span></a>
            <a href="/dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">Tracking harian</a>
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
            <button type="button" onClick={openNewGoal} disabled={!hasPpi} className="w-full md:w-auto px-5 py-3 rounded-full bg-white text-primary font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> Tambah tujuan</button>
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

        {longTermGoal && (
          <section className="mb-md rounded-3xl border border-primary/15 bg-primary/5 p-5 sm:p-md">
            <div className="text-xs font-bold text-primary">TUJUAN JANGKA PANJANG</div>
            <p className="mt-2 text-lg font-bold leading-relaxed text-on-surface">{longTermGoal}</p>
          </section>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-md items-start">
          <section className="space-y-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm">Tujuan pembelajaran individual</h2>
              <p className="text-sm text-on-surface-variant mt-1">Tracking harian mengukur kemajuan terhadap target dan kriteria ketuntasan berikut.</p>
            </div>
            {!hasNonAcademicGoal && hasPpi && (
              <div className="rounded-3xl border border-tertiary/20 bg-tertiary-fixed/25 p-5">
                <div className="font-bold text-on-surface">Target non-akademik belum tersedia</div>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">Tanpa target non-akademik, tracking hanya menghasilkan nilai akademik. Buat target dari kebutuhan sikap belajar, sosial-emosional, bina diri, atau motorik pada asesmen.</p>
                <button type="button" onClick={addRecommendedNonAcademicGoal} disabled={addingNonAcademic} className="mt-4 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {addingNonAcademic ? <LoadingSpinner label="Membuat target..." /> : 'Buat target non-akademik dari asesmen'}
                </button>
              </div>
            )}
            {goalError && <p className="rounded-2xl bg-error-container/60 px-4 py-3 text-sm font-medium text-error">{goalError}</p>}
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">{goal.jenis_target === 'akademik' ? 'Target akademik' : 'Target non-akademik'}</span>
                        {goal.fase_adaptasi && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">CP Fase {goal.fase_adaptasi}</span>}
                      </div>
                    </div>
                    <span className={`w-fit px-3 py-1.5 rounded-full text-xs font-bold ${status.style}`}>{status.label}</span>
                  </div>
                  <div className="mt-4 rounded-2xl bg-surface-container-low p-4">
                    <div className="text-xs font-bold text-on-surface-variant mb-1">INDIKATOR KEBERHASILAN</div>
                    <p className="text-sm">{goal.indikator}</p>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-outline-variant/20 p-4">
                      <div className="text-xs font-bold text-on-surface-variant">AKTIVITAS</div>
                      <p className="mt-1">{goal.aktivitas || 'Belum ditentukan.'}</p>
                    </div>
                    <div className="rounded-2xl border border-outline-variant/20 p-4">
                      <div className="text-xs font-bold text-on-surface-variant">MEDIA DAN PELAKSANA</div>
                      <p className="mt-1">{goal.media_alat || 'Media belum ditentukan.'}</p>
                      <p className="mt-1 text-on-surface-variant">{goal.pelaksana || 'Guru kelas'}{goal.frekuensi ? ` · ${goal.frekuensi}` : ''}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary"><ListChecks className="w-4 h-4" /> ANALISIS TUGAS</div>
                    {Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0 ? (
                      <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
                        {goal.langkah_tugas.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                    ) : (
                      <p className="mt-2 text-sm text-on-surface-variant">Tujuan lama ini belum dipecah menjadi langkah kecil. Gunakan tombol evaluasi atau revisi untuk menambahkan analisis tugas.</p>
                    )}
                    <p className="mt-2 text-xs text-on-surface-variant">Evaluasi: {goal.metode_evaluasi || 'Observasi kinerja'}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-bold mb-2"><span>Capaian saat ini</span><span>{goal.capaian}% dari target {goal.target}%</span></div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((goal.capaian / goal.target) * 100, 100)}%` }} /></div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-outline-variant/20 p-4">
                    <div className="text-xs font-bold text-on-surface-variant">KRITERIA KETUNTASAN</div>
                    <p className="mt-1 text-sm font-semibold">{goal.kriteria_tuntas || `Tuntas apabila mencapai ${goal.target}%`}</p>
                  </div>
                  <button type="button" onClick={() => openEditGoal(goal)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    <Pencil className="w-4 h-4" /> Evaluasi atau revisi tujuan
                  </button>
                </article>
              )
            })}
            <button
              type="button"
              onClick={openNewGoal}
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
          <form onSubmit={handleSaveGoal} className="w-full max-w-2xl max-h-full overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary">TUJUAN PPI</span>
                <h2 id="add-goal-title" className="mt-1 text-xl font-bold text-on-surface">{editingGoal ? 'Evaluasi dan revisi tujuan' : 'Tambah tujuan jangka pendek'}</h2>
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
              <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-4">
                <div className="text-sm font-bold">Jenis target</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[['akademik', 'Akademik / mapel'], ['non_akademik', 'Non-akademik']].map(([value, label]) => <button key={value} type="button" onClick={() => setGoalForm((current) => ({ ...current, jenis_target: value }))} className={`rounded-2xl border px-3 py-3 text-sm font-bold ${goalForm.jenis_target === value ? 'border-primary bg-primary text-white' : 'bg-white'}`}>{label}</button>)}
                </div>
              </div>
              {goalForm.jenis_target === 'akademik' && (
                <label className="block">
                  <span className="text-sm font-bold text-on-surface">Capaian Pembelajaran yang diadaptasi</span>
                  <select value={goalForm.cp_id} onChange={(event) => {
                    const cp = cpOptions.find((item) => item.id === event.target.value)
                    setGoalForm((current) => ({
                      ...current,
                      cp_id: event.target.value,
                      area: cp ? `${cp.mata_pelajaran} · ${cp.nama_elemen}` : current.area,
                    }))
                  }} className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
                    <option value="">Pilih CP lintas fase</option>
                    {cpOptions.map((cp) => <option key={cp.id} value={cp.id}>{cp.mata_pelajaran} · Fase {cp.fase} · {cp.nama_elemen}</option>)}
                  </select>
                  {goalForm.cp_id && <p className="mt-2 rounded-2xl bg-primary/5 p-3 text-xs leading-relaxed text-on-surface-variant">{cpOptions.find((item) => item.id === goalForm.cp_id)?.deskripsi_cp}</p>}
                </label>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-on-surface">Aktivitas pembelajaran</span>
                  <textarea value={goalForm.aktivitas} onChange={(event) => setGoalForm((current) => ({ ...current, aktivitas: event.target.value }))} rows={3} placeholder="Kegiatan yang dilakukan untuk mencapai tujuan" className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-on-surface">Media atau alat bantu</span>
                  <textarea value={goalForm.media_alat} onChange={(event) => setGoalForm((current) => ({ ...current, media_alat: event.target.value }))} rows={3} placeholder="Contoh: kartu huruf timbul, timer visual" className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-on-surface">Pelaksana</span>
                  <input value={goalForm.pelaksana} onChange={(event) => setGoalForm((current) => ({ ...current, pelaksana: event.target.value }))} className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-on-surface">Frekuensi atau durasi</span>
                  <input value={goalForm.frekuensi} onChange={(event) => setGoalForm((current) => ({ ...current, frekuensi: event.target.value }))} placeholder="Contoh: 3 kali seminggu, 15 menit" className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-on-surface">Metode evaluasi</span>
                <input value={goalForm.metode_evaluasi} onChange={(event) => setGoalForm((current) => ({ ...current, metode_evaluasi: event.target.value }))} placeholder="Contoh: tes kinerja dan observasi langsung" className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-on-surface">Kriteria ketuntasan</span>
                <input value={goalForm.kriteria_tuntas} onChange={(event) => setGoalForm((current) => ({ ...current, kriteria_tuntas: event.target.value }))} placeholder="Contoh: Tuntas jika benar 8 dari 10 soal" className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3" />
              </label>
              {goalForm.jenis_target === 'akademik' && (
                <div className="grid grid-cols-2 gap-3">
                  <label><span className="text-sm font-bold">Jawaban benar target</span><input type="number" min="0" value={goalForm.skor_benar_target} onChange={(event) => setGoalForm((current) => ({ ...current, skor_benar_target: event.target.value }))} placeholder="8" className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3" /></label>
                  <label><span className="text-sm font-bold">Total soal / tugas</span><input type="number" min="1" value={goalForm.skor_total_target} onChange={(event) => setGoalForm((current) => ({ ...current, skor_total_target: event.target.value }))} placeholder="10" className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3" /></label>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-on-surface">Langkah analisis tugas</span>
                  <button type="button" onClick={() => setGoalForm((current) => ({ ...current, langkah_tugas: [...current.langkah_tugas, ''] }))} className="text-xs font-bold text-primary">+ Tambah langkah</button>
                </div>
                <div className="mt-2 space-y-2">
                  {goalForm.langkah_tugas.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-7 text-center text-sm font-bold text-primary">{index + 1}</span>
                      <input value={task} onChange={(event) => setGoalForm((current) => ({ ...current, langkah_tugas: current.langkah_tugas.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} placeholder="Langkah kecil yang dapat diamati" className="min-w-0 flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                      {goalForm.langkah_tugas.length > 1 && <button type="button" onClick={() => setGoalForm((current) => ({ ...current, langkah_tugas: current.langkah_tugas.filter((_, itemIndex) => itemIndex !== index) }))} className="p-2 text-error" aria-label="Hapus langkah"><X className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              </div>
              {editingGoal && (
                <div className="rounded-2xl bg-tertiary-fixed/25 p-4 space-y-3">
                  <label className="block">
                    <span className="text-sm font-bold text-on-surface">Catatan hasil evaluasi</span>
                    <textarea value={goalForm.catatan_evaluasi} onChange={(event) => setGoalForm((current) => ({ ...current, catatan_evaluasi: event.target.value }))} rows={2} placeholder="Perubahan yang terlihat dan alasan revisi" className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 outline-none focus:border-primary" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-on-surface">Tindak lanjut</span>
                    <select value={goalForm.tindak_lanjut} onChange={(event) => setGoalForm((current) => ({ ...current, tindak_lanjut: event.target.value }))} className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 outline-none focus:border-primary">
                      <option value="lanjutkan">Lanjutkan program</option>
                      <option value="revisi">Revisi dan pantau kembali</option>
                      <option value="tercapai">Tujuan tercapai</option>
                      <option value="hentikan">Hentikan tujuan</option>
                    </select>
                  </label>
                </div>
              )}
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
                {savingGoal ? <LoadingSpinner label="Menyimpan..." /> : editingGoal ? 'Simpan evaluasi' : 'Simpan tujuan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

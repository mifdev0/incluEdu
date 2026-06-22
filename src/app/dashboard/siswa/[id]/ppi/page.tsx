'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { CalendarDays, CheckCircle2, ChevronDown, ClipboardList, FileDown, ListChecks, Pencil, Plus, Target, Users, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PpiGoal } from '@/lib/ppi-data'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { buildNonAcademicGoal, expectedPhaseFromClass, type AssessmentResponseRow, type CurriculumPhase } from '@/lib/ppi-v2-data'

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
  langkah_tugas: [''],
  catatan_evaluasi: '',
  tindak_lanjut: 'lanjutkan',
  jenis_target: 'non_akademik',
  cp_id: '',
  kriteria_tuntas: '',
  skor_benar_target: '',
  skor_total_target: '',
}

function validLongTermGoal(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' && value.trim() !== '[object Object]'
}

function buildLongTermGoalFromGoals(goals: PpiGoal[]) {
  const areas = Array.from(new Set(goals.map((goal) => goal.area.split('·')[0].trim()).filter(Boolean))).slice(0, 4)
  const focus = areas.length > 0 ? areas.join(', ') : 'akademik, sosial-emosional, dan kemandirian'
  return `Mengembangkan kemampuan siswa pada area ${focus} secara bertahap, terukur, dan sesuai kebutuhan individual selama periode PPI.`
}

export default function PpiPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [classPhase, setClassPhase] = useState<CurriculumPhase | null>(null)
  const [goals, setGoals] = useState<PpiGoal[]>([])
  const [strategies, setStrategies] = useState<string[]>([])
  const [longTermGoal, setLongTermGoal] = useState('')
  const [period, setPeriod] = useState('')
  const [daysUntilEvaluation, setDaysUntilEvaluation] = useState<number | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [hasPpi, setHasPpi] = useState(false)
  const [ppiId, setPpiId] = useState('')
  const [ppiStatus, setPpiStatus] = useState<'draft' | 'aktif' | 'selesai'>('draft')
  const [approverName, setApproverName] = useState('')
  const [approverRelation, setApproverRelation] = useState('Orang tua / wali')
  const [approvalDate, setApprovalDate] = useState('')
  const [approvalNote, setApprovalNote] = useState('')
  const [approving, setApproving] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [editingGoal, setEditingGoal] = useState<PpiGoal | null>(null)
  const [goalForm, setGoalForm] = useState(emptyGoalForm)
  const [cpOptions, setCpOptions] = useState<Array<{ id: string; mata_pelajaran: string; fase: string; jenjang: string; nama_elemen: string; deskripsi_cp: string; indikator_operasional: string[] }>>([])
  const [assessmentResponses, setAssessmentResponses] = useState<AssessmentResponseRow[]>([])
  const [addingNonAcademic, setAddingNonAcademic] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [pengayaanGoal, setPengayaanGoal] = useState<PpiGoal | null>(null)
  const [generatingPengayaan, setGeneratingPengayaan] = useState(false)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (user) {
      supabase.from('siswa').select('nama, kelas(nama, jenjang, tingkat)').eq('id', params.id).single().then(({ data }) => {
        setStudentName(data?.nama || '')
        const classData = data?.kelas as unknown as { nama: string; jenjang: string; tingkat: number | null } | null
        setClassPhase(classData ? expectedPhaseFromClass(classData.nama, classData.jenjang, classData.tingkat) : null)
      })
      supabase.from('assessment_responses').select('item_key, item_label, domain, nilai').eq('siswa_id', params.id).then(({ data }) => {
        setAssessmentResponses((data || []) as AssessmentResponseRow[])
      })
      supabase.from('ppi').select('id, periode_mulai, periode_selesai, strategi, tujuan_jangka_panjang, status, nama_penyetuju, hubungan_penyetuju, tanggal_persetujuan, catatan_persetujuan').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle().then(async ({ data }) => {
        if (!data) {
          setDataLoading(false)
          return
        }
        setHasPpi(true)
        setPpiId(data.id)
        setPpiStatus(data.status || 'draft')
        setApproverName(data.nama_penyetuju || '')
        setApproverRelation(data.hubungan_penyetuju || 'Orang tua / wali')
        setApprovalDate(data.tanggal_persetujuan || '')
        setApprovalNote(data.catatan_persetujuan || '')
        setStrategies(Array.isArray(data.strategi) ? data.strategi as string[] : [])
        setPeriod(`${data.periode_mulai} – ${data.periode_selesai}`)
        setDaysUntilEvaluation(Math.max(0, Math.ceil((new Date(data.periode_selesai).getTime() - Date.now()) / 86400000)))
        const [{ data: goalRows }, { data: curriculumRows }] = await Promise.all([
          supabase.from('tujuan_ppi').select('id, area, tujuan, indikator, target, capaian, status, aktivitas, media_alat, pelaksana, frekuensi, metode_evaluasi, langkah_tugas, jenis_target, cp_id, fase_adaptasi, kriteria_tuntas, skor_benar_target, skor_total_target').eq('ppi_id', data.id).order('created_at'),
          supabase.from('curriculum_cp').select('id, mata_pelajaran, fase, jenjang, nama_elemen, deskripsi_cp, indikator_operasional').order('mata_pelajaran').order('fase'),
        ])
        const loadedGoals = (goalRows || []) as PpiGoal[]
        setGoals(loadedGoals)
        if (validLongTermGoal(data.tujuan_jangka_panjang)) {
          setLongTermGoal(data.tujuan_jangka_panjang)
        } else {
          const repairedGoal = buildLongTermGoalFromGoals(loadedGoals)
          setLongTermGoal(repairedGoal)
          await supabase.from('ppi').update({ tujuan_jangka_panjang: repairedGoal }).eq('id', data.id)
        }
        setCpOptions((curriculumRows || []) as typeof cpOptions)
        setDataLoading(false)
      })
    }
  }, [user, loading, router, params.id])
  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat rancangan PPI..." />

  const displayName = studentName || 'Siswa'
  const hasNonAcademicGoal = goals.some((goal) => goal.jenis_target === 'non_akademik')

  function goalIdentity(goal: PpiGoal) {
    if (goal.jenis_target !== 'akademik') {
      return {
        title: goal.area,
        subject: null,
        element: null,
      }
    }
    const cp = cpOptions.find((item) => item.id === goal.cp_id)
    if (cp) {
      return {
        title: `${cp.mata_pelajaran} (${cp.nama_elemen})`,
        subject: cp.mata_pelajaran,
        element: cp.nama_elemen,
      }
    }
    const [subject, element] = goal.area.split('·').map((item) => item.trim())
    const isKnownSubject = ['Bahasa Indonesia', 'Matematika'].includes(subject)
    if (isKnownSubject && element) return { title: `${subject} (${element})`, subject, element }
    if (goal.area.toLowerCase().includes('membaca')) return { title: 'Bahasa Indonesia (Membaca)', subject: 'Bahasa Indonesia', element: 'Membaca' }
    if (goal.area.toLowerCase().includes('menulis')) return { title: 'Bahasa Indonesia (Menulis)', subject: 'Bahasa Indonesia', element: 'Menulis' }
    if (goal.area.toLowerCase().includes('matematika') || goal.area.toLowerCase().includes('berhitung')) return { title: 'Matematika', subject: 'Matematika', element: goal.area }
    return { title: goal.area, subject: null, element: goal.area }
  }

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
      langkah_tugas: Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0 ? goal.langkah_tugas : [''],
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
    if (!area || !tujuan || !indikator || taskSteps.length === 0) {
      setGoalError('Area, tujuan, indikator, dan minimal satu langkah tugas wajib diisi.')
      return
    }

    setSavingGoal(true)
    const payload = {
      area,
      tujuan,
      indikator,
      target: goalForm.target,
      aktivitas: goalForm.aktivitas.trim() || null,
      media_alat: goalForm.media_alat.trim() || null,
      pelaksana: goalForm.pelaksana.trim() || 'Guru kelas',
      frekuensi: goalForm.frekuensi.trim() || null,
      metode_evaluasi: goalForm.metode_evaluasi.trim() || 'Observasi kinerja',
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

  async function markGoalComplete(goal: PpiGoal) {
    if (!confirm(`Tandai "${goal.tujuan}" sebagai tercapai?\n\nGoal ini akan dikunci dan guru bisa membuat tujuan pengayaan baru.`)) return
    const { error } = await supabase.from('tujuan_ppi').update({
      status: 'tercapai',
      capaian: Math.max(goal.capaian, goal.target),
      updated_at: new Date().toISOString(),
    }).eq('id', goal.id)
    if (!error) {
      setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, status: 'tercapai', capaian: Math.max(goal.capaian, goal.target) } : item))
    }
  }

  async function approvePpi() {
    if (!ppiId || !approverName.trim()) {
      setGoalError('Nama orang tua atau wali yang menyetujui wajib diisi.')
      return
    }
    setApproving(true)
    setGoalError('')
    const date = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('ppi').update({
      status: 'aktif',
      nama_penyetuju: approverName.trim(),
      hubungan_penyetuju: approverRelation.trim() || 'Orang tua / wali',
      tanggal_persetujuan: date,
      catatan_persetujuan: approvalNote.trim() || null,
    }).eq('id', ppiId)
    setApproving(false)
    if (error) {
      setGoalError(error.message)
      return
    }
    setPpiStatus('aktif')
    setApprovalDate(date)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="font-label-md text-on-surface-variant">← <span className="hidden min-[390px]:inline">Profil</span></a>
            <a href="/dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          {ppiStatus === 'aktif'
            ? <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">Tracking harian</a>
            : <a href={`/dashboard/siswa/${params.id}/ppi/dokumen`} className="px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">Tinjau dokumen</a>}
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
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <a href={`/dashboard/siswa/${params.id}/ppi/dokumen`} className="inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-3 font-bold text-white"><FileDown className="mr-2 h-4 w-4" />Dokumen PPI</a>
              <button type="button" onClick={openNewGoal} disabled={!hasPpi} className="px-5 py-3 rounded-full bg-white text-primary font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> Tambah tujuan</button>
            </div>
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

        <section className={`mb-md rounded-3xl border p-5 sm:p-md ${ppiStatus === 'aktif' ? 'border-secondary/20 bg-[#E4F8EE]' : 'border-tertiary/20 bg-tertiary-fixed/25'}`}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="text-xs font-bold text-primary">KONTRAK LAYANAN PPI</div>
              <h2 className="mt-1 text-lg font-bold">{ppiStatus === 'aktif' ? 'PPI telah disetujui dan aktif' : 'PPI masih berupa draf'}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                {ppiStatus === 'aktif'
                  ? `Disetujui oleh ${approverName} (${approverRelation}) pada ${approvalDate}. Tracking dapat dilaksanakan.`
                  : 'Cetak atau tinjau dokumen bersama Tim PPI dan orang tua. Tracking dimulai setelah persetujuan orang tua dicatat.'}
              </p>
            </div>
            <a href={`/dashboard/siswa/${params.id}/ppi/dokumen`} className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-primary"><FileDown className="mr-2 h-4 w-4" />Cetak / PDF</a>
          </div>
          {ppiStatus !== 'aktif' && <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label><span className="text-sm font-bold">Nama orang tua / wali</span><input value={approverName} onChange={(event) => setApproverName(event.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" placeholder="Nama lengkap penyetuju" /></label>
            <label><span className="text-sm font-bold">Hubungan dengan siswa</span><input value={approverRelation} onChange={(event) => setApproverRelation(event.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" /></label>
            <label className="md:col-span-2"><span className="text-sm font-bold">Catatan persetujuan (opsional)</span><textarea value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} rows={2} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" placeholder="Contoh: orang tua menyetujui dengan evaluasi ulang setelah tiga bulan." /></label>
            <button type="button" onClick={approvePpi} disabled={approving || !approverName.trim()} className="md:col-span-2 rounded-full bg-primary py-4 font-bold text-white disabled:opacity-40">{approving ? <LoadingSpinner label="Menyimpan persetujuan..." /> : 'Catat persetujuan dan aktifkan PPI'}</button>
          </div>}
        </section>

        <div className="grid lg:grid-cols-[1fr_320px] gap-md items-start">
          <section className="space-y-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm">Tujuan pembelajaran individual</h2>
              <p className="text-sm text-on-surface-variant mt-1">Pantau kemajuan siswa setiap hari. Klik <strong>Evaluasi atau revisi tujuan</strong> untuk memperbarui capaian atau menambah langkah tugas.</p>
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
              const identity = goalIdentity(goal)
              return (
                <article key={goal.id} className="bg-white rounded-3xl border border-outline-variant/20">
                  <button type="button" onClick={() => setExpandedGoals((prev) => { const next = new Set(prev); if (next.has(goal.id)) next.delete(goal.id); else next.add(goal.id); return next })} className="w-full flex items-center justify-between gap-3 p-5 sm:p-md text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{identity.title.toUpperCase()}</span>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.style}`}>{status.label}</span>
                      </div>
                      <h3 className="text-lg font-bold mt-1">{goal.tujuan}</h3>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="font-bold">{goal.capaian}%</span>
                        <span className="h-2 flex-1 max-w-[160px] rounded-full bg-surface-container-high overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((goal.capaian / goal.target) * 100, 100)}%` }} /></span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-on-surface-variant transition-transform ${expandedGoals.has(goal.id) ? '' : '-rotate-90'}`} />
                  </button>
                  {expandedGoals.has(goal.id) && <div className="px-5 sm:px-md pb-5 sm:pb-md space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">{goal.jenis_target === 'akademik' ? 'Target akademik' : 'Target non-akademik'}</span>
                      {goal.jenis_target === 'akademik' && classPhase && <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">Fase kelas {classPhase}</span>}
                      {goal.fase_adaptasi && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Adaptasi CP Fase {goal.fase_adaptasi}</span>}
                    </div>
                    <div className="rounded-2xl bg-surface-container-low p-4">
                      <div className="text-xs font-bold text-on-surface-variant mb-1">INDIKATOR KEBERHASILAN</div>
                      <p className="text-sm">{goal.indikator}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
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
                    <div className="rounded-2xl bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary"><ListChecks className="w-4 h-4" /> ANALISIS TUGAS</div>
                      {Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0 ? (
                        <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">{goal.langkah_tugas.map((step) => <li key={step}>{step}</li>)}</ol>
                      ) : (
                        <p className="mt-2 text-sm text-on-surface-variant">Tujuan lama ini belum dipecah menjadi langkah kecil. Gunakan tombol evaluasi atau revisi untuk menambahkan analisis tugas.</p>
                      )}
                      <p className="mt-2 text-xs text-on-surface-variant">Evaluasi: {goal.metode_evaluasi || 'Observasi kinerja'}</p>
                    </div>
                    <div className="rounded-2xl border border-outline-variant/20 p-4">
                      <div className="text-xs font-bold text-on-surface-variant">KRITERIA KETUNTASAN</div>
                      <p className="mt-1 text-sm font-semibold">{goal.kriteria_tuntas || `Tuntas apabila mencapai ${goal.target}%`}</p>
                      {goal.jenis_target === 'akademik' && <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">Hasil tracking menjadi rekomendasi penilaian untuk {identity.subject || 'mata pelajaran terkait'}. Nilai akhir tetap ditinjau dan disahkan oleh guru.</p>}
                    </div>
                    {goal.status === 'tercapai' ? (
                      <div className="rounded-2xl bg-secondary-container/50 p-4 text-center">
                        <p className="text-sm font-bold text-secondary">Tujuan tercapai ✓</p>
                        <p className="mt-1 text-xs text-on-surface-variant">Goal ini sudah ditandai tuntas.</p>
                        <button type="button" onClick={() => setPengayaanGoal(goal)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"><Plus className="w-4 h-4" /> Buat pengayaan</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => openEditGoal(goal)} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                          <Pencil className="w-4 h-4" /> Evaluasi atau revisi
                        </button>
                        {goal.capaian >= goal.target && (
                          <button type="button" onClick={() => markGoalComplete(goal)} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-white">
                            <CheckCircle2 className="w-4 h-4" /> Tandai tuntas
                          </button>
                        )}
                      </div>
                    )}
                  </div>}
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
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-on-surface">Langkah analisis tugas</span>
                  <button type="button" onClick={() => setGoalForm((current) => ({ ...current, langkah_tugas: [...current.langkah_tugas, ''] }))} className="text-xs font-bold text-primary">+ Tambah langkah</button>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">Tulis 1 langkah dulu. Setelah siswa menguasainya, tambah langkah berikutnya.</p>
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
              <button type="button" onClick={() => setShowDetail((current) => !current)} className="flex w-full items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">
                <span>Detail pelaksanaan</span>
                <span className={`transition-transform ${showDetail ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showDetail && (
                <div className="space-y-4 pl-2 border-l-2 border-outline-variant/20">
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
                </div>
              )}
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

      {pengayaanGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="text-xs font-bold text-primary">PENGAYAAN</div>
            <h2 className="mt-2 text-xl font-bold">Buat target lanjutan</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Goal <strong>{pengayaanGoal.tujuan}</strong> sudah tercapai. Pilih cara membuat target pengayaan:</p>
            <div className="mt-6 grid gap-3">
              <button type="button" onClick={async () => {
                setGeneratingPengayaan(true)
                try {
                  const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'pengayaan',
                      student: { nama: studentName },
                      completedGoal: pengayaanGoal,
                      nextPhase: pengayaanGoal.fase_adaptasi ? String.fromCharCode(pengayaanGoal.fase_adaptasi.charCodeAt(0) + 1) : undefined,
                    }),
                  })
                  const data = await res.json()
                  if (res.ok && data.tujuan) {
                    const nextCp = cpOptions.find((cp) => cp.mata_pelajaran === data.mata_pelajaran && cp.fase === data.fase_adaptasi)
                    setGoalForm({
                      ...emptyGoalForm,
                      area: data.area || '',
                      tujuan: data.tujuan,
                      indikator: data.indikator || data.tujuan,
                      target: data.target || 80,
                      aktivitas: data.aktivitas || '',
                      media_alat: data.media_alat || '',
                      pelaksana: data.pelaksana || 'Guru kelas',
                      frekuensi: data.frekuensi || '',
                      metode_evaluasi: data.metode_evaluasi || 'Observasi kinerja',
                      langkah_tugas: data.langkah_tugas?.length ? data.langkah_tugas : [''],
                      jenis_target: data.jenis_target || 'non_akademik',
                      cp_id: nextCp?.id || '',
                      kriteria_tuntas: `Tuntas apabila mencapai minimal ${data.target || 80}%`,
                    })
                    setGoalModalOpen(true)
                  } else {
                    setGoalError('AI gagal membuat pengayaan. Coba manual.')
                  }
                } catch {
                  setGoalError('Gagal menghubungi AI. Coba manual.')
                }
                setGeneratingPengayaan(false)
                setPengayaanGoal(null)
              }} disabled={generatingPengayaan} className="w-full rounded-2xl border-2 border-primary bg-primary/5 px-5 py-4 text-left font-bold text-primary hover:bg-primary/10 disabled:opacity-40">
                <span className="block text-sm">🤖 Buat dengan AI</span>
                <span className="block text-xs font-normal text-on-surface-variant mt-0.5">Target baru akan difase {pengayaanGoal.fase_adaptasi ? String.fromCharCode(pengayaanGoal.fase_adaptasi.charCodeAt(0) + 1) : 'berikutnya'}</span>
              </button>
              <button type="button" onClick={() => {
                const identity = goalIdentity(pengayaanGoal)
                openNewGoal()
                setGoalForm((current) => ({ ...current, area: identity.subject || pengayaanGoal.area.split('·')[0].trim(), cp_id: pengayaanGoal.cp_id || '' }))
                setPengayaanGoal(null)
              }} className="w-full rounded-2xl border border-outline-variant/30 px-5 py-4 text-left font-bold text-on-surface hover:bg-surface-container-low">
                <span className="block text-sm">✏️ Buat manual</span>
                <span className="block text-xs font-normal text-on-surface-variant mt-0.5">Buka form kosong untuk diisi sendiri</span>
              </button>
            </div>
            <button type="button" onClick={() => setPengayaanGoal(null)} className="mt-4 text-sm font-bold text-on-surface-variant">Batal</button>
          </div>
        </div>
      )}
    </div>
  )
}

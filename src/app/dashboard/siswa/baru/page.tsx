'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Brain, Check, Sparkles, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'
import {
  ASSESSMENT_SCALE,
  TEAM_ROLES,
  ACADEMIC_ASSESSMENT_ITEMS,
  NON_ACADEMIC_ASSESSMENT_ITEMS,
  buildNonAcademicGoal,
  expectedPhaseFromClass,
  recommendCurriculumPhases,
  type AssessmentItem,
  type AssessmentValue,
  type CurriculumPhase,
  type PhaseRecommendation,
} from '@/lib/ppi-v2-data'

const categories = [
  ['slow_learner', 'Slow Learner'],
  ['disleksia', 'Kesulitan belajar spesifik / Disleksia'],
  ['adhd', 'ADHD'],
  ['autisme', 'Autisme'],
  ['tunanetra', 'Tunanetra'],
  ['tunarungu', 'Tunarungu'],
  ['hambatan_intelektual', 'Hambatan intelektual'],
  ['hambatan_motorik', 'Tunadaksa / hambatan motorik'],
  ['hambatan_komunikasi', 'Hambatan komunikasi'],
  ['lainnya', 'Lainnya'],
  ['belum_teridentifikasi', 'Belum terdiagnosis / dugaan'],
] as const

type AiSummary = {
  kekuatan: string[]
  kebutuhan: string[]
  ringkasan: string
  saran_referral: string
  rekomendasi_fase: PhaseRecommendation[]
}

function normalizeLongTermGoal(value: unknown): string {
  if (typeof value === 'string' && value.trim() !== '[object Object]') return value.trim()
  if (Array.isArray(value)) return value.map(normalizeLongTermGoal).filter(Boolean).join(' ')
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of ['tujuan', 'deskripsi', 'target', 'ringkasan', 'goal']) {
      const normalized = normalizeLongTermGoal(record[key])
      if (normalized) return normalized
    }
  }
  return ''
}

export default function TambahSiswaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [classes, setClasses] = useState<Array<{ id: string; nama: string; jenjang: string; tingkat: number | null; tahun_ajaran: string }>>([])
  const [nama, setNama] = useState('')
  const [kelasId, setKelasId] = useState('')
  const [kategori, setKategori] = useState('')
  const [statusDiagnosis, setStatusDiagnosis] = useState<'diketahui' | 'dugaan' | 'belum_terdiagnosis'>('diketahui')
  const [description, setDescription] = useState('')
  const [classification, setClassification] = useState<{ kategori: string; alasan: string; pertanyaan_lanjutan: string[] } | null>(null)
  const [team, setTeam] = useState<Record<string, string>>({ guru_kelas: user?.nama || '' })
  const [assessment, setAssessment] = useState<Record<string, AssessmentValue>>({})
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!user) return
    setTeam((current) => ({ ...current, guru_kelas: current.guru_kelas || user.nama }))
    supabase.from('kelas').select('id, nama, jenjang, tingkat, tahun_ajaran').order('tingkat').order('nama').then(({ data }) => setClasses(data || []))
  }, [user, loading, router])

  const selectedClass = classes.find((item) => item.id === kelasId)
  const expectedPhase = selectedClass ? expectedPhaseFromClass(selectedClass.nama, selectedClass.jenjang, selectedClass.tingkat) : null
  const academicPhase = expectedPhase || 'A'
  const [unlockedPhases, setUnlockedPhases] = useState<Record<string, CurriculumPhase[]>>({})
  const ACADEMIC_GROUPS = ['Membaca', 'Menulis', 'Matematika']
  useEffect(() => {
    if (academicPhase) {
      const needsReset = Object.values(unlockedPhases).some((phases) => phases[0] !== academicPhase)
      if (Object.keys(unlockedPhases).length === 0 || needsReset) {
        setUnlockedPhases({ Membaca: [academicPhase], Menulis: [academicPhase], Matematika: [academicPhase] })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicPhase])
  const allAssessmentItems = useMemo(() => {
    const items: AssessmentItem[] = []
    for (const [group, phases] of Object.entries(unlockedPhases)) {
      for (const phase of phases) {
        items.push(...ACADEMIC_ASSESSMENT_ITEMS.filter((i) => i.group === group && i.phase === phase))
      }
    }
    for (const item of NON_ACADEMIC_ASSESSMENT_ITEMS) {
      items.push(item)
    }
    return items
  }, [unlockedPhases])
  const groups = useMemo(() => {
    const g = new Set<string>()
    for (const [group] of Object.entries(unlockedPhases)) g.add(group)
    for (const item of NON_ACADEMIC_ASSESSMENT_ITEMS) g.add(item.group)
    return Array.from(g)
  }, [unlockedPhases])
  const requiredTeamComplete = ['guru_kelas', 'orang_tua', 'kepala_sekolah'].every((role) => team[role]?.trim())
  const identityComplete = nama.trim() && kelasId && kategori && requiredTeamComplete
  const assessmentComplete = allAssessmentItems.every((item) => assessment[item.key])
  const phaseRecommendations = recommendCurriculumPhases(assessment, academicPhase)

  function updateAssessment(key: string, value: AssessmentValue, group: string, phase?: CurriculumPhase) {
    setAssessment((current) => {
      const next = { ...current, [key]: value }
      if (phase && ACADEMIC_GROUPS.includes(group)) {
        const phases = unlockedPhases[group] || [academicPhase]
        const lowestPhase = phases[phases.length - 1]
        const ORDER: CurriculumPhase[] = ['A', 'B', 'C', 'D', 'E', 'F']
        const lowestIdx = ORDER.indexOf(lowestPhase)
        if (lowestIdx > 0) {
          const groupItems = ACADEMIC_ASSESSMENT_ITEMS.filter((i) => i.group === group && i.phase === lowestPhase)
          const allBelumBisa = groupItems.every((i) => next[i.key] === 'belum_bisa')
          if (allBelumBisa && !phases.includes(ORDER[lowestIdx - 1])) {
            setUnlockedPhases((prev) => ({
              ...prev,
              [group]: [...prev[group], ORDER[lowestIdx - 1]],
            }))
          }
        }
      }
      return next
    })
  }

  if (loading || !user) return <FullPageLoading label="Menyiapkan formulir PPI..." />

  async function classify() {
    if (!description.trim()) return
    setAnalyzing(true)
    setError('')
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'classify', description }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Analisis belum berhasil.')
      setClassification(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analisis belum berhasil.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function summarizeAssessment() {
    if (!assessmentComplete) return
    setSummarizing(true)
    setError('')
    try {
      const responses = allAssessmentItems.map((item) => ({
        domain: item.domain,
        kelompok: item.group,
        kemampuan: item.label,
        hasil: assessment[item.key],
        fase_uji: item.phase || null,
      }))
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assessment-summary',
          student: { nama, kategori, status_diagnosis: statusDiagnosis, deskripsi: description },
          assessment: responses,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Ringkasan asesmen belum berhasil.')
      const fallbackStrengths = responses
        .filter((item) => item.hasil === 'mandiri' || item.hasil === 'kadang')
        .map((item) => item.kemampuan)
        .slice(0, 6)
      const fallbackNeeds = responses
        .filter((item) => item.hasil === 'butuh_bantuan' || item.hasil === 'belum_bisa')
        .map((item) => item.hasil === 'belum_bisa'
          ? `Perlu pembelajaran bertahap untuk ${item.kemampuan.toLowerCase()}`
          : `Perlu bantuan dalam ${item.kemampuan.toLowerCase()}`)
        .slice(0, 6)
      setSummary({
        ...result,
        kekuatan: Array.isArray(result.kekuatan) && result.kekuatan.length > 0 ? result.kekuatan : fallbackStrengths,
        kebutuhan: Array.isArray(result.kebutuhan) && result.kebutuhan.length > 0 ? result.kebutuhan : fallbackNeeds,
        rekomendasi_fase: phaseRecommendations,
      })
      setStep(3)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ringkasan asesmen belum berhasil.')
    } finally {
      setSummarizing(false)
    }
  }

  function legacyLevel(keys: string[]) {
    const values = keys.map((key) => assessment[key]).filter(Boolean)
    if (values.includes('mandiri')) return 'Mandiri'
    if (values.includes('kadang') || values.includes('butuh_bantuan')) return 'Dengan bantuan'
    if (values.every((value) => value === 'belum_bisa')) return 'Belum mampu'
    return 'Belum diamati'
  }

  async function save() {
    if (!summary || !user) return
    setSaving(true)
    setError('')
    let studentId = ''
    try {
      const { data: student, error: studentError } = await supabase.from('siswa').insert({
        guru_id: user.id,
        kelas_id: kelasId,
        nama: nama.trim(),
        kategori,
        status_diagnosis: statusDiagnosis,
        deskripsi_kebutuhan: description.trim() || null,
        sumber_identifikasi: statusDiagnosis === 'diketahui' ? 'guru' : classification ? 'ai_dikonfirmasi' : 'belum_dikonfirmasi',
        saran_referral: summary.saran_referral || null,
        kekuatan_minat: summary.kekuatan.join('; '),
      }).select('id').single()
      if (studentError || !student) throw studentError || new Error('Profil siswa gagal dibuat.')
      studentId = student.id

      const teamRows = TEAM_ROLES
        .filter((role) => team[role.value]?.trim())
        .map((role) => ({
          siswa_id: studentId,
          nama: team[role.value].trim(),
          peran: role.value,
          wajib: role.required,
          dikonfirmasi: true,
        }))
      const assessmentRows = allAssessmentItems.map((item) => ({
        siswa_id: studentId,
        domain: item.domain,
        item_key: item.key,
        item_label: item.label,
        nilai: assessment[item.key],
        fase_uji: item.phase || null,
      }))
      const keysForGroup = (group: string) => allAssessmentItems.filter((item) => item.group === group).map((item) => item.key)

      const [, teamResult, assessmentResult, summaryResult] = await Promise.all([
        supabase.from('asesmen_awal').insert({
          siswa_id: studentId,
          fungsi_belajar: legacyLevel(['fokus_5_menit', 'mencoba_mandiri', 'mengikuti_instruksi']),
          membaca: legacyLevel(keysForGroup('Membaca')),
          menulis: legacyLevel(keysForGroup('Menulis')),
          matematika: legacyLevel(keysForGroup('Matematika')),
          komunikasi: legacyLevel(['menyampaikan_kebutuhan']),
          sosial_emosi: legacyLevel(['bermain_bersama', 'regulasi_frustrasi']),
          sensorik_motorik: legacyLevel(['motorik_jalan', 'halus_menggunting', 'halus_benda_kecil']),
          konsentrasi: legacyLevel(['fokus_5_menit']),
          kemandirian: legacyLevel(['adl_makan', 'adl_toilet', 'adl_berpakaian']),
          catatan: {
            ringkasan: summary.ringkasan,
            kekuatan: summary.kekuatan,
            kebutuhan: summary.kebutuhan,
            fase_akademik_diuji: academicPhase,
          },
        }),
        supabase.from('ppi_teams').insert(teamRows),
        supabase.from('assessment_responses').insert(assessmentRows),
        supabase.from('assessment_summaries').insert({
          siswa_id: studentId,
          kekuatan: summary.kekuatan,
          kebutuhan: summary.kebutuhan,
          ringkasan: summary.ringkasan,
          model: 'deepseek-chat',
          rekomendasi_fase: summary.rekomendasi_fase,
        }),
      ])
      if (teamResult.error) throw teamResult.error
      if (assessmentResult.error) throw assessmentResult.error
      if (summaryResult.error) throw summaryResult.error

      const ppiResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ppi',
          student: { nama, kategori, status_diagnosis: statusDiagnosis, deskripsi: description },
          baseline: { assessment: assessmentRows, kekuatan: summary.kekuatan, kebutuhan: summary.kebutuhan, rekomendasi_fase: summary.rekomendasi_fase },
        }),
      })
      const draft = await ppiResponse.json()
      if (!ppiResponse.ok) throw new Error(draft.error || 'Draf PPI gagal dibuat.')

      const start = new Date()
      const end = new Date(start)
      end.setMonth(end.getMonth() + 6)
      const { data: ppi, error: ppiError } = await supabase.from('ppi').insert({
        siswa_id: studentId,
        periode_mulai: start.toISOString().slice(0, 10),
        periode_selesai: end.toISOString().slice(0, 10),
        tujuan_jangka_panjang: normalizeLongTermGoal(draft.tujuan_jangka_panjang)
          || `Mengembangkan kemampuan akademik dan kemandirian ${nama.trim()} secara bertahap sesuai hasil asesmen selama periode PPI.`,
        strategi: draft.strategi || [],
        tim: teamRows,
        status: 'draft',
      }).select('id').single()
      if (ppiError || !ppi) throw ppiError || new Error('PPI gagal dibuat.')

      const { data: cpRows } = await supabase.from('curriculum_cp').select('id, mata_pelajaran, fase, nama_elemen')
      const generatedGoals = (draft.tujuan_jangka_pendek || []).map((goal: Record<string, unknown>) => {
        const area = String(goal.area || 'Kebutuhan individual')
        const academic = goal.jenis_target === 'akademik'
          || ['membaca', 'menulis', 'matematika', 'berhitung'].some((term) => area.toLowerCase().includes(term))
        const phaseFallback = summary.rekomendasi_fase.find((item) =>
          area.toLowerCase().includes(item.area.toLowerCase())
          || String(goal.mata_pelajaran || '').toLowerCase() === item.mata_pelajaran.toLowerCase()
        )
        const phase = academic ? String(goal.fase_adaptasi || phaseFallback?.fase || '') : ''
        const subject = String(goal.mata_pelajaran || phaseFallback?.mata_pelajaran || '')
        const element = String(goal.elemen_cp || phaseFallback?.elemen || '')
        const cp = (cpRows || []).find((item) =>
          item.mata_pelajaran.toLowerCase() === subject.toLowerCase()
          && item.fase === phase
          && (!element || item.nama_elemen.toLowerCase().includes(element.toLowerCase()) || element.toLowerCase().includes(item.nama_elemen.toLowerCase()))
        )
        return {
          ppi_id: ppi.id,
          area,
          tujuan: String(goal.tujuan || ''),
          indikator: String(goal.indikator || goal.tujuan || ''),
          target: Math.min(100, Math.max(1, Number(goal.target) || 80)),
          aktivitas: String(goal.aktivitas || ''),
          media_alat: String(goal.media_alat || ''),
          pelaksana: String(goal.pelaksana || 'Guru kelas'),
          frekuensi: String(goal.frekuensi || ''),
          metode_evaluasi: String(goal.metode_evaluasi || 'Observasi kinerja'),
          langkah_tugas: Array.isArray(goal.langkah_tugas) ? goal.langkah_tugas : [],
          jenis_target: academic ? 'akademik' : 'non_akademik',
          cp_id: cp?.id || null,
          fase_adaptasi: phase || null,
          kriteria_tuntas: `Tuntas apabila mencapai minimal ${Number(goal.target) || 80}%`,
        }
      }).filter((goal: { tujuan: string }) => goal.tujuan)
      const hasNonAcademic = generatedGoals.some((goal: { jenis_target: string }) => goal.jenis_target === 'non_akademik')
      const fallbackNonAcademic = buildNonAcademicGoal(nama.trim(), assessmentRows)
      const goals = hasNonAcademic ? generatedGoals : [...generatedGoals, {
        ppi_id: ppi.id,
        ...fallbackNonAcademic,
        capaian: 0,
        status: 'belum_dimulai',
        cp_id: null,
        fase_adaptasi: null,
      }]
      const { data: savedGoals, error: goalsError } = await supabase.from('tujuan_ppi').insert(goals).select('id, media_alat, frekuensi, aktivitas')
      if (goalsError) throw goalsError
      const accommodationRows = (savedGoals || []).flatMap((goal) => [
        goal.media_alat ? { tujuan_ppi_id: goal.id, jenis: 'media', deskripsi: goal.media_alat } : null,
        goal.aktivitas ? { tujuan_ppi_id: goal.id, jenis: 'strategi', deskripsi: goal.aktivitas } : null,
        goal.frekuensi ? { tujuan_ppi_id: goal.id, jenis: 'durasi', deskripsi: goal.frekuensi } : null,
      ].filter((item): item is { tujuan_ppi_id: string; jenis: string; deskripsi: string } => item !== null))
      if (accommodationRows.length > 0) {
        const { error: accommodationError } = await supabase.from('goal_accommodations').insert(accommodationRows)
        if (accommodationError) throw accommodationError
      }

      router.push(`/dashboard/siswa/${studentId}/ppi`)
    } catch (reason) {
      if (studentId) await supabase.from('siswa').delete().eq('id', studentId)
      setError(reason instanceof Error ? reason.message : 'Data siswa belum berhasil disimpan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header"><nav className="app-nav">
        <a href="/dashboard" className="flex items-center gap-2 text-on-surface-variant"><ArrowLeft className="h-4 w-4" /> Dashboard</a>
        <BrandLogo compact mobileIconOnly />
        <span className="text-sm font-bold text-primary">Tahap {step} dari 3</span>
      </nav></header>

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:pt-28">
        <div className="mb-6">
          <div className="text-xs font-bold text-primary">{step === 1 ? 'IDENTIFIKASI & TIM PPI' : step === 2 ? 'ASESMEN' : 'RINGKASAN ASESMEN'}</div>
          <h1 className="mt-1 text-3xl font-bold">{step === 1 ? 'Mulai profil PPI siswa' : step === 2 ? 'Amati kemampuan siswa' : 'Periksa hasil sebelum menyusun PPI'}</h1>
          <p className="mt-2 text-on-surface-variant">{step === 2 ? 'Nilai berdasarkan kondisi yang benar-benar terlihat, bukan berdasarkan usia atau kelas siswa.' : 'Keputusan akhir tetap berada pada guru dan Tim PPI.'}</p>
        </div>

        {step === 1 && <div className="space-y-4">
          <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="text-sm font-bold">Nama siswa</span><input value={nama} onChange={(event) => setNama(event.target.value)} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3" /></label>
              <label><span className="text-sm font-bold">Kelas</span><select value={kelasId} onChange={(event) => setKelasId(event.target.value)} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3"><option value="">Pilih kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.jenjang}</option>)}</select></label>
              <label><span className="text-sm font-bold">Jenis hambatan</span><select value={kategori} onChange={(event) => { setKategori(event.target.value); if (event.target.value === 'belum_teridentifikasi') setStatusDiagnosis('belum_terdiagnosis') }} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3"><option value="">Pilih kategori</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span className="text-sm font-bold">Status informasi</span><select value={statusDiagnosis} onChange={(event) => setStatusDiagnosis(event.target.value as typeof statusDiagnosis)} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3"><option value="diketahui">Sudah diketahui / ada informasi pendukung</option><option value="dugaan">Masih berupa dugaan</option><option value="belum_terdiagnosis">Belum terdiagnosis</option></select></label>
            </div>
            {(statusDiagnosis !== 'diketahui' || kategori === 'belum_teridentifikasi') && <div className="mt-4 rounded-2xl bg-primary/5 p-4">
              <label className="text-sm font-bold">Ceritakan kondisi yang diamati</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" placeholder="Contoh: siswa sulit mengikuti instruksi panjang dan sering meninggalkan tempat duduk..." />
              <button type="button" onClick={classify} disabled={!description.trim() || analyzing} className="mt-3 rounded-full bg-primary px-5 py-3 font-bold text-white disabled:opacity-40">{analyzing ? 'Menganalisis...' : 'Bantu Saya Analisis'}</button>
              {classification && <div className="mt-3 rounded-2xl bg-white p-4"><div className="text-xs font-bold text-primary">INDIKASI, BUKAN DIAGNOSIS</div><div className="mt-1 font-bold">{categories.find(([value]) => value === classification.kategori)?.[1] || classification.kategori}</div><p className="mt-1 text-sm text-on-surface-variant">{classification.alasan}</p><button type="button" onClick={() => { setKategori(classification.kategori); setStatusDiagnosis('dugaan') }} className="mt-3 text-sm font-bold text-primary">Gunakan sebagai indikasi awal</button></div>}
            </div>}
          </section>

          <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="font-bold">Tim PPI</h2></div>
            <p className="mt-1 text-sm text-on-surface-variant">Tiga peran pertama wajib diisi. Anggota lain dapat ditambahkan jika terlibat.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TEAM_ROLES.map((role) => <label key={role.value}><span className="text-sm font-bold">{role.label}{role.required && <span className="text-error"> *</span>}</span><input value={team[role.value] || ''} onChange={(event) => setTeam((current) => ({ ...current, [role.value]: event.target.value }))} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3" placeholder={`Nama ${role.label.toLowerCase()}`} /></label>)}
            </div>
          </section>
          <button type="button" disabled={!identityComplete} onClick={() => setStep(2)} className="w-full rounded-full bg-primary py-4 font-bold text-white disabled:opacity-40">Lanjut ke asesmen <ArrowRight className="ml-2 inline h-4 w-4" /></button>
        </div>}

        {step === 2 && <div className="space-y-4">
          <section className="rounded-3xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
            <div className="text-xs font-bold text-primary">ASESMEN ADAPTIF</div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Penentuan fase kemampuan</h2>
              <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">{selectedClass?.nama}</span>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">
              Nilai setiap indikator sesuai kondisi siswa. Jika semua indikator di suatu fase bernilai <strong>&quot;Belum bisa&quot;</strong>, sistem otomatis menampilkan indikator fase di bawahnya — terus berlanjut hingga ditemukan fase dengan minimal satu kemampuan.
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">
              Setiap area (Membaca, Menulis, Matematika) bisa memiliki fase yang berbeda.
            </p>
          </section>

          {groups.map((group) => {
            const isAcademic = ACADEMIC_GROUPS.includes(group)
            const groupPhases = isAcademic ? (unlockedPhases[group] || [academicPhase]) : []
            const phaseLabels: Record<string, string> = { A: 'Fase A (Kelas 1-2 SD)', B: 'Fase B (Kelas 3-4 SD)', C: 'Fase C (Kelas 5-6 SD)', D: 'Fase D (SMP)', E: 'Fase E (SMA-10)', F: 'Fase F (SMA 11-12)' }
            const phaseColors: Record<string, string> = { A: 'bg-amber-100 text-amber-800', B: 'bg-blue-100 text-blue-800', C: 'bg-green-100 text-green-800', D: 'bg-purple-100 text-purple-800', E: 'bg-pink-100 text-pink-800', F: 'bg-indigo-100 text-indigo-800' }
            return <section key={group} className="rounded-3xl border border-outline-variant/20 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold">{group}{!isAcademic && <span className="ml-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">Non-akademik</span>}</h2>
              {isAcademic && <div className="mt-2 flex flex-wrap gap-2">{groupPhases.map((ph) => <span key={ph} className={`rounded-full px-3 py-1 text-xs font-bold ${phaseColors[ph] || 'bg-primary/10 text-primary'}`}>{phaseLabels[ph] || `Fase ${ph}`}</span>)}</div>}
              <div className="mt-4 space-y-4">
                {isAcademic ? groupPhases.map((ph, phIdx) => {
                  const phaseItems = allAssessmentItems.filter((item) => item.group === group && item.phase === ph)
                  if (phaseItems.length === 0) return null
                  const isLower = phIdx > 0
                  const prevPhase = isLower ? groupPhases[phIdx - 1] : null
                  const prevAllBelumBisa = prevPhase ? allAssessmentItems.filter((i) => i.group === group && i.phase === prevPhase).every((i) => assessment[i.key] === 'belum_bisa') : true
                  const shouldShow = !isLower || prevAllBelumBisa
                  if (!shouldShow) return null
                  return <div key={ph} className={isLower ? 'rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-4 space-y-4' : 'space-y-4'}>
                    {isLower && <div className="text-xs font-bold text-primary">Lanjut ke indikator Fase {ph} (semua indikator fase sebelumnya &quot;Belum bisa&quot;)</div>}
                    {phaseItems.map((item) => <div key={item.key}>
                      <div className="text-sm font-semibold"><span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-xs font-bold">{ph}</span>{item.label}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{ASSESSMENT_SCALE.map((option) => <button key={option.value} type="button" onClick={() => updateAssessment(item.key, option.value, group, item.phase)} className={`rounded-2xl border px-3 py-3 text-sm font-bold ${assessment[item.key] === option.value ? 'border-primary bg-primary text-white' : 'border-outline-variant/25 bg-surface-container-low'}`}>{option.label}</button>)}</div>
                    </div>)}
                  </div>
                }) : allAssessmentItems.filter((item) => item.group === group).map((item) => (
                  <div key={item.key}>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{ASSESSMENT_SCALE.map((option) => <button key={option.value} type="button" onClick={() => updateAssessment(item.key, option.value, group, item.phase)} className={`rounded-2xl border px-3 py-3 text-sm font-bold ${assessment[item.key] === option.value ? 'border-primary bg-primary text-white' : 'border-outline-variant/25 bg-surface-container-low'}`}>{option.label}</button>)}</div>
                  </div>
                ))}
              </div>
            </section>
          })}
          <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setStep(1)} className="rounded-full bg-surface-container-high py-4 font-bold">Kembali</button><button type="button" disabled={!assessmentComplete || summarizing} onClick={summarizeAssessment} className="rounded-full bg-primary py-4 font-bold text-white disabled:opacity-40">{summarizing ? <LoadingSpinner label="Meringkas asesmen..." /> : 'Analisis hasil asesmen'}</button></div>
        </div>}

        {step === 3 && summary && <div className="space-y-4">
          <section className="rounded-3xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary"><Brain className="h-5 w-5" /><h2 className="font-bold">Ringkasan profil belajar</h2></div>
            <p className="mt-3 leading-relaxed">{summary.ringkasan}</p>
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-secondary/15 bg-[#E4F8EE] p-5"><h2 className="font-bold">Kekuatan</h2><ul className="mt-3 space-y-2 text-sm">{summary.kekuatan.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{item}</li>)}</ul></section>
            <section className="rounded-3xl border border-tertiary/15 bg-tertiary-fixed/25 p-5"><h2 className="font-bold">Kebutuhan dukungan</h2><ul className="mt-3 space-y-2 text-sm">{summary.kebutuhan.map((item) => <li key={item} className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" />{item}</li>)}</ul></section>
          </div>
          <section className="rounded-3xl border border-primary/15 bg-white p-5 sm:p-6">
            <div className="text-xs font-bold text-primary">REKOMENDASI ADAPTASI CP</div>
            <h2 className="mt-1 text-lg font-bold">Fase kemampuan awal yang disarankan</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {expectedPhase ? `Fase berdasarkan kelas adalah ${expectedPhase}. ` : ''}
              Setiap area dapat menggunakan fase berbeda sesuai kemampuan aktual siswa.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {summary.rekomendasi_fase.map((item) => {
                const adapted = expectedPhase && expectedPhase !== item.fase
                return <div key={item.area} className="rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-2"><span className="font-bold">{item.area}</span><span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Fase {item.fase}</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{item.alasan}</p>
                  {adapted && <div className="mt-3 text-xs font-bold text-tertiary">Target disesuaikan dari Fase {expectedPhase} ke Fase {item.fase} berdasarkan kemampuan saat ini.</div>}
                </div>
              })}
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">Rekomendasi ini menjadi dasar draf tujuan akademik. Guru tetap dapat mengganti CP pada halaman PPI.</p>
          </section>
          {summary.saran_referral && <section className="rounded-3xl border border-outline-variant/20 bg-white p-5"><div className="text-xs font-bold text-primary">SARAN REFERRAL</div><p className="mt-2 text-sm text-on-surface-variant">{summary.saran_referral}</p></section>}
          <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setStep(2)} className="rounded-full bg-surface-container-high py-4 font-bold">Perbaiki asesmen</button><button type="button" disabled={saving} onClick={save} className="rounded-full bg-primary py-4 font-bold text-white disabled:opacity-40">{saving ? <LoadingSpinner label="Menyusun PPI..." /> : 'Simpan dan susun draf PPI'}</button></div>
        </div>}

        {error && <div className="mt-4 rounded-2xl bg-error-container p-4 text-sm text-error">{error}</div>}
      </main>
    </div>
  )
}

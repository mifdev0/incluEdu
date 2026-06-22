'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, CalendarCheck, FileText, Target, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'
import type { PhaseRecommendation } from '@/lib/ppi-v2-data'
import { TRACKING_LEVELS } from '@/lib/ppi-v2-data'
import { AchievementDetailModal, type AchievementDetail } from '@/components/achievement-detail-modal'
import { TrackingChart } from '@/components/tracking-chart'

type Student = {
  nama: string
  kategori: string
  status_diagnosis: string
  deskripsi_kebutuhan: string | null
  kelas_id: string
  saran_referral: string | null
}

type Goal = {
  id: string
  area: string
  tujuan: string
  target: number
  capaian: number
  status: string
  jenis_target: 'akademik' | 'non_akademik'
  fase_adaptasi: string | null
  kriteria_tuntas: string | null
}

export default function ProfilSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [trackingDays, setTrackingDays] = useState(0)
  const [summary, setSummary] = useState<{ kekuatan: string[]; kebutuhan: string[]; ringkasan: string; rekomendasi_fase: PhaseRecommendation[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState<Array<{ tujuan_ppi_id: string; tanggal: string; sesi_ke: number; kode_bantuan: string; benar: number | null; total: number | null; langkah_label: string }>>([])
  const [selectedBreakdown, setSelectedBreakdown] = useState<'academic' | 'nonAcademic' | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    async function load() {
      const [studentResult, ppiResult, teamResult, trackingResult, summaryResult] = await Promise.all([
        supabase.from('siswa').select('nama, kategori, status_diagnosis, deskripsi_kebutuhan, kelas_id, saran_referral').eq('id', params.id).single(),
        supabase.from('ppi').select('id').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ppi_teams').select('id', { count: 'exact', head: true }).eq('siswa_id', params.id),
        supabase.from('daily_tracking').select('tujuan_ppi_id, tanggal, sesi_ke, kode_bantuan, benar, total, langkah_label').eq('siswa_id', params.id).order('sesi_ke'),
        supabase.from('assessment_summaries').select('kekuatan, kebutuhan, ringkasan, rekomendasi_fase').eq('siswa_id', params.id).maybeSingle(),
      ])
      setStudent(studentResult.data as Student)
      setTeamCount(teamResult.count || 0)
      setTrackingDays(new Set((trackingResult.data || []).map((item) => item.sesi_ke)).size)
      setTracking(trackingResult.data || [])
      if (summaryResult.data) setSummary(summaryResult.data as typeof summary)
      if (ppiResult.data) {
        const { data } = await supabase.from('tujuan_ppi')
          .select('id, area, tujuan, target, capaian, status, jenis_target, fase_adaptasi, kriteria_tuntas')
          .eq('ppi_id', ppiResult.data.id)
          .order('created_at')
        setGoals((data || []) as Goal[])
      }
      setLoading(false)
    }
    void load()
  }, [user, authLoading, router, params.id])

  if (authLoading || !user || loading) return <FullPageLoading label="Memuat profil siswa..." />
  if (!student) return <div className="min-h-screen grid place-items-center">Siswa tidak ditemukan.</div>

  const academic = goals.filter((goal) => goal.jenis_target === 'akademik')
  const nonAcademic = goals.filter((goal) => goal.jenis_target === 'non_akademik')
  const calculateGoalValue = (goal: Goal) => {
    const logs = tracking.filter((item) => item.tujuan_ppi_id === goal.id)
    if (logs.length === 0) return null
    if (goal.jenis_target === 'akademik') {
      const attempts = new Map<string, { benar: number; total: number }>()
      logs.forEach((item) => {
        if (item.benar !== null && item.total) attempts.set(item.tanggal, { benar: item.benar, total: item.total })
      })
      const values = Array.from(attempts.values())
      const correct = values.reduce((sum, item) => sum + item.benar, 0)
      const total = values.reduce((sum, item) => sum + item.total, 0)
      return total > 0 ? Math.round((correct / total) * 100) : null
    }
    const scores = logs.map((item) => Number(TRACKING_LEVELS.find((level) => level.code === item.kode_bantuan)?.score || 0))
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null
  }
  const average = (items: Goal[]) => {
    const values = items.map(calculateGoalValue).filter((value): value is number => value !== null)
    return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null
  }
  const academicAverage = average(academic)
  const nonAcademicAverage = average(nonAcademic)
  const buildDetails = (items: Goal[]): AchievementDetail[] => items.map((goal) => {
    const logs = tracking.filter((item) => item.tujuan_ppi_id === goal.id)
    const computedValue = calculateGoalValue(goal) ?? 0
    if (goal.jenis_target === 'akademik') {
      const attempts = new Map<string, { benar: number; total: number }>()
      logs.forEach((item) => {
        if (item.benar !== null && item.total) attempts.set(item.tanggal, { benar: item.benar, total: item.total })
      })
      const values = Array.from(attempts.values())
      const correct = values.reduce((sum, item) => sum + item.benar, 0)
      const total = values.reduce((sum, item) => sum + item.total, 0)
      return {
        id: goal.id,
        area: goal.area,
        goal: goal.tujuan,
        phase: goal.fase_adaptasi,
        value: computedValue,
        target: goal.target,
        criterion: goal.kriteria_tuntas,
        formula: total > 0 ? `${correct} jawaban benar ÷ ${total} total soal × 100 = ${computedValue}%` : 'Belum ada hasil benar/total yang tersimpan.',
        evidence: values.map((item, index) => `Percobaan ${index + 1}: ${item.benar} benar dari ${item.total} soal`),
      }
    }
    const scores = logs.map((item) => ({
      ...item,
      score: Number(TRACKING_LEVELS.find((level) => level.code === item.kode_bantuan)?.score || 0),
    }))
    return {
      id: goal.id,
      area: goal.area,
      goal: goal.tujuan,
      phase: goal.fase_adaptasi,
      value: computedValue,
      target: goal.target,
      criterion: goal.kriteria_tuntas,
      formula: scores.length > 0 ? `(${scores.map((item) => item.score).join(' + ')}) ÷ ${scores.length} = ${computedValue}%` : 'Belum ada level bantuan yang tersimpan.',
      evidence: scores.map((item) => `${item.tanggal}: ${item.langkah_label} — ${item.kode_bantuan} (${item.score})`),
    }
  })
  const academicDetails = buildDetails(academic)
  const nonAcademicDetails = buildDetails(nonAcademic)

  return <div className="min-h-screen bg-[#FAFAF5]">
    <header className="app-header"><nav className="app-nav"><a href={`/dashboard/kelas/${student.kelas_id}`} className="text-on-surface-variant">← Kembali</a><BrandLogo compact mobileIconOnly /></nav></header>
    <main className="mx-auto max-w-container-max px-4 pb-20 pt-24 sm:pt-28">
      <section className="rounded-[2rem] border border-outline-variant/20 bg-white p-5 sm:p-7">
        <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{student.nama[0]}</div><div><h1 className="text-3xl font-bold">{student.nama}</h1><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{student.kategori.replaceAll('_', ' ')}</span><span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">{student.status_diagnosis.replaceAll('_', ' ')}</span></div></div></div>
        {student.deskripsi_kebutuhan && <p className="mt-4 text-on-surface-variant">{student.deskripsi_kebutuhan}</p>}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button type="button" onClick={() => setSelectedBreakdown('academic')} className="rounded-2xl bg-primary p-4 text-left text-white transition-transform hover:-translate-y-0.5"><BookOpen className="h-5 w-5" /><div className="mt-3 text-3xl font-bold">{academicAverage === null ? '—' : `${academicAverage}%`}</div><div className="text-sm text-white/75">Target akademik tercapai</div><div className="mt-3 text-[11px] font-bold text-white/70">{academic.length === 0 ? 'Belum ada target akademik' : academicAverage === null ? 'Belum ditracking' : 'Lihat sumber nilai'}</div></button>
        <button type="button" onClick={() => setSelectedBreakdown('nonAcademic')} className="rounded-2xl border bg-white p-4 text-left transition-transform hover:-translate-y-0.5"><Target className="h-5 w-5 text-secondary" /><div className="mt-3 text-3xl font-bold">{nonAcademicAverage === null ? '—' : `${nonAcademicAverage}%`}</div><div className="text-sm text-on-surface-variant">Target non-akademik tercapai</div><div className="mt-3 text-[11px] font-bold text-primary">{nonAcademic.length === 0 ? 'Belum ada target non-akademik' : nonAcademicAverage === null ? 'Belum ditracking' : 'Lihat sumber nilai'}</div></button>
        <div className="rounded-2xl border bg-white p-4"><CalendarCheck className="h-5 w-5 text-primary" /><div className="mt-3 text-3xl font-bold">{trackingDays}</div><div className="text-sm text-on-surface-variant">Sesi tracking</div></div>
        <div className="rounded-2xl border bg-white p-4"><Users className="h-5 w-5 text-primary" /><div className="mt-3 text-3xl font-bold">{teamCount}</div><div className="text-sm text-on-surface-variant">Anggota Tim PPI</div></div>
      </div>

      {summary && <section className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl bg-[#E4F8EE] p-5"><h2 className="font-bold">Kekuatan siswa</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{summary.kekuatan.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className="rounded-3xl bg-tertiary-fixed/30 p-5"><h2 className="font-bold">Kebutuhan dukungan</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{summary.kebutuhan.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>}

      {Boolean(summary?.rekomendasi_fase?.length) && <section className="mt-4 rounded-3xl border border-primary/15 bg-white p-5 sm:p-6">
        <div className="text-xs font-bold text-primary">PENYESUAIAN CAPAIAN PEMBELAJARAN</div>
        <h2 className="mt-1 text-xl font-bold">Fase kemampuan yang digunakan</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Fase ditentukan per area berdasarkan asesmen awal, bukan semata-mata berdasarkan kelas siswa.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {summary?.rekomendasi_fase?.map((item) => <div key={item.area} className="rounded-2xl bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-2"><span className="font-bold">{item.area}</span><span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Fase {item.fase}</span></div>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{item.alasan}</p>
          </div>)}
        </div>
      </section>}

      <section className="mt-4 rounded-3xl border bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold text-primary">TARGET PPI</div><h2 className="mt-1 text-xl font-bold">Ketercapaian individual</h2></div><a href={`/dashboard/siswa/${params.id}/ppi`} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">Kelola PPI</a></div>
        <div className="mt-5 space-y-4">{goals.map((goal) => {
          const value = calculateGoalValue(goal)
          return <div key={goal.id} className="rounded-2xl bg-surface-container-low p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-bold text-primary">{goal.area}{goal.fase_adaptasi ? ` · CP Fase ${goal.fase_adaptasi}` : ''}</div><div className="mt-1 font-bold">{goal.tujuan}</div><div className="mt-1 text-xs text-on-surface-variant">{goal.kriteria_tuntas}</div></div><div className="text-right"><div className="text-2xl font-bold">{value === null ? '—' : `${value}%`}</div>{value === null && <div className="text-[10px] text-on-surface-variant">Belum ditracking</div>}</div></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary" style={{ width: `${value ?? 0}%` }} /></div>
          </div>
        })}</div>
      </section>

      <section className="mt-4 rounded-3xl border bg-white p-5 sm:p-6">
        <div className="text-xs font-bold text-primary">GRAFIK TRACKING</div>
        <h2 className="mt-1 text-xl font-bold">Perkembangan harian</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Nilai rata-rata akademik dan non-akademik setiap sesi tracking.</p>
        <div className="mt-5">
          <TrackingChart tracking={tracking} goals={goals} />
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <a href={`/dashboard/siswa/${params.id}/ppi`} className="rounded-full bg-primary-fixed px-5 py-3 text-center font-bold text-primary">Rencana PPI</a>
        <a href={`/dashboard/siswa/${params.id}/observasi`} className="rounded-full bg-primary px-5 py-3 text-center font-bold text-white">Tracking hari ini</a>
        <a href={`/dashboard/siswa/${params.id}/rapor`} className="rounded-full bg-primary px-5 py-3 text-center font-bold text-white"><FileText className="mr-2 inline h-4 w-4" />Evaluasi & rapor</a>
      </div>
    </main>
    <AchievementDetailModal
      open={selectedBreakdown === 'academic'}
      title="Ketercapaian target akademik"
      score={academicAverage ?? 0}
      description="Dihitung dari hasil benar/total pada setiap target akademik."
      details={academicDetails}
      onClose={() => setSelectedBreakdown(null)}
    />
    <AchievementDetailModal
      open={selectedBreakdown === 'nonAcademic'}
      title="Ketercapaian target non-akademik"
      score={nonAcademicAverage ?? 0}
      description="Dihitung dari level bantuan pada tracking harian."
      details={nonAcademicDetails}
      onClose={() => setSelectedBreakdown(null)}
    />
  </div>
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { TRACKING_LEVELS } from '@/lib/ppi-v2-data'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  jenis_target: 'akademik' | 'non_akademik'
  kriteria_tuntas: string | null
  langkah_tugas: string[]
}

export default function TrackingHarianPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [studentName, setStudentName] = useState('Siswa')
  const [goals, setGoals] = useState<Goal[]>([])
  const [ppiApproved, setPpiApproved] = useState(false)
  const [goalIndex, setGoalIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [correct, setCorrect] = useState('')
  const [total, setTotal] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [sessionNumber, setSessionNumber] = useState(1)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState<Array<{ goal: string; summary: string; suggestions: string[] }>>([])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    async function load() {
      const [studentResult, ppiResult, trackingResult] = await Promise.all([
        supabase.from('siswa').select('nama').eq('id', params.id).single(),
        supabase.from('ppi').select('id, status').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('daily_tracking').select('sesi_ke').eq('siswa_id', params.id).order('sesi_ke', { ascending: false }).limit(1),
      ])
      setStudentName(studentResult.data?.nama || 'Siswa')
      setSessionNumber(Number(trackingResult.data?.[0]?.sesi_ke || 0) + 1)
      if (ppiResult.data) {
        setPpiApproved(ppiResult.data.status === 'aktif')
        const { data } = await supabase.from('tujuan_ppi')
          .select('id, area, tujuan, indikator, target, jenis_target, kriteria_tuntas, langkah_tugas')
          .eq('ppi_id', ppiResult.data.id)
          .order('created_at')
        setGoals((data || []) as Goal[])
      }
      setLoading(false)
    }
    void load()
  }, [user, authLoading, router, params.id])

  const currentGoal = goals[goalIndex]
  const steps = useMemo(() => {
    if (!currentGoal) return []
    return Array.isArray(currentGoal.langkah_tugas) && currentGoal.langkah_tugas.length > 0
      ? currentGoal.langkah_tugas
      : [currentGoal.indikator || currentGoal.tujuan]
  }, [currentGoal])
  const allAnswered = steps.every((_, index) => answers[`${currentGoal?.id}_${index}`])

  if (authLoading || !user || loading) return <FullPageLoading label="Menyiapkan tracking harian..." />

  if (!ppiApproved) return <div className="min-h-screen grid place-items-center bg-[#FAFAF5] p-4 text-center"><div className="max-w-lg rounded-3xl border bg-white p-6"><h1 className="text-xl font-bold">PPI belum disetujui</h1><p className="mt-2 text-sm text-on-surface-variant">Dokumen PPI perlu ditinjau dan mendapat persetujuan orang tua sebelum tracking dimulai.</p><a href={`/dashboard/siswa/${params.id}/ppi`} className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 font-bold text-white">Buka kontrak layanan PPI</a></div></div>

  async function saveGoalTracking() {
    if (!currentGoal || !user || !allAnswered) return
    if (currentGoal.jenis_target === 'akademik' && (!total || Number(total) <= 0 || Number(correct) < 0 || Number(correct) > Number(total))) {
      setError('Isi jumlah benar dan total soal dengan benar.')
      return
    }
    setSaving(true)
    setError('')
    const rows = steps.map((step, index) => ({
      siswa_id: params.id,
      tujuan_ppi_id: currentGoal.id,
      guru_id: user.id,
      tanggal: new Date().toISOString().slice(0, 10),
      sesi_ke: sessionNumber,
      langkah_index: index,
      langkah_label: step,
      kode_bantuan: answers[`${currentGoal.id}_${index}`],
      benar: currentGoal.jenis_target === 'akademik' ? Number(correct) : null,
      total: currentGoal.jenis_target === 'akademik' ? Number(total) : null,
      catatan: note.trim() || null,
    }))
    const { error: insertError } = await supabase.from('daily_tracking').insert(rows)
    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    const since = new Date()
    since.setDate(since.getDate() - 14)
    const { data: recent } = await supabase.from('daily_tracking')
      .select('tanggal, kode_bantuan, langkah_label')
      .eq('tujuan_ppi_id', currentGoal.id)
      .gte('tanggal', since.toISOString().slice(0, 10))
      .order('tanggal')
    const bfRows = (recent || []).filter((item) => item.kode_bantuan === 'Bf')
    const uniqueDays = new Set((recent || []).map((item) => item.tanggal)).size
    const dates = (recent || []).map((item) => new Date(item.tanggal).getTime()).filter(Number.isFinite)
    const observedSpanDays = dates.length > 1 ? Math.floor((Math.max(...dates) - Math.min(...dates)) / 86400000) : 0
    if (uniqueDays >= 2 && observedSpanDays >= 12 && recent && bfRows.length === recent.length) {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'tracking-alert', goal: currentGoal, tracking: recent }),
        })
        const result = await response.json()
        if (response.ok && result.alert) setAlerts((current) => [...current, { goal: currentGoal.tujuan, summary: result.ringkasan, suggestions: result.saran_modifikasi || [] }])
      } catch {
        // Tracking tetap tersimpan meskipun saran AI gagal.
      }
    }

    const scores: number[] = (recent || []).map((item) => Number(TRACKING_LEVELS.find((level) => level.code === item.kode_bantuan)?.score || 0))
    const supportAchievement = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    const academicAchievement = currentGoal.jenis_target === 'akademik' && Number(total) > 0
      ? Math.round((Number(correct) / Number(total)) * 100)
      : supportAchievement
    const achievement = Math.max(0, Math.min(100, academicAchievement))
    const status = achievement >= currentGoal.target ? 'tercapai' : achievement >= currentGoal.target * 0.8 ? 'hampir_tercapai' : achievement > 0 ? 'berkembang' : 'belum_dimulai'
    await supabase.from('tujuan_ppi').update({ capaian: achievement, status, updated_at: new Date().toISOString() }).eq('id', currentGoal.id)

    setSaving(false)
    if (goalIndex < goals.length - 1) {
      setGoalIndex((index) => index + 1)
      setCorrect('')
      setTotal('')
      setNote('')
    } else {
      setCompleted(true)
    }
  }

  if (goals.length === 0) return <div className="min-h-screen grid place-items-center p-4 text-center"><div><h1 className="text-xl font-bold">Belum ada target aktif</h1><a href={`/dashboard/siswa/${params.id}/ppi`} className="mt-3 inline-block text-primary font-bold">Buka rancangan PPI</a></div></div>

  if (completed) return <div className="min-h-screen bg-[#FAFAF5] grid place-items-center p-4"><div className="w-full max-w-xl rounded-3xl bg-white p-6 text-center border">
    <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" />
    <div className="mt-4 text-xs font-bold text-primary">TRACKING {sessionNumber} SELESAI</div>
    <h1 className="mt-1 text-2xl font-bold">Semua target sudah dicatat</h1>
    <p className="mt-2 text-on-surface-variant">Capaian setiap target {studentName} telah diperbarui. Anda dapat langsung melanjutkan ke sesi berikutnya.</p>
    {alerts.map((alert) => <div key={alert.goal} className="mt-4 rounded-2xl bg-tertiary-fixed/30 p-4 text-left"><div className="flex gap-2 font-bold"><AlertTriangle className="h-5 w-5 text-tertiary" />Strategi perlu ditinjau</div><p className="mt-2 text-sm">{alert.summary}</p><ul className="mt-2 text-sm list-disc pl-5">{alert.suggestions.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <a href={`/dashboard/siswa/${params.id}`} className="inline-flex items-center justify-center rounded-full bg-surface-container-high px-6 py-3 font-bold">Lihat perkembangan</a>
      <button type="button" onClick={() => {
        setSessionNumber((current) => current + 1)
        setGoalIndex(0)
        setAnswers({})
        setCorrect('')
        setTotal('')
        setNote('')
        setAlerts([])
        setCompleted(false)
      }} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-white">
        Lanjut Tracking {sessionNumber + 1}<ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  </div></div>

  return <div className="min-h-screen bg-[#FAFAF5]">
    <header className="app-header"><nav className="app-nav"><a href={`/dashboard/siswa/${params.id}`} className="text-on-surface-variant">← Profil</a><BrandLogo compact mobileIconOnly /><span className="text-sm font-bold text-primary">{goalIndex + 1}/{goals.length} target</span></nav></header>
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:pt-28">
      <div className="mb-5"><div className="text-xs font-bold text-primary">TRACKING {sessionNumber}</div><h1 className="mt-1 text-3xl font-bold">{studentName}</h1><p className="mt-1 text-on-surface-variant">Selesaikan seluruh target untuk menutup Tracking {sessionNumber}.</p></div>
      <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{currentGoal.jenis_target === 'akademik' ? 'Akademik' : 'Non-akademik'}</span><span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">{currentGoal.area}</span></div>
        <h2 className="mt-3 text-xl font-bold">{currentGoal.tujuan}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{currentGoal.kriteria_tuntas || `Target ketuntasan ${currentGoal.target}%`}</p>

        <div className="mt-6 space-y-6">
          {steps.map((step, index) => <div key={`${currentGoal.id}_${index}`}>
            <div className="text-sm font-bold"><span className="text-primary">{index + 1}.</span> {step}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TRACKING_LEVELS.map((level) => <button key={level.code} type="button" onClick={() => setAnswers((current) => ({ ...current, [`${currentGoal.id}_${index}`]: level.code }))} className={`rounded-2xl border p-3 text-left ${answers[`${currentGoal.id}_${index}`] === level.code ? 'border-primary bg-primary text-white' : 'bg-surface-container-low'}`}><span className="block text-lg font-bold">{level.code}</span><span className="block text-sm font-bold">{level.label}</span><span className={`mt-1 block text-xs ${answers[`${currentGoal.id}_${index}`] === level.code ? 'text-white/75' : 'text-on-surface-variant'}`}>{level.description}</span></button>)}
            </div>
          </div>)}
        </div>

        {currentGoal.jenis_target === 'akademik' && <div className="mt-6 rounded-2xl bg-primary/5 p-4"><div className="font-bold">Hasil tugas atau soal</div><p className="mt-1 text-xs text-on-surface-variant">Nilai angka dihitung otomatis dari jawaban benar ÷ total soal.</p><div className="mt-3 grid grid-cols-2 gap-3"><label><span className="text-sm font-bold">Benar</span><input type="number" min="0" value={correct} onChange={(event) => setCorrect(event.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" /></label><label><span className="text-sm font-bold">Total</span><input type="number" min="1" value={total} onChange={(event) => setTotal(event.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3" /></label></div></div>}
        <label className="mt-5 block"><span className="text-sm font-bold">Catatan singkat (opsional)</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-2 w-full rounded-2xl border bg-surface-container-low px-4 py-3" placeholder="Situasi penting saat kegiatan berlangsung..." /></label>
        {error && <div className="mt-4 rounded-2xl bg-error-container p-3 text-sm text-error">{error}</div>}
        <button type="button" onClick={saveGoalTracking} disabled={!allAnswered || saving} className="mt-5 w-full rounded-full bg-primary py-4 font-bold text-white disabled:opacity-40">{saving ? <LoadingSpinner label="Menyimpan..." /> : goalIndex < goals.length - 1 ? <>Simpan dan lanjut target berikutnya <ArrowRight className="ml-2 inline h-4 w-4" /></> : `Selesaikan Tracking ${sessionNumber}`}</button>
      </section>
    </main>
  </div>
}

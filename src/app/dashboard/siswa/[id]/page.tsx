'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { ProgressChart } from '@/components/progress-chart'
import { ArrowUpRight, Brain, Heart, History, MessageCircle, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { FullPageLoading } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'
import { observationsToProgress, progressTrend, type ObservationRow } from '@/lib/observation-progress'
import { getScoreDetails, type ScoreAspect } from '@/lib/score-breakdown'
import { ScoreDetailModal } from '@/components/score-detail-modal'

type Student = {
  id: string
  nama: string
  kategori: string
  deskripsi_kebutuhan: string | null
  kelas_id: string
  kekuatan_minat: string | null
  riwayat_perkembangan: string | null
  layanan_sebelumnya: string | null
  sumber_rujukan: string | null
  akomodasi: string[]
}

type Baseline = {
  fungsi_belajar: string
  membaca: string | null
  menulis: string | null
  matematika: string | null
  komunikasi: string
  sosial_emosi: string
  sensorik_motorik: string
  konsentrasi: string | null
  kemandirian: string | null
}

export default function ProfilSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [progress, setProgress] = useState<ReturnType<typeof observationsToProgress>>([])
  const [goalCount, setGoalCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  const [observations, setObservations] = useState<ObservationRow[]>([])
  const [selectedScore, setSelectedScore] = useState<'average' | ScoreAspect | null>(null)
  const [baseline, setBaseline] = useState<Baseline | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!user) return

    Promise.all([
      supabase.from('siswa').select('id, nama, kategori, deskripsi_kebutuhan, kelas_id, kekuatan_minat, riwayat_perkembangan, layanan_sebelumnya, sumber_rujukan, akomodasi').eq('id', params.id).single(),
      supabase.from('observasi').select('minggu_ke, tanggal, jawaban').eq('siswa_id', params.id).order('minggu_ke'),
      supabase.from('ppi').select('id').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('asesmen_awal').select('fungsi_belajar, membaca, menulis, matematika, komunikasi, sosial_emosi, sensorik_motorik, konsentrasi, kemandirian').eq('siswa_id', params.id).maybeSingle(),
    ]).then(async ([studentResult, observationsResult, ppiResult, baselineResult]) => {
      if (studentResult.error) {
        setError(studentResult.error.message)
      } else {
        setStudent(studentResult.data)
        const rows = (observationsResult.data || []) as ObservationRow[]
        setObservations(rows)
        setProgress(observationsToProgress(rows, studentResult.data.kategori))
      }
      if (ppiResult.data) {
        const { count } = await supabase.from('tujuan_ppi').select('id', { count: 'exact', head: true }).eq('ppi_id', ppiResult.data.id)
        setGoalCount(count || 0)
      }
      if (baselineResult.data) setBaseline(baselineResult.data as Baseline)
      setDataLoading(false)
    })
  }, [user, loading, router, params.id])

  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat profil siswa..." />
  if (!student) return <div className="min-h-screen flex items-center justify-center p-4 text-center">{error || 'Siswa tidak ditemukan.'}</div>

  const latest = progress[progress.length - 1]
  const first = progress[0]
  const average = latest ? Math.round((latest.kognitif + latest.fokus + latest.sosial + latest.emosi) / 4) : null
  const previousAverage = first ? Math.round((first.kognitif + first.fokus + first.sosial + first.emosi) / 4) : null
  const change = average !== null && previousAverage !== null ? average - previousAverage : null
  const trend = progressTrend(progress)
  const latestObservation = observations[observations.length - 1]
  const latestPeriod = latestObservation
    ? `Berdasarkan observasi minggu ke-${latestObservation.minggu_ke}${latestObservation.tanggal ? ` · ${new Date(latestObservation.tanggal).toLocaleDateString('id-ID')}` : ''}`
    : 'Belum ada observasi'
  const aspectConfig: Record<ScoreAspect, { title: string; score: number }> | null = latest ? {
    kognitif: { title: 'Kognitif', score: latest.kognitif },
    fokus: { title: 'Fokus', score: latest.fokus },
    sosial: { title: 'Sosial', score: latest.sosial },
    emosi: { title: 'Emosi', score: latest.emosi },
  } : null
  const selectedDetails = selectedScore && selectedScore !== 'average' && latestObservation
    ? getScoreDetails(latestObservation.jawaban, student.kategori, selectedScore)
    : []
  const selectedAspectScore = selectedScore && selectedScore !== 'average' && aspectConfig
    ? aspectConfig[selectedScore].score
    : 0
  const detailWeights = selectedDetails.map((detail) => detail.weight)
  const detailFormula = selectedScore === 'average' && latest
    ? `(${latest.kognitif} Kognitif + ${latest.fokus} Fokus + ${latest.sosial} Sosial + ${latest.emosi} Emosi) ÷ 4 = ${average}`
    : detailWeights.length > 0
      ? `(${detailWeights.join(' + ')}) ÷ ${detailWeights.length} = ${selectedAspectScore}`
      : 'Nilai dasar digunakan karena indikator khusus belum tersedia pada observasi ini.'

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href={`/dashboard/kelas/${student.kelas_id}`} className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Kembali</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <div className="bg-surface rounded-[2rem] p-md md:p-lg border border-outline-variant/20 mb-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-pastel-purple text-primary flex items-center justify-center font-display text-headline-md shrink-0">{student.nama.charAt(0)}</div>
            <div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface">{student.nama}</h1>
              <span className="inline-block text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-label-sm mt-1">{student.kategori.replaceAll('_', ' ')}</span>
            </div>
          </div>
          <p className="text-on-surface-variant">{student.deskripsi_kebutuhan || 'Belum ada deskripsi kebutuhan tambahan.'}</p>
        </div>

        <section className="grid md:grid-cols-2 gap-3 mb-md">
          <div className="rounded-3xl bg-white border border-outline-variant/20 p-5">
            <div className="flex items-center gap-2 text-primary"><Sparkles className="w-5 h-5" /><h2 className="font-bold">Kekuatan dan minat</h2></div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{student.kekuatan_minat || 'Belum dicatat.'}</p>
          </div>
          <div className="rounded-3xl bg-white border border-outline-variant/20 p-5">
            <div className="flex items-center gap-2 text-primary"><History className="w-5 h-5" /><h2 className="font-bold">Riwayat dan layanan</h2></div>
            <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <p><span className="font-bold text-on-surface">Perkembangan:</span> {student.riwayat_perkembangan || 'Belum dicatat.'}</p>
              <p><span className="font-bold text-on-surface">Layanan sebelumnya:</span> {student.layanan_sebelumnya || 'Belum dicatat.'}</p>
              <p><span className="font-bold text-on-surface">Sumber rujukan:</span> {student.sumber_rujukan || 'Belum dicatat.'}</p>
            </div>
          </div>
          <div className="md:col-span-2 rounded-3xl bg-[#E4F8EE] border border-secondary/10 p-5">
            <div className="flex items-center gap-2 text-secondary"><ShieldCheck className="w-5 h-5" /><h2 className="font-bold text-on-surface">Akomodasi pembelajaran</h2></div>
            {Array.isArray(student.akomodasi) && student.akomodasi.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {student.akomodasi.map((item) => <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-on-surface">{item}</span>)}
              </div>
            ) : <p className="mt-3 text-sm text-on-surface-variant">Belum ada akomodasi yang dicatat.</p>}
          </div>
        </section>

        {baseline && (
          <section className="rounded-3xl bg-white border border-outline-variant/20 p-5 sm:p-md mb-md">
            <div>
              <span className="text-xs font-bold text-primary">ASESMEN KEMAMPUAN AWAL</span>
              <h2 className="mt-1 font-headline-sm text-headline-sm">Titik awal penyusunan PPI</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                ['Fungsi belajar', baseline.fungsi_belajar],
                ['Membaca', baseline.membaca],
                ['Menulis', baseline.menulis],
                ['Matematika', baseline.matematika],
                ['Komunikasi', baseline.komunikasi],
                ['Sosial dan emosi', baseline.sosial_emosi],
                ['Sensorik dan motorik', baseline.sensorik_motorik],
                ['Konsentrasi', baseline.konsentrasi],
                ['Kemandirian', baseline.kemandirian],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-surface-container-low p-3">
                  <div className="text-xs text-on-surface-variant">{label}</div>
                  <div className="mt-1 text-sm font-bold">{value || 'Belum dinilai'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {latest ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-md">
              <button type="button" onClick={() => setSelectedScore('average')} className="col-span-2 lg:col-span-1 rounded-2xl bg-primary text-white p-4 text-left hover:-translate-y-0.5 transition-transform">
                <div className="text-sm text-white/75">Rata-rata saat ini</div>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-bold">{average}</span>
                  {change !== null && <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" /> {change >= 0 ? '+' : ''}{change}</span>}
                </div>
                <div className="text-[11px] text-white/60 mt-3">Klik untuk melihat rumus</div>
              </button>
              {[
                { label: 'Kognitif', value: latest.kognitif, icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Fokus', value: latest.fokus, icon: Target, color: 'text-cyan-700', bg: 'bg-cyan-100' },
                { label: 'Sosial', value: latest.sosial, icon: MessageCircle, color: 'text-secondary', bg: 'bg-secondary-container/40' },
                { label: 'Emosi', value: latest.emosi, icon: Heart, color: 'text-amber-700', bg: 'bg-amber-100' },
              ].map((item) => (
                <button key={item.label} type="button" onClick={() => setSelectedScore(item.label.toLowerCase() as ScoreAspect)} className="rounded-2xl bg-white border border-outline-variant/20 p-4 text-left hover:-translate-y-0.5 hover:border-primary/30 transition-all">
                  <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-3`}><item.icon className="w-4 h-4" /></div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-on-surface-variant mt-1">{item.label}</div>
                  <div className="text-[10px] text-primary font-bold mt-3">Lihat sumber nilai</div>
                </button>
              ))}
            </div>

            <section className="bg-white rounded-[2rem] p-md md:p-lg border border-outline-variant/20 mb-md">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm">Grafik perkembangan</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Dihitung dari observasi yang tersimpan.</p>
                </div>
                <span className={`w-fit text-sm px-4 py-2 rounded-full font-label-md ${trend === 'membaik' ? 'text-secondary bg-secondary-container/40' : trend === 'menurun' ? 'text-error bg-error-container/50' : 'text-tertiary bg-tertiary-fixed/40'}`}>
                  {trend === 'membaik' ? '↑ Membaik' : trend === 'menurun' ? '↓ Perlu perhatian' : '→ Stabil'}
                </span>
              </div>
              <ProgressChart data={progress} />
            </section>
          </>
        ) : (
          <section className="rounded-3xl border-2 border-dashed border-outline-variant/40 bg-white p-8 text-center mb-md">
            <h2 className="font-bold text-lg">Belum ada data perkembangan</h2>
            <p className="text-sm text-on-surface-variant mt-1">Isi observasi pertama untuk mulai membentuk grafik dan nilai perkembangan.</p>
          </section>
        )}

        <section className="bg-[#F1E8FF] rounded-[2rem] p-5 sm:p-md border border-primary/10 mb-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary">PROGRAM PEMBELAJARAN INDIVIDUAL</span>
              <h2 className="font-headline-sm text-headline-sm mt-1">{goalCount} tujuan sedang dipantau</h2>
            </div>
            <a href={`/dashboard/siswa/${params.id}/ppi`} className="w-full sm:w-auto px-5 py-3 rounded-full bg-white text-primary text-center font-bold">Buka PPI</a>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <a href={`/dashboard/siswa/${params.id}/ppi`} className="px-6 py-3 text-center rounded-full bg-primary-fixed text-primary font-bold">Lihat PPI</a>
          <a href={`/dashboard/siswa/${params.id}/panduan`} className="px-6 py-3 text-center rounded-full bg-surface-container-high text-on-surface font-bold">Lihat Panduan</a>
          <a href={`/dashboard/siswa/${params.id}/observasi`} className="px-6 py-3 text-center rounded-full bg-primary text-white font-bold">Isi Observasi</a>
          <a href={`/dashboard/siswa/${params.id}/rapor`} className="px-6 py-3 text-center rounded-full bg-primary text-white font-bold">Lihat Rapor</a>
        </div>
      </main>
      {latest && selectedScore && (
        <ScoreDetailModal
          open
          title={selectedScore === 'average' ? 'Rata-rata keseluruhan' : aspectConfig?.[selectedScore]?.title || ''}
          score={selectedScore === 'average' ? average || 0 : selectedAspectScore}
          period={latestPeriod}
          details={selectedDetails}
          formula={detailFormula}
          onClose={() => setSelectedScore(null)}
        />
      )}
    </div>
  )
}

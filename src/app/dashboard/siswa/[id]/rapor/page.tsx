'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { Sparkles, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FullPageLoading } from '@/components/loading-state'

type Analysis = {
  trend: 'membaik' | 'stagnan' | 'menurun'
  nilai_kognitif: number
  nilai_sosial: number
  nilai_emosional: number
  nilai_rata_rata: number
  highlights: string[]
  concerns: string[]
  rekomendasi_guru: string[]
  rapor_narasi: string
  rekomendasi_ortu: string[]
}

export default function RaporSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [student, setStudent] = useState<{ nama: string; kategori: string } | null>(null)
  const [analisis, setAnalisis] = useState<Analysis | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    Promise.all([
      supabase.from('siswa').select('nama, kategori').eq('id', params.id).single(),
      supabase.from('analisis_ai').select('hasil').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]).then(([studentResult, analysisResult]) => {
      if (studentResult.data) setStudent(studentResult.data)
      if (analysisResult.data?.hasil) setAnalisis(analysisResult.data.hasil as Analysis)
      setDataLoading(false)
    })
  }, [user, authLoading, router, params.id])
  if (authLoading || !user || dataLoading) return <FullPageLoading label="Memuat rapor siswa..." />

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const [{ data: student }, { data: observations }, { data: ppi }] = await Promise.all([
        supabase.from('siswa').select('nama, kategori, deskripsi_kebutuhan').eq('id', params.id).single(),
        supabase.from('observasi').select('tanggal, minggu_ke, jawaban, catatan').eq('siswa_id', params.id).order('tanggal'),
        supabase.from('ppi').select('id').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const { data: goals } = ppi
        ? await supabase.from('tujuan_ppi').select('area, tujuan, indikator, target, capaian, status').eq('ppi_id', ppi.id)
        : { data: [] }
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', student, goals, observations }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Analisis AI gagal')
      setAnalisis(result)
      await supabase.from('analisis_ai').insert({
        siswa_id: params.id,
        periode: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        hasil: result,
        model: 'deepseek-chat',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analisis AI gagal')
    } finally {
      setLoading(false)
    }
  }
  async function handleCopyNarasi() {
    if (!analisis) return
    await navigator.clipboard.writeText(analisis.rapor_narasi)
    alert('Narasi rapor berhasil disalin!')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Profil</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-3xl mx-auto px-4 sm:px-gutter pb-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Rapor {student?.nama || 'Siswa'}</h2>
          {student?.kategori && <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">{student.kategori.replaceAll('_', ' ')}</span>}
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md mb-lg">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-lg">
          <button onClick={handleGenerate} disabled={loading}
            className="w-full px-6 py-3 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Menganalisis...' : 'Generate Analisis AI'}
          </button>
          <button onClick={handleCopyNarasi} disabled={!analisis} className="w-full px-6 py-3 rounded-full bg-surface-container-high text-on-surface font-label-md disabled:opacity-40">Salin Narasi</button>
        </div>
        {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container mb-md">{error}</div>}

        {!analisis ? (
          <div className="rounded-3xl border-2 border-dashed border-outline-variant/40 bg-white p-8 text-center">
            <h3 className="font-bold text-lg">Belum ada analisis rapor</h3>
            <p className="text-sm text-on-surface-variant mt-1">Klik “Generate Analisis AI” setelah data observasi tersedia.</p>
          </div>
        ) : <div className="space-y-lg">
          {/* Nilai */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Nilai Angka</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Kognitif', value: analisis.nilai_kognitif, color: 'text-primary' },
                { label: 'Sosial', value: analisis.nilai_sosial, color: 'text-on-secondary-container' },
                { label: 'Emosional', value: analisis.nilai_emosional, color: 'text-tertiary' },
                { label: 'Rata-rata', value: analisis.nilai_rata_rata, color: 'text-on-surface' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-surface-container-low rounded-xl">
                  <div className={`font-display text-display-lg-mobile font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-on-surface-variant font-label-md text-label-md mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Tren Perkembangan</h3>
              <span className="text-sm text-on-secondary-container bg-secondary-container/40 px-4 py-2 rounded-full font-label-md">{analisis.trend === 'membaik' ? '↑ Membaik' : analisis.trend === 'menurun' ? '↓ Menurun' : '→ Stabil'}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-pastel-green rounded-xl p-lg border border-secondary/10 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-secondary-container mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Highlights
            </h3>
            <ul className="space-y-2">
              {analisis.highlights.map((h, i) => (
                <li key={i} className="text-on-surface font-body-md text-body-md flex items-start gap-2">
                  <Check className="w-4 h-4 text-on-secondary-container shrink-0 mt-0.5" /> {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Concerns */}
          <div className="bg-pastel-yellow rounded-xl p-lg border border-tertiary/10 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-tertiary mb-3">Area Perhatian</h3>
            <ul className="space-y-2">
              {analisis.concerns.map((c, i) => (
                <li key={i} className="text-on-surface font-body-md text-body-md flex items-start gap-2">
                  <span className="text-tertiary shrink-0 mt-0.5 font-bold">!</span> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Narasi */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Narasi Rapor</h3>
            <p className="text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-line">{analisis.rapor_narasi}</p>
          </div>

          {/* Rekomendasi Guru */}
          <div className="bg-pastel-purple rounded-xl p-lg border border-primary/10 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Rekomendasi Guru</h3>
            <ul className="space-y-2">
              {analisis.rekomendasi_guru.map((r, i) => (
                <li key={i} className="text-on-surface font-body-md text-body-md flex items-start gap-2">
                  <span className="text-primary shrink-0">→</span> {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Rekomendasi Ortu */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Rekomendasi untuk Orang Tua</h3>
            <ul className="space-y-2">
              {analisis.rekomendasi_ortu.map((r, i) => (
                <li key={i} className="text-on-surface font-body-md text-body-md flex items-start gap-2">
                  <span className="text-primary shrink-0">→</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { Sparkles, Check } from 'lucide-react'

export default function RaporSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])
  if (authLoading || !user) return null

  const analisis = {
    trend: 'membaik' as const,
    nilai_kognitif: 78, nilai_sosial: 72, nilai_emosional: 85, nilai_rata_rata: 78,
    highlights: [
      'Menunjukkan peningkatan dalam memahami instruksi tanpa bantuan',
      'Kemampuan sosial mulai aktif — berani menyapa teman',
      'Motivasi belajar meningkat — antusias saat pelajaran dimulai',
    ],
    concerns: ['Masih perlu waktu tambahan untuk menyelesaikan tugas', 'Kadang kehilangan fokus saat instruksi terlalu panjang'],
    rekomendasi_guru: [
      'Lanjutkan memberikan instruksi langkah demi langkah',
      'Berikan pujian spesifik setiap kali Budi berhasil mandiri',
      'Kurangi panjang instruksi, tambahkan visual aid',
    ],
    rapor_narasi: `Budi telah menunjukkan perkembangan yang menggembirakan selama satu bulan terakhir. Ia semakin mampu mengikuti instruksi dengan mandiri, terutama ketika instruksi diberikan secara bertahap. Budi juga mulai menunjukkan keberanian untuk berinteraksi dengan teman-temannya, sebuah kemajuan besar dari sebelumnya yang cenderung pasif.

Motivasi belajarnya meningkat signifikan — Budi kini antusias mengikuti pelajaran dan sering mengangkat tangan untuk mencoba menjawab. Meskipun masih membutuhkan waktu tambahan untuk tugas tertulis, kemandirian yang ia tunjukkan adalah pencapaian yang patut diapresiasi.

Dengan dukungan yang konsisten, Budi memiliki potensi besar untuk terus berkembang. Kami akan terus memberikan bimbingan sesuai kebutuhannya. Terima kasih atas dukungan Bapak/Ibu di rumah.`,
    rekomendasi_ortu: [
      'Bacakan cerita pendek setiap malam dan ajak Budi menceritakan kembali dengan kata-katanya sendiri',
      'Berikan pujian spesifik ketika Budi berhasil menyelesaikan tugas sendiri',
    ],
  }

  function handleGenerate() { setLoading(true); setTimeout(() => setLoading(false), 2000) }
  async function handleCopyNarasi() { await navigator.clipboard.writeText(analisis.rapor_narasi); alert('Narasi rapor berhasil disalin!') }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="flex items-center gap-4">
            <a href={`/dashboard/siswa/${params.id}`} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← Profil</a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact /></a>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-3xl mx-auto px-gutter pb-xl">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Rapor Budi Santoso</h2>
          <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">Slow Learner</span>
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md mb-lg">Periode: November 2025</p>

        <div className="flex gap-3 mb-lg flex-wrap">
          <button onClick={handleGenerate} disabled={loading}
            className="px-6 py-3 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Menganalisis...' : 'Generate Analisis AI'}
          </button>
          <button onClick={handleCopyNarasi} className="px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-higher text-on-surface font-label-md text-label-md transition-all">Salin Narasi</button>
        </div>

        <div className="space-y-lg">
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
              <span className="text-sm text-on-secondary-container bg-secondary-container/40 px-4 py-2 rounded-full font-label-md">↑ Membaik</span>
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
        </div>
      </main>
    </div>
  )
}

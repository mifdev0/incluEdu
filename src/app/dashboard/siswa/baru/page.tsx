'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { ArrowRight, Brain, Check, Sparkles } from 'lucide-react'

const categories = [
  'Slow Learner',
  'Kesulitan belajar spesifik / Disleksia',
  'ADHD',
  'Autisme',
  'Tunanetra',
  'Tunarungu',
  'Hambatan intelektual',
  'Hambatan fisik atau motorik',
  'Hambatan komunikasi',
  'Lainnya',
]

const baselineAreas = [
  { key: 'belajar', label: 'Fungsi belajar' },
  { key: 'komunikasi', label: 'Komunikasi' },
  { key: 'sosial', label: 'Sosial dan emosi' },
  { key: 'motorik', label: 'Sensorik dan motorik' },
]

function classifyDescription(description: string) {
  const text = description.toLowerCase()
  if (/(fokus|diam|impuls|menyela|bangku|teralihkan)/.test(text)) {
    return { kategori: 'ADHD', alasan: 'Deskripsi menunjukkan hambatan perhatian, pengendalian impuls, atau regulasi aktivitas. Ini masih berupa saran kebutuhan belajar, bukan diagnosis.' }
  }
  if (/(baca|huruf|menulis|mengeja|kata)/.test(text)) {
    return { kategori: 'Kesulitan belajar spesifik / Disleksia', alasan: 'Hambatan yang paling menonjol berkaitan dengan membaca atau menulis. Guru tetap perlu mengonfirmasi melalui asesmen dan pengamatan lanjutan.' }
  }
  if (/(kontak mata|rutinitas|perubahan jadwal|komunikasi|bersosialisasi)/.test(text)) {
    return { kategori: 'Autisme', alasan: 'Deskripsi menunjukkan kebutuhan dukungan pada komunikasi sosial atau fleksibilitas rutinitas. Saran ini tidak menggantikan pemeriksaan tenaga ahli.' }
  }
  if (/(melihat|penglihatan|papan tulis|braille)/.test(text)) {
    return { kategori: 'Tunanetra', alasan: 'Deskripsi menunjukkan hambatan akses visual sehingga dukungan pembelajaran berbasis audio atau taktil perlu dipertimbangkan.' }
  }
  if (/(mendengar|pendengaran|gerak bibir|bahasa isyarat)/.test(text)) {
    return { kategori: 'Tunarungu', alasan: 'Deskripsi menunjukkan hambatan akses auditori sehingga strategi visual dan komunikasi alternatif perlu dipertimbangkan.' }
  }
  return { kategori: 'Slow Learner', alasan: 'Deskripsi mengarah pada kebutuhan waktu belajar, pengulangan, atau instruksi bertahap. Konfirmasikan dengan asesmen kemampuan awal sebelum menetapkan program.' }
}

export default function TambahSiswaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nama, setNama] = useState('')
  const [kelas, setKelas] = useState('')
  const [identificationMode, setIdentificationMode] = useState<'known' | 'unsure'>('known')
  const [kategori, setKategori] = useState('')
  const [description, setDescription] = useState('')
  const [suggestion, setSuggestion] = useState<{ kategori: string; alasan: string } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [baseline, setBaseline] = useState<Record<string, string>>({})

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  if (loading || !user) return null

  function analyze() {
    if (!description.trim()) return
    setAnalyzing(true)
    setTimeout(() => {
      setSuggestion(classifyDescription(description))
      setAnalyzing(false)
    }, 700)
  }

  function saveStudent() {
    const draft = { nama, kelas, kategori, description, baseline, createdAt: new Date().toISOString() }
    localStorage.setItem('incluedu_student_draft', JSON.stringify(draft))
    router.push('/dashboard/siswa/1/ppi')
  }

  const canContinueProfile = nama.trim() && kelas.trim() && kategori
  const baselineComplete = baselineAreas.every((area) => baseline[area.key])

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/dashboard" className="text-on-surface-variant font-label-md">← <span className="hidden min-[390px]:inline">Dashboard</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          <span className="text-xs sm:text-sm font-bold text-primary">Langkah {step} dari 2</span>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-3xl mx-auto px-4 sm:px-gutter pb-xl">
        <div className="mb-md">
          <span className="text-sm font-bold text-primary">{step === 1 ? 'PROFIL DAN IDENTIFIKASI' : 'ASESMEN KEMAMPUAN AWAL'}</span>
          <h1 className="font-headline-md text-[30px] sm:text-headline-md mt-1">{step === 1 ? 'Tambah siswa yang didampingi' : 'Tentukan titik awal siswa'}</h1>
          <p className="text-on-surface-variant mt-2">{step === 1 ? 'Masukkan hanya siswa yang memerlukan program pendampingan individual.' : 'Hasil ini menjadi baseline untuk menyusun tujuan PPI dan membaca perkembangan.'}</p>
        </div>

        {step === 1 ? (
          <section className="bg-white rounded-3xl border border-outline-variant/20 p-5 sm:p-lg space-y-md">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Nama siswa</label>
                <input value={nama} onChange={(event) => setNama(event.target.value)} className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nama lengkap siswa" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Kelas / kelompok</label>
                <input value={kelas} onChange={(event) => setKelas(event.target.value)} className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Contoh: Kelas 7A" />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Apakah kebutuhan siswa sudah diketahui?</label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => { setIdentificationMode('known'); setSuggestion(null) }} className={`text-left rounded-2xl p-4 border transition-colors ${identificationMode === 'known' ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                  <div className="font-bold">Sudah diketahui</div>
                  <div className="text-sm text-on-surface-variant mt-1">Pilih kebutuhan dari daftar.</div>
                </button>
                <button type="button" onClick={() => { setIdentificationMode('unsure'); setKategori('') }} className={`text-left rounded-2xl p-4 border transition-colors ${identificationMode === 'unsure' ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                  <div className="font-bold">Masih ragu</div>
                  <div className="text-sm text-on-surface-variant mt-1">Ceritakan hasil pengamatan kepada AI.</div>
                </button>
              </div>
            </div>

            {identificationMode === 'known' ? (
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Kebutuhan belajar utama</label>
                <select value={kategori} onChange={(event) => setKategori(event.target.value)} className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Pilih kebutuhan siswa</option>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2">Deskripsikan perilaku, kemampuan, dan hambatan yang diamati</label>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="w-full min-h-36 px-5 py-4 rounded-3xl bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Contoh: Siswa mudah teralihkan, sering meninggalkan bangku, dan membutuhkan instruksi yang singkat..." />
                </div>
                <button type="button" onClick={analyze} disabled={!description.trim() || analyzing} className="w-full sm:w-auto px-5 py-3 rounded-full bg-primary text-white font-bold disabled:opacity-40 inline-flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {analyzing ? 'Menganalisis...' : 'Bantu identifikasi'}
                </button>
                {suggestion && (
                  <div className="rounded-3xl bg-[#F1E8FF] p-5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0"><Brain className="w-5 h-5" /></div>
                      <div>
                        <div className="text-xs font-bold text-primary">SARAN KEBUTUHAN BELAJAR</div>
                        <h3 className="font-bold text-lg mt-1">{suggestion.kategori}</h3>
                        <p className="text-sm text-on-surface-variant mt-1">{suggestion.alasan}</p>
                        <button type="button" onClick={() => setKategori(suggestion.kategori)} className={`mt-4 px-4 py-2 rounded-full font-bold text-sm ${kategori === suggestion.kategori ? 'bg-secondary text-white' : 'bg-white text-primary'}`}>
                          {kategori === suggestion.kategori ? 'Saran digunakan' : 'Gunakan saran ini'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-on-surface-variant">AI hanya menyarankan kebutuhan pembelajaran dan tidak memberikan diagnosis medis. Guru tetap menentukan hasil akhir.</p>
              </div>
            )}

            <button type="button" disabled={!canContinueProfile} onClick={() => setStep(2)} className="w-full py-4 rounded-full bg-primary text-white font-bold disabled:opacity-40 inline-flex items-center justify-center gap-2">
              Lanjut ke asesmen awal <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        ) : (
          <section className="space-y-4">
            {baselineAreas.map((area) => (
              <div key={area.key} className="bg-white rounded-3xl border border-outline-variant/20 p-5">
                <h2 className="font-bold text-lg mb-3">{area.label}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Belum diamati', 'Belum mampu', 'Dengan bantuan', 'Mandiri'].map((option) => (
                    <button key={option} type="button" onClick={() => setBaseline((current) => ({ ...current, [area.key]: option }))} className={`min-h-16 rounded-2xl px-3 text-sm font-bold border ${baseline[area.key] === option ? 'border-primary bg-primary text-white' : 'border-outline-variant/30 bg-white'}`}>
                      {baseline[area.key] === option && <Check className="w-4 h-4 mx-auto mb-1" />}
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="grid sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setStep(1)} className="w-full py-4 rounded-full bg-surface-container-high font-bold">Kembali</button>
              <button type="button" disabled={!baselineComplete} onClick={saveStudent} className="w-full py-4 rounded-full bg-primary text-white font-bold disabled:opacity-40">Simpan dan susun PPI</button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

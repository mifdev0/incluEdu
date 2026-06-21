'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { ArrowRight, Brain, Check, Plus, Sparkles, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FullPageLoading } from '@/components/loading-state'

const categories = [
  { value: 'slow_learner', label: 'Slow Learner' },
  { value: 'disleksia', label: 'Kesulitan belajar spesifik / Disleksia' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'autisme', label: 'Autisme' },
  { value: 'tunanetra', label: 'Tunanetra' },
  { value: 'tunarungu', label: 'Tunarungu' },
  { value: 'hambatan_intelektual', label: 'Hambatan intelektual' },
  { value: 'hambatan_motorik', label: 'Hambatan fisik atau motorik' },
  { value: 'hambatan_komunikasi', label: 'Hambatan komunikasi' },
  { value: 'lainnya', label: 'Lainnya' },
]

const baselineAreas = [
  { key: 'belajar', label: 'Fungsi belajar' },
  { key: 'membaca', label: 'Kemampuan membaca' },
  { key: 'menulis', label: 'Kemampuan menulis' },
  { key: 'matematika', label: 'Kemampuan matematika' },
  { key: 'komunikasi', label: 'Komunikasi' },
  { key: 'sosial', label: 'Sosial dan emosi' },
  { key: 'motorik', label: 'Sensorik dan motorik' },
  { key: 'konsentrasi', label: 'Konsentrasi dan respons instruksi' },
  { key: 'kemandirian', label: 'Kemandirian dan bina diri' },
]

export default function TambahSiswaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nama, setNama] = useState('')
  const [kelas, setKelas] = useState('')
  const [kelasList, setKelasList] = useState<Array<{ id: string; nama: string; jenjang: string; tahun_ajaran: string }>>([])
  const [identificationMode, setIdentificationMode] = useState<'known' | 'unsure'>('known')
  const [kategori, setKategori] = useState('')
  const [description, setDescription] = useState('')
  const [strengths, setStrengths] = useState('')
  const [developmentHistory, setDevelopmentHistory] = useState('')
  const [previousServices, setPreviousServices] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [accommodations, setAccommodations] = useState<string[]>([])
  const [accommodationDescription, setAccommodationDescription] = useState('')
  const [accommodationSummary, setAccommodationSummary] = useState('')
  const [accommodationSuggestions, setAccommodationSuggestions] = useState<Array<{ value: string; alasan: string }>>([])
  const [manualAccommodation, setManualAccommodation] = useState('')
  const [showManualAccommodation, setShowManualAccommodation] = useState(false)
  const [suggestingAccommodations, setSuggestingAccommodations] = useState(false)
  const [suggestion, setSuggestion] = useState<{ kategori: string; keyakinan: string; alasan: string; pertanyaan_lanjutan: string[]; strategi_awal: string[] } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [baseline, setBaseline] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (user) {
      supabase.from('kelas').select('id, nama, jenjang, tahun_ajaran').order('created_at').then(({ data }) => {
        setKelasList(data || [])
      })
    }
  }, [user, loading, router])
  if (loading || !user) return <FullPageLoading label="Menyiapkan formulir siswa..." />
  const finalAccommodations = Array.from(new Set(accommodations))

  async function analyze() {
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
      if (!response.ok) throw new Error(result.error || 'AI gagal menganalisis')
      setSuggestion(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI gagal menganalisis')
    } finally {
      setAnalyzing(false)
    }
  }

  async function suggestAccommodations() {
    if (!accommodationDescription.trim()) return
    setSuggestingAccommodations(true)
    setError('')
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accommodations',
          category: kategori,
          description: accommodationDescription,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Saran dukungan gagal dibuat')
      setAccommodationSummary(String(result.ringkasan || ''))
      setAccommodationSuggestions(Array.isArray(result.saran) ? result.saran : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saran dukungan gagal dibuat')
    } finally {
      setSuggestingAccommodations(false)
    }
  }

  function addAccommodation(value: string) {
    const cleaned = value.trim()
    if (!cleaned) return
    setAccommodations((current) => current.includes(cleaned) ? current : [...current, cleaned])
  }

  async function saveStudent() {
    if (!user) return
    setSaving(true)
    setError('')
    let createdStudentId: string | null = null
    try {
      const { data: student, error: studentError } = await supabase.from('siswa').insert({
        guru_id: user.id,
        kelas_id: kelas,
        nama: nama.trim(),
        kategori,
        deskripsi_kebutuhan: description.trim() || null,
        sumber_identifikasi: identificationMode === 'unsure' ? 'ai_dikonfirmasi' : 'guru',
        kekuatan_minat: strengths.trim() || null,
        riwayat_perkembangan: developmentHistory.trim() || null,
        layanan_sebelumnya: previousServices.trim() || null,
        sumber_rujukan: referralSource.trim() || null,
        akomodasi: finalAccommodations,
      }).select('id').single()
      if (studentError) throw new Error(formatSaveError(studentError, 'Menyimpan profil siswa'))
      createdStudentId = student.id

      const { error: baselineError } = await supabase.from('asesmen_awal').insert({
        siswa_id: student.id,
        fungsi_belajar: baseline.belajar,
        komunikasi: baseline.komunikasi,
        sosial_emosi: baseline.sosial,
        sensorik_motorik: baseline.motorik,
        membaca: baseline.membaca,
        menulis: baseline.menulis,
        matematika: baseline.matematika,
        konsentrasi: baseline.konsentrasi,
        kemandirian: baseline.kemandirian,
        catatan: {
          kekuatan_minat: strengths.trim(),
          riwayat_perkembangan: developmentHistory.trim(),
          layanan_sebelumnya: previousServices.trim(),
          akomodasi: finalAccommodations,
        },
      })
      if (baselineError) throw new Error(formatSaveError(baselineError, 'Menyimpan asesmen awal'))

      const aiResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ppi',
          student: {
            nama,
            kategori,
            deskripsi: description,
            kekuatan_minat: strengths,
            riwayat_perkembangan: developmentHistory,
            layanan_sebelumnya: previousServices,
            akomodasi: finalAccommodations,
          },
          baseline,
        }),
      })
      const aiPpi = await aiResponse.json()
      if (!aiResponse.ok) throw new Error(`Menyusun PPI dengan AI: ${aiPpi.error || 'permintaan gagal'}`)

      const start = new Date()
      const end = new Date(start)
      end.setMonth(end.getMonth() + 6)
      const { data: ppi, error: ppiError } = await supabase.from('ppi').insert({
        siswa_id: student.id,
        periode_mulai: start.toISOString().slice(0, 10),
        periode_selesai: end.toISOString().slice(0, 10),
        tujuan_jangka_panjang: aiPpi.tujuan_jangka_panjang,
        strategi: aiPpi.strategi,
        tim: [{ peran: 'guru', nama: user.nama }],
        status: 'draft',
      }).select('id').single()
      if (ppiError) throw new Error(formatSaveError(ppiError, 'Menyimpan rancangan PPI'))

      const goals = (Array.isArray(aiPpi.tujuan_jangka_pendek) ? aiPpi.tujuan_jangka_pendek : [])
        .map((goal: Record<string, unknown>) => ({
          ppi_id: ppi.id,
          area: String(goal.area || 'Kebutuhan belajar'),
          tujuan: String(goal.tujuan || goal.deskripsi || ''),
          indikator: String(goal.indikator || goal.tujuan || 'Indikator perlu ditinjau guru'),
          target: Math.min(100, Math.max(0, Number(goal.target) || 70)),
          capaian: 0,
          status: 'belum_dimulai',
          aktivitas: String(goal.aktivitas || ''),
          media_alat: String(goal.media_alat || ''),
          pelaksana: String(goal.pelaksana || 'Guru kelas'),
          frekuensi: String(goal.frekuensi || ''),
          metode_evaluasi: String(goal.metode_evaluasi || 'Observasi kinerja'),
          langkah_tugas: Array.isArray(goal.langkah_tugas) && goal.langkah_tugas.length > 0
            ? goal.langkah_tugas.map(String).filter(Boolean)
            : [String(goal.indikator || goal.tujuan || '')].filter(Boolean),
        }))
        .filter((goal: { tujuan: string }) => goal.tujuan.trim().length > 0)
      if (goals.length === 0) throw new Error('AI tidak menghasilkan tujuan PPI yang dapat disimpan.')
      const { error: goalsError } = await supabase.from('tujuan_ppi').insert(goals)
      if (goalsError) throw new Error(formatSaveError(goalsError, 'Menyimpan tujuan PPI'))

      router.push(`/dashboard/siswa/${student.id}/ppi`)
    } catch (err) {
      if (createdStudentId) {
        await supabase.from('siswa').delete().eq('id', createdStudentId)
      }
      setError(formatSaveError(err, 'Menyimpan siswa'))
    } finally {
      setSaving(false)
    }
  }

  const canContinueProfile = nama.trim() && kelas.trim() && kategori
  const baselineComplete = baselineAreas.every((area) => baseline[area.key])

  function formatSaveError(err: unknown, stage: string) {
    if (err instanceof Error) return err.message
    const details = typeof err === 'object' && err !== null
      ? err as { message?: string; details?: string; hint?: string; code?: string }
      : null
    const technicalMessage = [details?.message, details?.details, details?.hint].filter(Boolean).join(' ')

    if (details?.code === '23503' && technicalMessage.includes('profiles')) {
      return 'Profil akun guru belum terbentuk di database. Jalankan migrasi backfill profiles, lalu keluar dan login kembali.'
    }
    if (details?.code === '23503' && technicalMessage.includes('kelas')) {
      return 'Kelas yang dipilih sudah tidak tersedia. Kembali dan pilih kelas lagi.'
    }
    if (details?.code === '42501') {
      return 'Akses database ditolak. Pastikan sesi login aktif dan kebijakan RLS sudah dijalankan.'
    }
    if (technicalMessage) return `${stage}: ${technicalMessage}`
    return `${stage} gagal. Periksa konfigurasi Supabase lalu coba kembali.`
  }

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
                {kelasList.length > 0 ? (
                  <select value={kelas} onChange={(event) => setKelas(event.target.value)} className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Pilih kelas yang tersedia</option>
                    {kelasList.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.jenjang} · {item.tahun_ajaran}</option>)}
                  </select>
                ) : (
                  <div className="rounded-2xl bg-tertiary-fixed/30 p-4 text-sm">
                    Belum ada kelas. <a href="/dashboard/kelas/baru" className="font-bold text-primary underline">Buat kelas terlebih dahulu</a>.
                  </div>
                )}
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
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
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
                        <h3 className="font-bold text-lg mt-1">{categories.find((item) => item.value === suggestion.kategori)?.label || suggestion.kategori}</h3>
                        <div className="text-xs font-bold text-on-surface-variant mt-1">Keyakinan AI: {suggestion.keyakinan}</div>
                        <p className="text-sm text-on-surface-variant mt-1">{suggestion.alasan}</p>
                        {suggestion.pertanyaan_lanjutan?.length > 0 && (
                          <ul className="text-sm text-on-surface-variant mt-3 space-y-1">
                            {suggestion.pertanyaan_lanjutan.map((item) => <li key={item}>• {item}</li>)}
                          </ul>
                        )}
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

            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low/50 p-4 sm:p-5">
              <div className="font-bold text-on-surface">Kenali siswa secara singkat</div>
              <p className="mt-1 text-sm text-on-surface-variant">Isi yang diketahui saja. Bagian ini boleh dikosongkan dan dilengkapi kemudian.</p>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="block text-sm font-bold text-on-surface mb-2">Apa yang disukai atau sudah dikuasai siswa?</span>
                  <textarea value={strengths} onChange={(event) => setStrengths(event.target.value)} rows={2} className="w-full px-4 py-3 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Misalnya: suka musik dan mudah memahami penjelasan lisan." />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-on-surface mb-2">Apa yang perlu diketahui dari perkembangan siswa?</span>
                  <textarea value={developmentHistory} onChange={(event) => setDevelopmentHistory(event.target.value)} rows={2} className="w-full px-4 py-3 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Misalnya: mulai lebih berani berbicara, tetapi masih sulit fokus lama." />
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-bold text-on-surface mb-2">Pernah mendapat bantuan khusus?</span>
                    <input value={previousServices} onChange={(event) => setPreviousServices(event.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Terapi, GPK, atau belum ada" />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-bold text-on-surface mb-2">Informasi kebutuhan berasal dari siapa?</span>
                    <input value={referralSource} onChange={(event) => setReferralSource(event.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Guru, orang tua, psikolog, atau lainnya" />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
                <div className="font-bold text-on-surface">Ceritakan hambatan yang terlihat saat belajar</div>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  Tuliskan kondisi yang benar-benar terlihat di kelas. IncluEdu akan membantu menyiapkan beberapa dukungan yang dapat dicoba.
                </p>
              </div>

              <textarea
                value={accommodationDescription}
                onChange={(event) => setAccommodationDescription(event.target.value)}
                rows={4}
                placeholder="Contoh: Anton mudah terdistraksi oleh suara teman, kesulitan mengikuti tiga instruksi sekaligus, dan mulai gelisah setelah belajar sekitar 15 menit."
                className="mt-4 w-full rounded-3xl border border-outline-variant/30 bg-surface-container-low px-5 py-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={suggestAccommodations} disabled={!accommodationDescription.trim() || suggestingAccommodations} className="mt-3 w-full sm:w-auto rounded-full bg-primary px-5 py-3 font-bold text-white disabled:opacity-40 inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                {suggestingAccommodations ? 'Menyusun saran...' : 'Bantu susun dukungan'}
              </button>

              {accommodationSuggestions.length > 0 && (
                <div className="mt-4 rounded-3xl border border-primary/15 bg-white p-4 sm:p-5">
                  <div className="text-xs font-bold text-primary">SARAN BERDASARKAN CERITA GURU</div>
                  {accommodationSummary && <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{accommodationSummary}</p>}
                  <div className="mt-4 space-y-2">
                    {accommodationSuggestions.map((suggestion) => {
                      const selected = accommodations.includes(suggestion.value)
                      return (
                        <button key={suggestion.value} type="button" onClick={() => selected
                          ? setAccommodations((current) => current.filter((item) => item !== suggestion.value))
                          : addAccommodation(suggestion.value)}
                          className={`w-full rounded-2xl border p-4 text-left transition-colors ${selected ? 'border-secondary bg-secondary-container/25' : 'border-outline-variant/25 bg-surface-container-low'}`}
                        >
                          <span className="flex items-start gap-3">
                            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-secondary text-white' : 'bg-white text-primary'}`}>
                              {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </span>
                            <span>
                              <span className="block text-sm font-bold">{suggestion.value}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">{suggestion.alasan}</span>
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4">
                {!showManualAccommodation ? (
                  <button type="button" onClick={() => setShowManualAccommodation(true)} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                    <Plus className="h-4 w-4" /> Ada dukungan lain yang belum tercantum?
                  </button>
                ) : (
                  <div className="rounded-2xl border border-outline-variant/25 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-on-surface">Tambahkan dukungan lain</span>
                      <button type="button" onClick={() => { setShowManualAccommodation(false); setManualAccommodation('') }} className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container" aria-label="Tutup"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input value={manualAccommodation} onChange={(event) => setManualAccommodation(event.target.value)} onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addAccommodation(manualAccommodation)
                          setManualAccommodation('')
                          setShowManualAccommodation(false)
                        }
                      }} placeholder="Contoh: boleh memegang benda kecil agar lebih tenang" className="min-w-0 flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 outline-none focus:border-primary" />
                      <button type="button" onClick={() => { addAccommodation(manualAccommodation); setManualAccommodation(''); setShowManualAccommodation(false) }} disabled={!manualAccommodation.trim()} className="shrink-0 rounded-2xl bg-primary px-4 font-bold text-white disabled:opacity-40">Simpan</button>
                    </div>
                  </div>
                )}
              </div>

              {finalAccommodations.length > 0 && (
                <div className="mt-4 rounded-2xl bg-[#E4F8EE] p-4">
                  <div className="text-xs font-bold text-secondary">DUKUNGAN YANG DIKONFIRMASI GURU</div>
                  <div className="mt-3 space-y-2">
                    {finalAccommodations.map((option) => (
                      <div key={option} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5">
                        <span className="text-sm font-bold">{option}</span>
                        <button type="button" onClick={() => setAccommodations((current) => current.filter((item) => item !== option))} className="shrink-0 rounded-full p-1.5 text-error hover:bg-error-container" aria-label={`Hapus ${option}`}><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
            <button type="button" disabled={!canContinueProfile || kelasList.length === 0} onClick={() => setStep(2)} className="w-full py-4 rounded-full bg-primary text-white font-bold disabled:opacity-40 inline-flex items-center justify-center gap-2">
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
              <button type="button" disabled={!baselineComplete || saving} onClick={saveStudent} className="w-full py-4 rounded-full bg-primary text-white font-bold disabled:opacity-40">{saving ? 'Menyimpan dan menyusun PPI...' : 'Simpan dan susun PPI dengan AI'}</button>
            </div>
            {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
          </section>
        )}
      </main>
    </div>
  )
}

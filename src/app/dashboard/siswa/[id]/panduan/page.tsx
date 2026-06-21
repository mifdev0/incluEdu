'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { PANDUAN_ABK } from '@/lib/panduan-data'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'

export default function PanduanSiswaPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [studentName, setStudentName] = useState('')
  const [kategori, setKategori] = useState('lainnya')
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [confirmedAt, setConfirmedAt] = useState('')
  const panduan = PANDUAN_ABK[kategori]
  const semuaTercheck = panduan?.adaptasi_mengajar.every((_, i) => checked[i])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) {
      Promise.all([
        supabase.from('siswa').select('nama, kategori').eq('id', params.id).single(),
        supabase.from('panduan_konfirmasi').select('kategori, checklist, dikonfirmasi_at').eq('siswa_id', params.id).maybeSingle(),
      ]).then(([studentResult, confirmationResult]) => {
        let normalizedCategory = 'lainnya'
        if (studentResult.data) {
          setStudentName(studentResult.data.nama)
          normalizedCategory = ['slow_learner', 'disleksia', 'adhd', 'autisme'].includes(studentResult.data.kategori)
            ? studentResult.data.kategori
            : ['tunanetra', 'tunarungu'].includes(studentResult.data.kategori) ? 'sensorik' : 'lainnya'
          setKategori(normalizedCategory)
        }
        const savedChecklist = confirmationResult.data?.checklist
        if (confirmationResult.data?.kategori === normalizedCategory && Array.isArray(savedChecklist)) {
          setChecked(Object.fromEntries(savedChecklist.map((value) => [Number(value), true])))
          if (confirmationResult.data?.dikonfirmasi_at) setConfirmedAt(confirmationResult.data.dikonfirmasi_at)
        }
        setDataLoading(false)
      })
    }
  }, [user, authLoading, router, params.id])
  if (authLoading || !user || dataLoading) return <FullPageLoading label="Memuat panduan..." />

  async function handleConfirm() {
    if (!semuaTercheck) return
    setSaving(true)
    setSaveError('')
    const now = new Date().toISOString()
    const checklist = Object.entries(checked)
      .filter(([, value]) => value)
      .map(([index]) => Number(index))

    const { error } = await supabase.from('panduan_konfirmasi').upsert({
      siswa_id: params.id,
      kategori,
      checklist,
      dikonfirmasi_at: now,
      updated_at: now,
    }, { onConflict: 'siswa_id' })

    setSaving(false)
    if (error) {
      setSaveError(error.message.includes('panduan_konfirmasi')
        ? 'Database panduan belum diperbarui. Jalankan migration panduan_konfirmasi di Supabase.'
        : error.message)
      return
    }
    router.push(`/dashboard/siswa/${params.id}/observasi`)
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
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Panduan Mengajar</h2>
        <p className="text-on-surface-variant mb-2">{studentName}</p>
        <p className="text-sm text-on-surface-variant mb-lg">Guru wajib membaca dan mencentang setiap poin yang sudah diterapkan sebelum melakukan observasi.</p>

        <div className="space-y-lg">
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{panduan?.judul}</h3>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{panduan?.deskripsi}</p>
          </div>

          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Checklist Adaptasi Mengajar</h4>
            <p className="text-on-surface-variant font-body-md text-body-md mb-md">Centang setelah poin benar-benar diterapkan pada pembelajaran siswa:</p>
            <div className="space-y-2">
              {panduan?.adaptasi_mengajar.map((item, i) => (
                <label key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl sm:rounded-full cursor-pointer transition-all ${checked[i] ? 'bg-secondary-container/30 border border-secondary-container' : 'bg-surface-container-low border border-transparent'}`}>
                  <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))} className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
                  <span className="text-on-surface font-body-md text-body-md leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Tips Observasi</h4>
            <ul className="space-y-2">
              {panduan?.tips_observasi.map((tip, i) => (
                <li key={i} className="text-on-surface-variant font-body-md text-body-md flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {confirmedAt && (
            <div className="flex items-start gap-3 rounded-2xl bg-secondary-container/30 p-4 text-sm text-on-surface">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <div>
                <div className="font-bold">Panduan sudah dikonfirmasi</div>
                <div className="mt-1 text-on-surface-variant">Checklist tersimpan dan dapat diperbarui jika penerapannya berubah.</div>
              </div>
            </div>
          )}

          {saveError && <p className="rounded-2xl bg-error-container/60 px-4 py-3 text-sm font-medium text-error">{saveError}</p>}

          <button onClick={handleConfirm} disabled={!semuaTercheck || saving}
            className="w-full py-4 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? <LoadingSpinner label="Menyimpan checklist..." /> : 'Simpan checklist dan lanjut observasi'}
          </button>
          {!semuaTercheck && (
            <p className="text-sm text-tertiary text-center font-label-md">Centang semua adaptasi mengajar untuk melanjutkan</p>
          )}
        </div>
      </main>
    </div>
  )
}

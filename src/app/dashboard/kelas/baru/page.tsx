'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { supabase } from '@/lib/supabase'
import { FullPageLoading } from '@/components/loading-state'

export default function KelasBaruPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [jenjang, setJenjang] = useState('SMP')
  const currentYear = new Date().getFullYear()
  const defaultAcademicYear = new Date().getMonth() < 6 ? `${currentYear - 1}/${currentYear}` : `${currentYear}/${currentYear + 1}`
  const [tahunAjaran, setTahunAjaran] = useState(defaultAcademicYear)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  if (loading || !user) return <FullPageLoading label="Menyiapkan formulir kelas..." />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    const { error: insertError } = await supabase.from('kelas').insert({
      guru_id: user.id,
      nama: nama.trim(),
      jenjang,
      tahun_ajaran: tahunAjaran.trim(),
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    router.push('/dashboard/siswa/baru')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href="/dashboard" className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Dashboard</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-3xl mx-auto px-4 sm:px-gutter pb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Buat Kelompok Pendampingan</h2>
        <p className="text-on-surface-variant mb-lg">Kelompokkan siswa berdasarkan kelas atau jadwal pendampingan agar pemantauan lebih mudah.</p>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="bg-surface rounded-3xl p-5 sm:p-lg border border-outline-variant/20 hard-shadow space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Informasi Kelas</h3>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Nama Kelas</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Nama kelas" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Jenjang</label>
                <select value={jenjang} onChange={e => setJenjang(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
              <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Tahun Ajaran</label>
                <input type="text" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Contoh: 2026/2027" />
              </div>
            </div>
          </div>

          {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
          <button type="submit" disabled={saving} className="w-full py-4 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40">{saving ? 'Menyimpan...' : 'Simpan Kelas'}</button>
        </form>
      </main>
    </div>
  )
}

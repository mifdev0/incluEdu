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
  const [jenjang, setJenjang] = useState('SD')
  const [tingkat, setTingkat] = useState(1)
  const [rombel, setRombel] = useState('A')
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
    const nama = `Kelas ${tingkat}${rombel.trim() ? ` ${rombel.trim().toUpperCase()}` : ''}`
    const { error: insertError } = await supabase.from('kelas').insert({
      guru_id: user.id,
      nama,
      jenjang,
      tingkat,
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
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Buat Kelas</h2>
        <p className="text-on-surface-variant mb-lg">Masukkan jenjang, tingkat kelas, dan rombel. Data ini menentukan fase asesmen siswa secara otomatis.</p>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="bg-surface rounded-3xl p-5 sm:p-lg border border-outline-variant/20 hard-shadow space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Informasi Kelas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Jenjang</label>
                <select value={jenjang} onChange={e => {
                  const nextLevel = e.target.value
                  setJenjang(nextLevel)
                  setTingkat(nextLevel === 'SD' ? 1 : nextLevel === 'SMP' ? 7 : 10)
                }} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
              <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Tingkat kelas</label>
                <select value={tingkat} onChange={e => setTingkat(Number(e.target.value))} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low">
                  {(jenjang === 'SD' ? [1, 2, 3, 4, 5, 6] : jenjang === 'SMP' ? [7, 8, 9] : [10, 11, 12]).map((value) => <option key={value} value={value}>Kelas {value}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Rombel</label>
                <input type="text" value={rombel} onChange={e => setRombel(e.target.value)} maxLength={10} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Contoh: A" />
              </div>
            </div>
            <div>
                <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Tahun Ajaran</label>
                <input type="text" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Contoh: 2026/2027" />
            </div>
          </div>

          {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
          <button type="submit" disabled={saving} className="w-full py-4 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-40">{saving ? 'Menyimpan...' : 'Simpan Kelas'}</button>
        </form>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

const KATEGORI_OPTIONS = [
  'Lambat memahami materi (butuh penjelasan berulang)',
  'Kesulitan membaca/menulis meski sudah diajari',
  'Sulit fokus & duduk diam, impulsif',
  'Kesulitan bersosialisasi/komunikasi',
  'Gangguan pendengaran/penglihatan',
  'Lainnya',
]

export default function KelasBaruPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [jenjang, setJenjang] = useState('SMP')
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026')
  const [siswaList, setSiswaList] = useState<Array<{ nama: string; isAbk: boolean; kategori?: string }>>([])
  const [namaSiswa, setNamaSiswa] = useState('')
  const [isAbk, setIsAbk] = useState(false)
  const [kategori, setKategori] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  if (loading || !user) return null

  function tambahSiswa() {
    if (!namaSiswa.trim()) return
    setSiswaList(prev => [...prev, { nama: namaSiswa.trim(), isAbk, kategori: isAbk ? kategori : undefined }])
    setNamaSiswa(''); setIsAbk(false); setKategori('')
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); router.push('/dashboard') }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← Dashboard</a>
            <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          </div>
        </nav>
      </header>

      <main className="pt-28 max-w-3xl mx-auto px-gutter pb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Buat Kelas Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Informasi Kelas</h3>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Nama Kelas</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Kelas 7A" required />
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
                <input type="text" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="2025/2026" />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-lg border border-outline-variant/20 hard-shadow space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Tambah Siswa</h3>
            <div className="flex gap-3">
              <input type="text" value={namaSiswa} onChange={e => setNamaSiswa(e.target.value)} className="flex-1 px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Nama siswa" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), tambahSiswa())} />
              <button type="button" onClick={tambahSiswa} className="px-6 py-3.5 rounded-full bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Tambah</button>
            </div>
            <label className="flex items-center gap-2 text-on-surface font-body-md text-body-md cursor-pointer">
              <input type="checkbox" checked={isAbk} onChange={e => setIsAbk(e.target.checked)} className="rounded border-outline-variant text-primary focus:ring-primary" />
              Siswa berkebutuhan khusus (ABK)
            </label>
            {isAbk && (
              <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low">
                <option value="">Pilih kategori ABK</option>
                {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            )}
            {siswaList.length > 0 && (
              <div>
                <p className="text-on-surface-variant font-body-md text-body-md mb-2">Daftar Siswa ({siswaList.length})</p>
                <div className="space-y-1.5">
                  {siswaList.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 bg-surface-container-low rounded-full">
                      <span className="text-on-surface font-body-md text-body-md">{s.nama}</span>
                      {s.isAbk && <span className="text-xs text-primary bg-primary-container/30 px-3 py-1 rounded-full font-label-sm">ABK</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-4 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm">Simpan Kelas</button>
        </form>
      </main>
    </div>
  )
}

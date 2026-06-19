'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sekolah, setSekolah] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter'); return }
    setError('')
    setLoading(true)
    const ok = await register(nama, email, password, sekolah)
    setLoading(false)
    if (ok) router.push('/dashboard')
    else setError('Email sudah terdaftar. Gunakan email lain.')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <a href="/" className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</a>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1">Platform Penilaian Inklusif untuk Guru</p>
        </div>

        <div className="bg-surface rounded-xl p-6 sm:p-8 border border-outline-variant/20 hard-shadow">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Buat akun baru</h2>
          <p className="text-on-surface-variant font-body-md text-body-md mb-6">Bergabung untuk mulai mengajar inklusif.</p>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-full px-5 py-3 mb-4 font-body-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Nama Lengkap</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Budi Santoso" required />
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="guru@sekolah.ac.id" required />
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Kata Sandi</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Minimal 6 karakter" required />
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Sekolah (opsional)</label>
              <input type="text" value={sekolah} onChange={e => setSekolah(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="SDN 1 Jakarta" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-on-surface-variant font-body-md text-body-md text-center mt-6">
            Sudah punya akun?{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">Masuk</a>
          </p>
        </div>
      </div>
    </div>
  )
}

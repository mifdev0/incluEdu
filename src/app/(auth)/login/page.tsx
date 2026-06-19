'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) router.push('/dashboard')
    else setError('Email atau password salah. Silakan daftar terlebih dahulu.')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <a href="/" aria-label="IncluEdu - Beranda"><BrandLogo /></a>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1">Platform Penilaian Inklusif untuk Guru</p>
        </div>

        <div className="bg-surface rounded-xl p-6 sm:p-8 border border-outline-variant/20 hard-shadow">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Selamat datang kembali</h2>
          <p className="text-on-surface-variant font-body-md text-body-md mb-6">Masuk untuk melanjutkan.</p>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-full px-5 py-3 mb-4 font-body-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low"
                placeholder="guru@sekolah.ac.id"
                required
              />
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low"
                placeholder="Masukkan kata sandi"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-on-surface-variant font-body-md text-body-md text-center mt-6">
            Belum punya akun?{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">Daftar</a>
          </p>
        </div>
      </div>
    </div>
  )
}

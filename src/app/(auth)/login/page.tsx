'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { BrandLogo } from '@/components/brand-logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) router.push('/dashboard')
    else setError(result.message || 'Login gagal.')
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetEmail.trim()) return
    setResetLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    })
    setResetLoading(false)
    if (error) setError(error.message)
    else setResetSent(true)
  }

  return (<>
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6 sm:mb-8">
          <a href="/" aria-label="IncluEdu - Beranda"><BrandLogo /></a>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1">Platform Penilaian Inklusif untuk Guru</p>
        </div>

        <div className="bg-surface rounded-3xl p-5 sm:p-8 border border-outline-variant/20 hard-shadow">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Selamat datang kembali</h2>
          <p className="text-on-surface-variant font-body-md text-body-md mb-6">Masuk dengan akun IncluEdu Anda.</p>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-full px-5 py-3 mb-4 font-body-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="guru@sekolah.ac.id" required />
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-md text-label-md mb-1.5">Kata Sandi</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-full border border-outline-variant/40 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface-container-low" placeholder="Masukkan kata sandi" required />
              <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); setError('') }} className="mt-1.5 text-xs font-bold text-primary hover:underline">Lupa password?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-full bg-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? 'Memproses...' : 'Masuk'}</button>
          </form>

          <p className="text-on-surface-variant text-sm text-center mt-6">
            Belum punya akun? <a href="/register" className="text-primary font-bold">Daftar</a>
          </p>
        </div>
      </div>
    </div>

    {showReset && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center">
        {resetSent ? (
          <div>
            <div className="mx-auto w-14 h-14 rounded-full bg-secondary-container/50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-secondary" /></div>
            <h2 className="mt-4 text-xl font-bold">Cek email Anda</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Kami telah mengirim tautan reset password ke <strong>{resetEmail}</strong>. Periksa kotak masuk (atau folder spam) dan ikuti instruksi di email.</p>
            <button type="button" onClick={() => { setShowReset(false); setResetSent(false) }} className="mt-6 w-full rounded-full bg-primary py-3 font-bold text-white">Tutup</button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><KeyRound className="w-6 h-6 text-primary" /></div>
            <h2 className="mt-4 text-xl font-bold">Reset password</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Masukkan email terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="mt-4 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3" placeholder="guru@sekolah.ac.id" required />
            <button type="submit" disabled={resetLoading || !resetEmail.trim()} className="mt-4 w-full rounded-full bg-primary py-3 font-bold text-white disabled:opacity-40">{resetLoading ? 'Mengirim...' : 'Kirim tautan reset'}</button>
            <button type="button" onClick={() => setShowReset(false)} className="mt-3 text-sm font-bold text-on-surface-variant">Batal</button>
          </form>
        )}
      </div>
    </div>}
  </>
  )
}

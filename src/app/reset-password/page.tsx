'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BrandLogo } from '@/components/brand-logo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setReady(true)
    })
    const hash = window.location.hash
    if (hash.includes('access_token') && hash.includes('refresh_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      supabase.auth.setSession({
        access_token: params.get('access_token') || '',
        refresh_token: params.get('refresh_token') || '',
      }).then(({ error }) => {
        if (!error) setReady(true)
        else setError('Tautan reset tidak valid. Minta tautan baru.')
      })
    } else {
      setError('Tautan reset tidak valid atau sudah kedaluwarsa.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter.'); return }
    if (password !== confirm) { setError('Konfirmasi kata sandi tidak cocok.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-secondary-container/50 flex items-center justify-center"><svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
        <h1 className="mt-4 text-2xl font-bold">Password berhasil diubah</h1>
        <p className="mt-2 text-on-surface-variant">Kata sandi Anda sudah diperbarui. Silakan masuk dengan password baru.</p>
        <a href="/login" className="mt-6 inline-block w-full rounded-full bg-primary py-3 font-bold text-white text-center">Masuk</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <a href="/" aria-label="IncluEdu"><BrandLogo /></a>
        {error && !ready && <div className="mt-6 rounded-2xl bg-error-container p-4 text-sm text-error">{error}</div>}
        {ready && (
          <div className="mt-6 bg-white rounded-3xl border border-outline-variant/20 p-6 text-left">
            <h1 className="text-xl font-bold text-center">Buat password baru</h1>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-bold">Password baru</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3" placeholder="Minimal 6 karakter" required minLength={6} />
              </div>
              <div>
                <label className="text-sm font-bold">Konfirmasi password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3" placeholder="Ketik ulang password" required />
              </div>
              {error && <div className="rounded-2xl bg-error-container p-3 text-sm text-error">{error}</div>}
              <button type="submit" disabled={loading} className="w-full rounded-full bg-primary py-3 font-bold text-white disabled:opacity-40">{loading ? 'Menyimpan...' : 'Simpan password baru'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

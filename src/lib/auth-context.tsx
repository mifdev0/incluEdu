'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured, supabase } from './supabase'

interface User {
  id: string
  nama: string
  email: string
  sekolah?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (nama: string, email: string, password: string, sekolah?: string) => Promise<AuthResult>
  logout: () => void
  loading: boolean
}

interface AuthResult {
  ok: boolean
  message?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (data.session?.user && mounted) {
          await loadProfile(data.session.user.id, data.session.user.email || '')
        } else if (mounted) {
          setUser(null)
        }
      } catch {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void restoreSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      window.setTimeout(async () => {
        if (!mounted) return
        await loadProfile(session.user.id, session.user.email || '')
        if (mounted) setLoading(false)
      }, 0)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function loadProfile(id: string, email: string) {
    const { data } = await supabase.from('profiles').select('nama, sekolah').eq('id', id).maybeSingle()
    if (data) {
      setUser({ id, email, nama: data.nama, sekolah: data.sekolah || undefined })
      return
    }

    const fallbackName = email.split('@')[0] || 'Guru IncluEdu'
    const { data: createdProfile } = await supabase
      .from('profiles')
      .upsert({ id, nama: fallbackName }, { onConflict: 'id' })
      .select('nama, sekolah')
      .single()
    setUser({
      id,
      email,
      nama: createdProfile?.nama || fallbackName,
      sekolah: createdProfile?.sekolah || undefined,
    })
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return { ok: false, message: 'Layanan login belum dikonfigurasi. Hubungi pengelola IncluEdu.' }
    }
    if (!email.trim() || !password) {
      return { ok: false, message: 'Email dan kata sandi wajib diisi.' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!error) return { ok: true }

    const messages: Record<string, string> = {
      invalid_credentials: 'Email belum terdaftar atau kata sandi yang dimasukkan salah.',
      email_not_confirmed: 'Email belum dikonfirmasi. Periksa kotak masuk dan buka tautan konfirmasi.',
      email_address_invalid: 'Format atau alamat email tidak dapat digunakan.',
      user_banned: 'Akun ini sedang dinonaktifkan. Hubungi pengelola IncluEdu.',
      over_request_rate_limit: 'Terlalu banyak percobaan masuk. Tunggu beberapa menit lalu coba lagi.',
      request_timeout: 'Proses login terlalu lama. Periksa koneksi internet lalu coba lagi.',
    }
    return {
      ok: false,
      message: messages[error.code || ''] || 'Login gagal karena layanan autentikasi bermasalah. Coba kembali.',
    }
  }

  async function register(nama: string, email: string, password: string, sekolah?: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return { ok: false, message: 'Layanan pendaftaran belum dikonfigurasi. Hubungi pengelola IncluEdu.' }
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nama: nama.trim(), sekolah: sekolah?.trim() || null } },
    })
    if (!error) {
      return {
        ok: true,
        message: data.session
          ? 'Akun berhasil dibuat.'
          : 'Akun berhasil dibuat. Periksa email untuk mengonfirmasi akun sebelum masuk.',
      }
    }

    const messages: Record<string, string> = {
      email_exists: 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.',
      user_already_exists: 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.',
      weak_password: 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi yang lebih kuat.',
      email_address_invalid: 'Format atau alamat email tidak dapat digunakan.',
      email_address_not_authorized: 'Supabase belum diizinkan mengirim email ke alamat ini. Konfigurasikan SMTP production.',
      over_email_send_rate_limit: 'Terlalu banyak email konfirmasi dikirim. Tunggu beberapa menit lalu coba lagi.',
      signup_disabled: 'Pendaftaran akun sedang dinonaktifkan.',
    }
    return {
      ok: false,
      message: messages[error.code || ''] || 'Pendaftaran gagal. Periksa data lalu coba kembali.',
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

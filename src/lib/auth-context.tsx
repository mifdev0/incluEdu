'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

interface User {
  id: string
  nama: string
  email: string
  sekolah?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (nama: string, email: string, password: string, sekolah?: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) await loadProfile(data.session.user.id, data.session.user.email || '')
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await loadProfile(session.user.id, session.user.email || '')
      else setUser(null)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(id: string, email: string) {
    const { data } = await supabase.from('profiles').select('nama, sekolah').eq('id', id).maybeSingle()
    setUser({ id, email, nama: data?.nama || email.split('@')[0], sekolah: data?.sekolah || undefined })
  }

  async function login(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return !error
  }

  async function register(nama: string, email: string, password: string, sekolah?: string): Promise<boolean> {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nama: nama.trim(), sekolah: sekolah?.trim() || null } },
    })
    return !error
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

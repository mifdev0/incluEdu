'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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
    const stored = localStorage.getItem('incluedu_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  async function login(identity: string, password: string): Promise<boolean> {
    if (!identity.trim() || !password.trim()) return false

    const savedUsers = JSON.parse(localStorage.getItem('incluedu_users') || '[]') as User[]
    const registeredUser = savedUsers.find((item) => item.email.toLowerCase() === identity.trim().toLowerCase())
    const displayName = identity.includes('@')
      ? identity.split('@')[0].replace(/[._-]+/g, ' ')
      : identity.trim()
    const demoUser: User = registeredUser ?? {
      id: crypto.randomUUID(),
      nama: displayName || 'Guru IncluEdu',
      email: identity.includes('@') ? identity.trim() : `${identity.trim().replace(/\s+/g, '.').toLowerCase()}@demo.incluedu`,
    }

    setUser(demoUser)
    localStorage.setItem('incluedu_user', JSON.stringify(demoUser))
    return true
  }

  async function register(nama: string, email: string, _password: string, sekolah?: string): Promise<boolean> {
    const users = JSON.parse(localStorage.getItem('incluedu_users') || '[]')
    if (users.some((u: User) => u.email === email)) return false
    const newUser: User = { id: crypto.randomUUID(), nama, email, sekolah }
    users.push(newUser)
    localStorage.setItem('incluedu_users', JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem('incluedu_user', JSON.stringify(newUser))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('incluedu_user')
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

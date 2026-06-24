'use client'

import { useAuth } from '@/lib/auth-context'

export function NavAuth() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center gap-3"><div className="h-9 w-20 rounded-full bg-surface-container-high animate-pulse" /></div>

  if (user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-3">
        <a href="/dashboard" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
          <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{user.nama.charAt(0)}</span>
          {user.nama}
        </a>
        <a href="/dashboard" className="sm:hidden px-3 py-2 rounded-full bg-primary text-white text-sm font-bold">Dashboard</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <a href="/login" className="px-3 sm:px-5 py-2.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Masuk</a>
      <a href="/register" className="bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-4 sm:px-gutter py-2.5 rounded-full font-label-md text-label-md shadow-sm inline-block whitespace-nowrap">
        <span className="sm:hidden">Daftar</span>
        <span className="hidden sm:inline">Daftar</span>
      </a>
    </div>
  )
}

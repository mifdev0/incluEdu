'use client'

import { useAuth } from '@/lib/auth-context'
import { ArrowRight } from 'lucide-react'

export function CtaButton() {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-14 w-48 rounded-full bg-surface-container-high animate-pulse" />
  return (
    <a
      href={user ? '/dashboard' : '/register'}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 sm:py-4 font-bold text-white hover:scale-105 active:scale-95 transition-all"
    >
      {user ? 'Buka Dashboard' : 'Mulai Gunakan IncluEdu'} <ArrowRight className="w-5 h-5" />
    </a>
  )
}

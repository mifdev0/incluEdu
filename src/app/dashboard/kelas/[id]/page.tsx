'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { ConfirmModal } from '@/components/confirm-modal'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'

type Student = { id: string; nama: string; kategori: string; tracking: number; achievement: number }

export default function DetailKelasPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [kelas, setKelas] = useState<{ id: string; nama: string; jenjang: string; tingkat: number | null; tahun_ajaran: string } | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'class'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    async function load() {
      const [classResult, studentsResult] = await Promise.all([
        supabase.from('kelas').select('id, nama, jenjang, tingkat, tahun_ajaran').eq('id', params.id).single(),
        supabase.from('siswa').select('id, nama, kategori').eq('kelas_id', params.id).order('created_at'),
      ])
      setKelas(classResult.data)
      const rows = await Promise.all((studentsResult.data || []).map(async (student) => {
        const [{ data: tracking }, { data: ppi }] = await Promise.all([
          supabase.from('daily_tracking').select('tanggal').eq('siswa_id', student.id),
          supabase.from('ppi').select('id').eq('siswa_id', student.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ])
        let achievement = 0
        if (ppi) {
          const { data: goals } = await supabase.from('tujuan_ppi').select('capaian').eq('ppi_id', ppi.id)
          achievement = goals?.length ? Math.round(goals.reduce((sum, goal) => sum + goal.capaian, 0) / goals.length) : 0
        }
        return { ...student, tracking: new Set((tracking || []).map((item) => item.tanggal)).size, achievement }
      }))
      setStudents(rows)
      setLoading(false)
    }
    void load()
  }, [user, authLoading, router, params.id])

  async function remove() {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    if (deleteTarget.type === 'student') {
      const { error: removeError } = await supabase.from('siswa').delete().eq('id', deleteTarget.id)
      if (removeError) setError(removeError.message)
      else setStudents((current) => current.filter((student) => student.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleting(false)
      return
    }
    const { error: studentsError } = await supabase.from('siswa').delete().eq('kelas_id', deleteTarget.id)
    const { error: classError } = studentsError ? { error: studentsError } : await supabase.from('kelas').delete().eq('id', deleteTarget.id)
    if (classError) setError(classError.message)
    else router.push('/dashboard')
    setDeleting(false)
  }

  if (authLoading || !user || loading) return <FullPageLoading label="Memuat kelas..." />

  return <div className="min-h-screen bg-[#FAFAF5]">
    <header className="app-header"><nav className="app-nav"><a href="/dashboard" className="text-on-surface-variant">← Dashboard</a><BrandLogo compact mobileIconOnly /><button onClick={logout} className="text-sm text-on-surface-variant">Keluar</button></nav></header>
    <main className="mx-auto max-w-container-max px-4 pb-20 pt-24 sm:pt-28">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold">{kelas?.nama}</h1><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{kelas?.jenjang}</span></div><p className="mt-2 text-on-surface-variant">{students.length} siswa didampingi · {kelas?.tahun_ajaran}</p></div><div className="flex gap-2"><a href="/dashboard/siswa/baru" className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-white"><Plus className="mr-1 inline h-4 w-4" />Tambah siswa</a><button onClick={() => kelas && setDeleteTarget({ type: 'class', id: kelas.id, name: kelas.nama })} className="rounded-full bg-error-container px-4 py-3 text-sm font-bold text-error"><Trash2 className="mr-1 inline h-4 w-4" />Hapus</button></div></div>
      {error && <div className="mt-4 rounded-2xl bg-error-container p-4 text-error">{error}</div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">{students.map((student) => <article key={student.id} className="rounded-3xl border bg-white p-5">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{student.nama}</h2><span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{student.kategori.replaceAll('_', ' ')}</span></div><button onClick={() => setDeleteTarget({ type: 'student', id: student.id, name: student.nama })} className="rounded-full p-2 text-error hover:bg-error-container"><Trash2 className="h-4 w-4" /></button></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-surface-container-low p-3"><div className="text-2xl font-bold">{student.achievement}%</div><div className="text-xs text-on-surface-variant">Ketercapaian target</div></div><div className="rounded-2xl bg-surface-container-low p-3"><div className="text-2xl font-bold">{student.tracking}</div><div className="text-xs text-on-surface-variant">Hari tracking</div></div></div>
        <div className="mt-4 grid grid-cols-3 gap-2"><a href={`/dashboard/siswa/${student.id}`} className="rounded-full bg-surface-container-high px-3 py-2 text-center text-sm font-bold">Profil</a><a href={`/dashboard/siswa/${student.id}/observasi`} className="rounded-full bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">Tracking</a><a href={`/dashboard/siswa/${student.id}/rapor`} className="rounded-full bg-primary px-3 py-2 text-center text-sm font-bold text-white">Evaluasi</a></div>
      </article>)}</div>
    </main>
    <ConfirmModal open={Boolean(deleteTarget)} title={`Hapus ${deleteTarget?.name}?`} description="Seluruh data PPI, asesmen, tracking, dan evaluasi terkait akan dihapus permanen." confirmLabel="Hapus" loading={deleting} onConfirm={remove} onClose={() => !deleting && setDeleteTarget(null)} />
    {deleting && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-3 shadow-lg"><LoadingSpinner label="Menghapus..." /></div>}
  </div>
}

'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { ProgressSparkline } from '@/components/progress-chart'
import { supabase } from '@/lib/supabase'
import { ConfirmModal } from '@/components/confirm-modal'
import { FullPageLoading, LoadingSpinner } from '@/components/loading-state'
import { Plus, Trash2 } from 'lucide-react'
import { observationsToProgress, progressTrend, type ObservationRow } from '@/lib/observation-progress'

type ClassData = {
  id: string
  nama: string
  jenjang: string
  tahun_ajaran: string
}

type StudentData = {
  id: string
  nama: string
  kategori: string
  created_at: string
  observasi: ObservationRow[] | null
}

export default function DetailKelasPage({ params }: { params: { id: string } }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [kelas, setKelas] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<StudentData[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'class'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!user) return

    Promise.all([
      supabase.from('kelas').select('id, nama, jenjang, tahun_ajaran').eq('id', params.id).single(),
      supabase.from('siswa').select('id, nama, kategori, created_at, observasi(minggu_ke, tanggal, jawaban)').eq('kelas_id', params.id).order('created_at'),
    ]).then(([classResult, studentResult]) => {
      if (classResult.error) setError(classResult.error.message)
      else setKelas(classResult.data)
      if (studentResult.error) setError(studentResult.error.message)
      else setStudents((studentResult.data || []) as StudentData[])
      setDataLoading(false)
    })
  }, [user, loading, router, params.id])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')

    if (deleteTarget.type === 'student') {
      const { error: deleteError } = await supabase.from('siswa').delete().eq('id', deleteTarget.id)
      if (deleteError) {
        setError(deleteError.message)
      } else {
        setStudents((current) => current.filter((student) => student.id !== deleteTarget.id))
        setDeleteTarget(null)
      }
      setDeleting(false)
      return
    }

    const { error: studentsError } = await supabase.from('siswa').delete().eq('kelas_id', deleteTarget.id)
    if (studentsError) {
      setError(studentsError.message)
      setDeleting(false)
      return
    }
    const { error: classError } = await supabase.from('kelas').delete().eq('id', deleteTarget.id)
    if (classError) {
      setError(classError.message)
      setDeleting(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  if (loading || !user || dataLoading) return <FullPageLoading label="Memuat data kelas..." />

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <a href="/dashboard" className="shrink-0 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">← <span className="hidden min-[390px]:inline">Dashboard</span></a>
            <a href="/dashboard" aria-label="IncluEdu - Dashboard"><BrandLogo compact mobileIconOnly /></a>
          </div>
          <button onClick={logout} className="shrink-0 px-3 py-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors font-label-md text-label-md">Keluar</button>
        </nav>
      </header>

      <main className="pt-24 sm:pt-28 max-w-container-max mx-auto px-4 sm:px-gutter pb-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-lg">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <h1 className="font-headline-md text-headline-md text-on-surface">{kelas?.nama || 'Kelas'}</h1>
              <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-label-sm">{kelas?.jenjang}</span>
              <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full font-label-sm">{kelas?.tahun_ajaran}</span>
            </div>
            <p className="text-on-surface-variant">{students.length} siswa dalam pendampingan</p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <a href="/dashboard/siswa/baru" className="px-4 py-3 rounded-full bg-primary text-white text-center text-sm font-bold inline-flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Tambah siswa
            </a>
            <button onClick={() => kelas && setDeleteTarget({ type: 'class', id: kelas.id, name: kelas.nama })} className="px-4 py-3 rounded-full bg-error-container text-error text-sm font-bold inline-flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Hapus kelas
            </button>
          </div>
        </div>

        {error && <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container mb-md">{error}</div>}

        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Siswa dalam pendampingan</h2>
        <div className="space-y-3 mb-xl">
          {students.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-outline-variant/40 p-8 text-center">
              <h3 className="font-bold text-lg">Belum ada siswa</h3>
              <p className="text-sm text-on-surface-variant mt-1">Tambahkan siswa berkebutuhan khusus ke kelas ini.</p>
            </div>
          )}
          {students.map((student, index) => {
            const colors = ['bg-pastel-purple', 'bg-pastel-green', 'bg-pastel-yellow']
            const observations = student.observasi || []
            const progress = observationsToProgress(observations, student.kategori)
            const trend = progressTrend(progress)
            return (
              <article key={student.id} className={`${colors[index % colors.length]} rounded-3xl p-5 sm:p-md border border-primary/10 hard-shadow`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/60 text-primary flex items-center justify-center font-display text-headline-sm shrink-0">{student.nama.charAt(0)}</div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{student.nama}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-primary bg-white/60 px-3 py-1 rounded-full font-label-sm">{student.kategori.replaceAll('_', ' ')}</span>
                        <span className="text-xs text-on-surface-variant">{observations.length} observasi</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full sm:w-auto flex-col items-stretch sm:items-end gap-3">
                    {progress.length >= 2 ? (
                      <div className="self-end bg-white/50 rounded-2xl px-3 py-1">
                        <ProgressSparkline data={progress} trend={trend} />
                      </div>
                    ) : (
                      <span className="self-end text-xs text-on-surface-variant">Grafik tersedia setelah 2 observasi</span>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      <a href={`/dashboard/siswa/${student.id}`} className="px-2 sm:px-4 py-2 text-center rounded-full bg-white/60 text-on-surface text-xs sm:text-sm font-bold">Profil</a>
                      <a href={`/dashboard/siswa/${student.id}/observasi`} className="px-2 sm:px-4 py-2 text-center rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-bold">Observasi</a>
                      <a href={`/dashboard/siswa/${student.id}/rapor`} className="px-2 sm:px-4 py-2 text-center rounded-full bg-primary text-white text-xs sm:text-sm font-bold">Rapor</a>
                      <button onClick={() => setDeleteTarget({ type: 'student', id: student.id, name: student.nama })} className="px-2 sm:px-4 py-2 rounded-full bg-error-container text-error text-xs sm:text-sm font-bold" aria-label={`Hapus ${student.nama}`}>
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'class' ? `Hapus ${deleteTarget.name}?` : `Hapus ${deleteTarget?.name}?`}
        description={deleteTarget?.type === 'class'
          ? 'Semua siswa, asesmen awal, PPI, tujuan, observasi, dan laporan AI di dalam kelas ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.'
          : 'Profil siswa beserta asesmen awal, PPI, tujuan, observasi, dan laporan AI akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.'}
        confirmLabel={deleteTarget?.type === 'class' ? 'Hapus kelas' : 'Hapus siswa'}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
      {deleting && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] rounded-full bg-white px-4 py-3 shadow-lg"><LoadingSpinner label="Menghapus data..." /></div>}
    </div>
  )
}

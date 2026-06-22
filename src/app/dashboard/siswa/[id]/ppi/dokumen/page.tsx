'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileDown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BrandLogo } from '@/components/brand-logo'
import { FullPageLoading } from '@/components/loading-state'
import { supabase } from '@/lib/supabase'

type Student = {
  nama: string
  kategori: string
  status_diagnosis: string
  deskripsi_kebutuhan: string | null
  kelas: { nama: string; jenjang: string; tahun_ajaran: string } | null
}

type PpiDocument = {
  id: string
  periode_mulai: string
  periode_selesai: string
  tujuan_jangka_panjang: string | null
  strategi: string[]
  status: 'draft' | 'aktif' | 'selesai'
  nama_penyetuju: string | null
  hubungan_penyetuju: string | null
  tanggal_persetujuan: string | null
  catatan_persetujuan: string | null
}

type Goal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  aktivitas: string | null
  media_alat: string | null
  pelaksana: string | null
  frekuensi: string | null
  metode_evaluasi: string | null
  jenis_target: 'akademik' | 'non_akademik'
  fase_adaptasi: string | null
  kriteria_tuntas: string | null
}

const roleLabels: Record<string, string> = {
  guru_kelas: 'Guru kelas',
  orang_tua: 'Orang tua / wali',
  kepala_sekolah: 'Kepala sekolah',
  guru_bk: 'Guru BK',
  gpk: 'Guru Pembimbing Khusus',
  psikolog: 'Psikolog',
  terapis: 'Terapis',
  lainnya: 'Pendamping lain',
}

export default function PpiDocumentPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [ppi, setPpi] = useState<PpiDocument | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<{ kekuatan: string[]; kebutuhan: string[]; ringkasan: string | null } | null>(null)
  const [team, setTeam] = useState<Array<{ nama: string; peran: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!user) return
    async function load() {
      const [studentResult, ppiResult, summaryResult, teamResult] = await Promise.all([
        supabase.from('siswa').select('nama, kategori, status_diagnosis, deskripsi_kebutuhan, kelas(nama, jenjang, tahun_ajaran)').eq('id', params.id).single(),
        supabase.from('ppi').select('id, periode_mulai, periode_selesai, tujuan_jangka_panjang, strategi, status, nama_penyetuju, hubungan_penyetuju, tanggal_persetujuan, catatan_persetujuan').eq('siswa_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('assessment_summaries').select('kekuatan, kebutuhan, ringkasan').eq('siswa_id', params.id).maybeSingle(),
        supabase.from('ppi_teams').select('nama, peran').eq('siswa_id', params.id).order('wajib', { ascending: false }),
      ])
      setStudent(studentResult.data as unknown as Student)
      setPpi(ppiResult.data as PpiDocument | null)
      setSummary(summaryResult.data as typeof summary)
      setTeam(teamResult.data || [])
      if (ppiResult.data) {
        const { data } = await supabase.from('tujuan_ppi')
          .select('id, area, tujuan, indikator, target, aktivitas, media_alat, pelaksana, frekuensi, metode_evaluasi, jenis_target, fase_adaptasi, kriteria_tuntas')
          .eq('ppi_id', ppiResult.data.id)
          .order('created_at')
        setGoals((data || []) as Goal[])
      }
      setLoading(false)
    }
    void load()
  }, [user, authLoading, router, params.id])

  if (authLoading || !user || loading) return <FullPageLoading label="Menyiapkan dokumen PPI..." />
  if (!student || !ppi) return <div className="grid min-h-screen place-items-center p-4"><p>Dokumen PPI belum tersedia.</p></div>

  return <div className="min-h-screen bg-[#F3F3EE] print:bg-white">
    <header className="app-header print:hidden"><nav className="app-nav"><a href={`/dashboard/siswa/${params.id}/ppi`} className="text-on-surface-variant">← Target PPI</a><BrandLogo compact mobileIconOnly /><button onClick={() => window.print()} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"><FileDown className="mr-2 inline h-4 w-4" />Cetak / PDF</button></nav></header>

    <main className="mx-auto max-w-[860px] px-3 pb-16 pt-24 sm:px-4 sm:pt-28 print:max-w-none print:p-0">
      <article className="ppi-document overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-sm sm:p-10 print:overflow-visible print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="border-b-[3px] border-on-surface pb-5 text-center">
          <div className="text-sm font-bold tracking-wide">DOKUMEN PROGRAM PEMBELAJARAN INDIVIDUAL (PPI)</div>
          <h1 className="mt-2 text-2xl font-bold">Kontrak Layanan Pendidikan Individual</h1>
          <p className="mt-1 text-sm text-on-surface-variant">IncluEdu · Tahun Ajaran {student.kelas?.tahun_ajaran || '—'}</p>
        </div>

        <section className="document-section mt-6">
          <h2 className="document-heading">A. Identitas Peserta Didik</h2>
          <dl className="document-details text-sm">
            <dt>Nama</dt><dd className="font-semibold">{student.nama}</dd>
            <dt>Kelas</dt><dd>{student.kelas?.nama || '—'} · {student.kelas?.jenjang || '—'}</dd>
            <dt>Kebutuhan</dt><dd className="capitalize">{student.kategori.replaceAll('_', ' ')}</dd>
            <dt>Status informasi</dt><dd className="capitalize">{student.status_diagnosis.replaceAll('_', ' ')}</dd>
            <dt>Periode PPI</dt><dd>{ppi.periode_mulai} sampai {ppi.periode_selesai}</dd>
          </dl>
        </section>

        <section className="document-section mt-6">
          <h2 className="document-heading">B. Ringkasan Hasil Asesmen</h2>
          <div className="document-body">
            <p className="text-sm leading-relaxed">{summary?.ringkasan || student.deskripsi_kebutuhan || 'Ringkasan asesmen belum tersedia.'}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div><h3 className="text-xs font-bold">KEKUATAN</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{(summary?.kekuatan || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3 className="text-xs font-bold">KEBUTUHAN DUKUNGAN</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{(summary?.kebutuhan || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </div>
        </section>

        <section className="document-section mt-6">
          <h2 className="document-heading">C. Tujuan Jangka Panjang</h2>
          <p className="document-body text-sm leading-relaxed">{ppi.tujuan_jangka_panjang || 'Belum ditentukan.'}</p>
        </section>

        <section className="document-section mt-6">
          <h2 className="document-heading">D. Tujuan Jangka Pendek dan Layanan</h2>
          <div className="document-body space-y-5">
            {goals.map((goal, index) => <div key={goal.id} className="goal-document break-inside-avoid border border-on-surface/20">
              <div className="border-b border-on-surface/30 bg-surface-container-low px-4 py-3 text-xs font-bold print:bg-[#eeeeee]">{index + 1}. {goal.area.toUpperCase()} · {goal.jenis_target === 'akademik' ? `AKADEMIK${goal.fase_adaptasi ? ` · CP FASE ${goal.fase_adaptasi}` : ''}` : 'NON-AKADEMIK'}</div>
              <p className="border-b border-on-surface/20 px-4 py-3 font-semibold">{goal.tujuan}</p>
              <dl className="goal-details text-sm">
                <dt>Indikator</dt><dd>{goal.indikator}</dd>
                <dt>Kriteria ketuntasan</dt><dd>{goal.kriteria_tuntas || `Minimal ${goal.target}%`}</dd>
                <dt>Aktivitas</dt><dd>{goal.aktivitas || 'Belum ditentukan.'}</dd>
                <dt>Media / alat</dt><dd>{goal.media_alat || 'Belum ditentukan.'}</dd>
                <dt>Pelaksana dan waktu</dt><dd>{goal.pelaksana || 'Guru kelas'}{goal.frekuensi ? ` · ${goal.frekuensi}` : ''}</dd>
                <dt>Evaluasi</dt><dd>{goal.metode_evaluasi || 'Observasi kinerja'}</dd>
              </dl>
            </div>)}
          </div>
        </section>

        <section className="document-section mt-6">
          <h2 className="document-heading">E. Strategi dan Akomodasi Pembelajaran</h2>
          <div className="document-body"><ul className="list-disc space-y-1 pl-5 text-sm">{(ppi.strategi || []).length > 0 ? ppi.strategi.map((item) => <li key={item}>{item}</li>) : <li>Strategi khusus belum dicatat.</li>}</ul></div>
        </section>

        <section className="document-section mt-6">
          <h2 className="document-heading">F. Tim PPI</h2>
          <div className="document-body">
            <table className="w-full border-collapse text-left text-sm">
              <thead><tr><th className="border border-on-surface/40 bg-surface-container-low p-2.5 print:bg-[#eeeeee]">Peran</th><th className="border border-on-surface/40 bg-surface-container-low p-2.5 print:bg-[#eeeeee]">Nama</th></tr></thead>
              <tbody>{team.map((member) => <tr key={`${member.peran}-${member.nama}`}><td className="border border-on-surface/40 p-2.5">{roleLabels[member.peran] || member.peran}</td><td className="border border-on-surface/40 p-2.5">{member.nama}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="document-section mt-6 break-inside-avoid">
          <h2 className="document-heading">G. Persetujuan</h2>
          <div className="document-body">
            <p className="text-sm leading-relaxed">Dokumen ini menjadi kesepakatan layanan antara sekolah dan orang tua/wali. Tim PPI akan meninjau pelaksanaannya berdasarkan perkembangan peserta didik.</p>
            {ppi.catatan_persetujuan && <p className="mt-3 text-sm"><strong>Catatan:</strong> {ppi.catatan_persetujuan}</p>}
            <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm sm:grid-cols-3">
              <div><p className="font-semibold">Guru kelas</p><div className="h-20" /><p className="border-t pt-2">{team.find((item) => item.peran === 'guru_kelas')?.nama || user.nama}</p></div>
              <div><p className="font-semibold">Orang tua / wali</p><div className="h-20" /><p className="border-t pt-2">{ppi.nama_penyetuju || team.find((item) => item.peran === 'orang_tua')?.nama || '................................'}</p></div>
              <div className="col-span-2 sm:col-span-1"><p className="font-semibold">Kepala sekolah</p><div className="h-20" /><p className="border-t pt-2">{team.find((item) => item.peran === 'kepala_sekolah')?.nama || '................................'}</p></div>
            </div>
            <p className="mt-8 text-center text-xs text-on-surface-variant">{ppi.status === 'aktif' ? `Disetujui pada ${ppi.tanggal_persetujuan} oleh ${ppi.nama_penyetuju}.` : 'Status: Draf — menunggu persetujuan orang tua / wali.'}</p>
          </div>
        </section>
      </article>
    </main>
  </div>
}

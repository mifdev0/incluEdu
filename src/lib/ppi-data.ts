export type PpiGoal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  capaian: number
  status: 'belum_dimulai' | 'berkembang' | 'hampir_tercapai' | 'tercapai' | 'perlu_revisi'
  aktivitas?: string | null
  media_alat?: string | null
  pelaksana?: string | null
  frekuensi?: string | null
  metode_evaluasi?: string | null
  langkah_tugas?: string[]
  jenis_target?: 'akademik' | 'non_akademik'
  cp_id?: string | null
  fase_adaptasi?: string | null
  kriteria_tuntas?: string | null
  skor_benar_target?: number | null
  skor_total_target?: number | null
}

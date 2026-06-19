export type PpiGoal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  capaian: number
  status: 'belum_dimulai' | 'berkembang' | 'hampir_tercapai' | 'tercapai' | 'perlu_revisi'
}

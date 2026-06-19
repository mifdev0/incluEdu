export type PpiGoal = {
  id: string
  area: string
  tujuan: string
  indikator: string
  target: number
  capaian: number
  status: 'berkembang' | 'hampir_tercapai' | 'tercapai' | 'perlu_revisi'
}

export const PPI_GOALS: Record<string, PpiGoal[]> = {
  '1': [
    {
      id: 'g1',
      area: 'Fungsi belajar',
      tujuan: 'Mengikuti instruksi dua langkah secara lebih mandiri.',
      indikator: 'Berhasil pada 4 dari 5 kesempatan dengan maksimal satu pengulangan.',
      target: 80,
      capaian: 72,
      status: 'hampir_tercapai',
    },
    {
      id: 'g2',
      area: 'Komunikasi',
      tujuan: 'Menyampaikan kebutuhan belajar menggunakan kalimat sederhana.',
      indikator: 'Menyampaikan kebutuhan tanpa ditanya pada 3 kesempatan.',
      target: 75,
      capaian: 62,
      status: 'berkembang',
    },
  ],
  '2': [
    {
      id: 'g1',
      area: 'Literasi',
      tujuan: 'Membaca kalimat pendek dengan bantuan visual yang semakin berkurang.',
      indikator: 'Membaca benar minimal 8 dari 10 kata.',
      target: 80,
      capaian: 65,
      status: 'berkembang',
    },
  ],
  '3': [
    {
      id: 'g1',
      area: 'Fokus dan regulasi diri',
      tujuan: 'Bertahan pada satu aktivitas terstruktur selama 15 menit.',
      indikator: 'Menyelesaikan aktivitas dengan maksimal dua pengingat.',
      target: 75,
      capaian: 55,
      status: 'perlu_revisi',
    },
  ],
}

export function getPpiGoals(studentId: string) {
  return PPI_GOALS[studentId] ?? PPI_GOALS['1']
}

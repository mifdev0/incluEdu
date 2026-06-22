export type KategoriABK =
  | 'slow_learner'
  | 'disleksia'
  | 'adhd'
  | 'autisme'
  | 'sensorik'
  | 'lainnya'

export type Trend = 'membaik' | 'stagnan' | 'menurun'

export interface Guru {
  id: string
  user_id: string
  nama: string
  sekolah?: string
  created_at: string
}

export interface Kelas {
  id: string
  guru_id: string
  nama: string
  jenjang: 'SD' | 'SMP' | 'SMA'
  tingkat?: number | null
  tahun_ajaran: string
  created_at: string
}

export interface Siswa {
  id: string
  kelas_id: string
  nama: string
  is_abk: boolean
  kategori_abk?: KategoriABK
  deskripsi_abk?: string
  panduan_confirmed: boolean
  created_at: string
}

export interface Observasi {
  id: string
  siswa_id: string
  minggu_ke: number
  tanggal: string
  kondisi_emosi: string
  interaksi_sosial: string
  motivasi_belajar: string
  pemahaman_instruksi?: string
  penyelesaian_tugas?: string
  retensi_materi?: string
  respons_pengulangan?: string
  membaca_teks?: string
  menulis?: string
  pemahaman_lisan?: string
  kompensasi?: string
  durasi_fokus?: string
  impulsivitas?: string
  selesai_tugas_adhd?: string
  respons_struktur?: string
  kontak_mata?: string
  komunikasi_verbal?: string
  rutinitas?: string
  partisipasi_kelas?: string
  penggunaan_alat_bantu?: string
  catatan?: string
  created_at: string
}

export interface Analisis {
  id: string
  siswa_id: string
  periode: string
  trend: Trend
  nilai_kognitif: number
  nilai_sosial: number
  nilai_emosional: number
  nilai_rata_rata: number
  highlights: string[]
  concerns: string[]
  rekomendasi_guru: string[]
  rapor_narasi: string
  rekomendasi_ortu: string[]
  generated_at: string
}

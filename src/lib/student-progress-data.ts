export type ProgressPoint = {
  label: string
  kognitif: number
  fokus: number
  sosial: number
  emosi: number
}

export type StudentProgress = {
  id: string
  nama: string
  kategori: string
  deskripsi: string
  trend: 'membaik' | 'stagnan' | 'menurun'
  terakhir: string
  progress: ProgressPoint[]
}

export const STUDENT_PROGRESS: Record<string, StudentProgress> = {
  '1': {
    id: '1',
    nama: 'Budi Santoso',
    kategori: 'Slow Learner',
    deskripsi: 'Membutuhkan penjelasan bertahap dan waktu tambahan untuk memahami materi.',
    trend: 'membaik',
    terakhir: '3 hari lalu',
    progress: [
      { label: 'Minggu 1', kognitif: 55, fokus: 58, sosial: 50, emosi: 68 },
      { label: 'Minggu 2', kognitif: 61, fokus: 62, sosial: 57, emosi: 72 },
      { label: 'Minggu 3', kognitif: 68, fokus: 65, sosial: 64, emosi: 78 },
      { label: 'Minggu 4', kognitif: 78, fokus: 72, sosial: 72, emosi: 85 },
    ],
  },
  '2': {
    id: '2',
    nama: 'Siti Nurhaliza',
    kategori: 'Disleksia',
    deskripsi: 'Lebih mudah memahami materi melalui penjelasan lisan dan dukungan visual.',
    trend: 'stagnan',
    terakhir: '1 minggu lalu',
    progress: [
      { label: 'Minggu 1', kognitif: 63, fokus: 70, sosial: 67, emosi: 72 },
      { label: 'Minggu 2', kognitif: 65, fokus: 68, sosial: 70, emosi: 70 },
      { label: 'Minggu 3', kognitif: 64, fokus: 71, sosial: 69, emosi: 73 },
      { label: 'Minggu 4', kognitif: 66, fokus: 70, sosial: 71, emosi: 72 },
    ],
  },
  '3': {
    id: '3',
    nama: 'Ahmad Rizki',
    kategori: 'ADHD',
    deskripsi: 'Memerlukan struktur kegiatan yang jelas, jeda singkat, dan instruksi ringkas.',
    trend: 'menurun',
    terakhir: '5 hari lalu',
    progress: [
      { label: 'Minggu 1', kognitif: 75, fokus: 68, sosial: 72, emosi: 70 },
      { label: 'Minggu 2', kognitif: 73, fokus: 64, sosial: 70, emosi: 68 },
      { label: 'Minggu 3', kognitif: 70, fokus: 59, sosial: 67, emosi: 63 },
      { label: 'Minggu 4', kognitif: 68, fokus: 55, sosial: 65, emosi: 60 },
    ],
  },
}

export function getStudentProgress(id: string) {
  return STUDENT_PROGRESS[id] ?? STUDENT_PROGRESS['1']
}

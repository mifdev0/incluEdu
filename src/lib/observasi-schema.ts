export type KategoriABK =
  | 'slow_learner'
  | 'disleksia'
  | 'adhd'
  | 'autisme'
  | 'sensorik'
  | 'lainnya'

export const KATEGORISASI_MAP: Record<string, KategoriABK> = {
  'Lambat memahami materi (butuh penjelasan berulang)': 'slow_learner',
  'Kesulitan membaca/menulis meski sudah diajari': 'disleksia',
  'Sulit fokus & duduk diam, impulsif': 'adhd',
  'Kesulitan bersosialisasi/komunikasi': 'autisme',
  'Gangguan pendengaran/penglihatan': 'sensorik',
  'Lainnya': 'lainnya',
}

export interface DimensiItem {
  key: string
  label: string
  pertanyaan: string
  opsi: Array<{ value: string; label: string; bobot: number }>
}

export const DIMENSI_UNIVERSAL: DimensiItem[] = [
  {
    key: 'kondisi_emosi',
    label: 'Kondisi Emosi',
    pertanyaan: 'Bagaimana kondisi emosi siswa selama pembelajaran?',
    opsi: [
      { value: 'stabil', label: 'Stabil', bobot: 90 },
      { value: 'fluktuatif', label: 'Fluktuatif', bobot: 65 },
      { value: 'tantrum', label: 'Tantrum / Sulit dikendalikan', bobot: 40 },
    ]
  },
  {
    key: 'interaksi_sosial',
    label: 'Interaksi Sosial',
    pertanyaan: 'Bagaimana interaksi siswa dengan teman sekelas?',
    opsi: [
      { value: 'aktif', label: 'Aktif bergaul', bobot: 90 },
      { value: 'pasif', label: 'Pasif tapi tidak menghindari', bobot: 65 },
      { value: 'menghindari', label: 'Cenderung menghindari teman', bobot: 40 },
    ]
  },
  {
    key: 'motivasi_belajar',
    label: 'Motivasi Belajar',
    pertanyaan: 'Seberapa besar minat siswa terhadap kegiatan belajar?',
    opsi: [
      { value: 'tinggi', label: 'Tinggi — antusias mengikuti pelajaran', bobot: 90 },
      { value: 'sedang', label: 'Sedang — ikut jika dimotivasi', bobot: 65 },
      { value: 'rendah', label: 'Rendah — sering tidak tertarik', bobot: 40 },
    ]
  },
]

export const DIMENSI_KHUSUS: Record<KategoriABK, DimensiItem[]> = {
  slow_learner: [
    {
      key: 'pemahaman_instruksi',
      label: 'Pemahaman Instruksi',
      pertanyaan: 'Apakah siswa bisa mengikuti instruksi/perintah guru?',
      opsi: [
        { value: 'mandiri', label: 'Mandiri tanpa bantuan', bobot: 90 },
        { value: 'bantuan', label: 'Bisa dengan bantuan', bobot: 65 },
        { value: 'belum_bisa', label: 'Belum bisa meski dibantu', bobot: 40 },
      ]
    },
    {
      key: 'penyelesaian_tugas',
      label: 'Penyelesaian Tugas',
      pertanyaan: 'Apakah siswa menyelesaikan tugas dalam waktu yang diberikan?',
      opsi: [
        { value: 'selesai', label: 'Selesai tepat waktu', bobot: 90 },
        { value: 'perpanjangan', label: 'Selesai dengan waktu tambahan', bobot: 65 },
        { value: 'tidak_selesai', label: 'Tidak selesai', bobot: 40 },
      ]
    },
    {
      key: 'retensi_materi',
      label: 'Retensi Materi',
      pertanyaan: 'Apakah siswa masih ingat materi minggu sebelumnya?',
      opsi: [
        { value: 'ingat', label: 'Ingat dengan baik', bobot: 90 },
        { value: 'sebagian', label: 'Ingat sebagian', bobot: 65 },
        { value: 'tidak_ingat', label: 'Tidak ingat', bobot: 40 },
      ]
    },
    {
      key: 'respons_pengulangan',
      label: 'Respons terhadap Pengulangan',
      pertanyaan: 'Apakah siswa membaik setelah penjelasan diulang?',
      opsi: [
        { value: 'ya', label: 'Ya, langsung membaik', bobot: 90 },
        { value: 'kadang', label: 'Kadang-kadang', bobot: 65 },
        { value: 'tidak', label: 'Tidak ada perubahan', bobot: 40 },
      ]
    },
  ],
  disleksia: [
    {
      key: 'membaca_teks',
      label: 'Kemampuan Membaca',
      pertanyaan: 'Apakah siswa bisa membaca kalimat pendek?',
      opsi: [
        { value: 'lancar', label: 'Lancar', bobot: 90 },
        { value: 'terbata', label: 'Terbata-bata', bobot: 65 },
        { value: 'belum_bisa', label: 'Belum bisa', bobot: 40 },
      ]
    },
    {
      key: 'menulis',
      label: 'Kemampuan Menulis',
      pertanyaan: 'Apakah tulisan siswa bisa dibaca?',
      opsi: [
        { value: 'jelas', label: 'Jelas dan terbaca', bobot: 90 },
        { value: 'cukup_jelas', label: 'Cukup jelas', bobot: 65 },
        { value: 'sulit_dibaca', label: 'Sulit dibaca', bobot: 40 },
      ]
    },
    {
      key: 'pemahaman_lisan',
      label: 'Pemahaman Lisan',
      pertanyaan: 'Apakah siswa paham jika materi disampaikan secara lisan/verbal?',
      opsi: [
        { value: 'ya', label: 'Ya, paham dengan baik', bobot: 90 },
        { value: 'sebagian', label: 'Paham sebagian', bobot: 65 },
        { value: 'tidak', label: 'Tidak paham', bobot: 40 },
      ]
    },
    {
      key: 'kompensasi',
      label: 'Strategi Kompensasi',
      pertanyaan: 'Apakah siswa menggunakan cara lain untuk memahami pelajaran?',
      opsi: [
        { value: 'sering', label: 'Sering — aktif mencari cara sendiri', bobot: 90 },
        { value: 'kadang', label: 'Kadang-kadang', bobot: 65 },
        { value: 'tidak', label: 'Tidak — bergantung sepenuhnya pada guru', bobot: 40 },
      ]
    },
  ],
  adhd: [
    {
      key: 'durasi_fokus',
      label: 'Durasi Fokus',
      pertanyaan: 'Berapa lama siswa bisa fokus tanpa interupsi?',
      opsi: [
        { value: 'lebih15', label: 'Lebih dari 15 menit', bobot: 90 },
        { value: '5sampai15', label: '5 – 15 menit', bobot: 65 },
        { value: 'kurang5', label: 'Kurang dari 5 menit', bobot: 40 },
      ]
    },
    {
      key: 'impulsivitas',
      label: 'Impulsivitas',
      pertanyaan: 'Seberapa sering siswa menyela atau bertindak tanpa berpikir?',
      opsi: [
        { value: 'jarang', label: 'Jarang', bobot: 90 },
        { value: 'kadang', label: 'Kadang-kadang', bobot: 65 },
        { value: 'sering', label: 'Sering', bobot: 40 },
      ]
    },
    {
      key: 'selesai_tugas_adhd',
      label: 'Penyelesaian Tugas',
      pertanyaan: 'Seberapa sering siswa memulai tugas tapi tidak menyelesaikannya?',
      opsi: [
        { value: 'jarang', label: 'Jarang — biasanya selesai', bobot: 90 },
        { value: 'kadang', label: 'Kadang-kadang', bobot: 65 },
        { value: 'sering', label: 'Sering tidak selesai', bobot: 40 },
      ]
    },
    {
      key: 'respons_struktur',
      label: 'Respons terhadap Struktur',
      pertanyaan: 'Apakah siswa lebih baik dengan rutinitas/struktur yang jelas?',
      opsi: [
        { value: 'ya', label: 'Ya, sangat membantu', bobot: 90 },
        { value: 'netral', label: 'Netral', bobot: 65 },
        { value: 'tidak', label: 'Tidak berpengaruh', bobot: 40 },
      ]
    },
  ],
  autisme: [
    {
      key: 'kontak_mata',
      label: 'Kontak Mata',
      pertanyaan: 'Apakah siswa mau melakukan kontak mata saat berkomunikasi?',
      opsi: [
        { value: 'ya', label: 'Ya, wajar', bobot: 90 },
        { value: 'kadang', label: 'Kadang-kadang', bobot: 65 },
        { value: 'tidak', label: 'Menghindari kontak mata', bobot: 40 },
      ]
    },
    {
      key: 'komunikasi_verbal',
      label: 'Komunikasi Verbal',
      pertanyaan: 'Seberapa jelas siswa mengekspresikan kebutuhan secara verbal?',
      opsi: [
        { value: 'jelas', label: 'Jelas dan komunikatif', bobot: 90 },
        { value: 'terbatas', label: 'Terbatas tapi bisa dipahami', bobot: 65 },
        { value: 'sangat_terbatas', label: 'Sangat terbatas', bobot: 40 },
      ]
    },
    {
      key: 'rutinitas',
      label: 'Ketergantungan Rutinitas',
      pertanyaan: 'Bagaimana reaksi siswa jika ada perubahan jadwal/rutinitas?',
      opsi: [
        { value: 'fleksibel', label: 'Fleksibel, bisa menyesuaikan', bobot: 90 },
        { value: 'agak_terganggu', label: 'Agak terganggu tapi bisa diatasi', bobot: 65 },
        { value: 'sangat_terganggu', label: 'Sangat terganggu/menolak', bobot: 40 },
      ]
    },
  ],
  sensorik: [
    {
      key: 'partisipasi_kelas',
      label: 'Partisipasi Kelas',
      pertanyaan: 'Seberapa aktif siswa berpartisipasi dalam kegiatan kelas?',
      opsi: [
        { value: 'aktif', label: 'Aktif dengan alat bantu', bobot: 90 },
        { value: 'sedang', label: 'Sedang — perlu dorongan', bobot: 65 },
        { value: 'pasif', label: 'Pasif — kesulitan mengikuti', bobot: 40 },
      ]
    },
    {
      key: 'penggunaan_alat_bantu',
      label: 'Alat Bantu',
      pertanyaan: 'Apakah alat bantu (dengar/lihat) berfungsi dengan baik hari ini?',
      opsi: [
        { value: 'baik', label: 'Berfungsi baik', bobot: 90 },
        { value: 'kadang_masalah', label: 'Ada kendala kecil', bobot: 65 },
        { value: 'bermasalah', label: 'Bermasalah / tidak dipakai', bobot: 40 },
      ]
    },
  ],
  lainnya: [],
}

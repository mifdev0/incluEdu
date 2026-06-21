export const ASSESSMENT_SCALE = [
  { value: 'mandiri', label: 'Mandiri', description: 'Mampu dilakukan konsisten tanpa bantuan.' },
  { value: 'kadang', label: 'Kadang-kadang', description: 'Sudah bisa, tetapi belum konsisten.' },
  { value: 'butuh_bantuan', label: 'Butuh bantuan', description: 'Mampu setelah diarahkan atau dibantu.' },
  { value: 'belum_bisa', label: 'Belum bisa', description: 'Belum menunjukkan kemampuan tersebut.' },
] as const

export type AssessmentValue = typeof ASSESSMENT_SCALE[number]['value']

export type PhaseRecommendation = {
  area: 'Membaca' | 'Menulis' | 'Matematika'
  mata_pelajaran: 'Bahasa Indonesia' | 'Matematika'
  elemen: string
  fase: 'A' | 'B' | 'C'
  alasan: string
}

export type AssessmentItem = {
  key: string
  domain: 'akademik' | 'sikap_belajar' | 'sosial_emosional' | 'adl' | 'motorik_kasar' | 'motorik_halus'
  group: string
  label: string
}

export const ASSESSMENT_ITEMS: AssessmentItem[] = [
  { key: 'membaca_huruf', domain: 'akademik', group: 'Membaca', label: 'Mengenali dan menyebutkan huruf' },
  { key: 'membaca_suku_kata', domain: 'akademik', group: 'Membaca', label: 'Membaca suku kata sederhana' },
  { key: 'membaca_kalimat', domain: 'akademik', group: 'Membaca', label: 'Membaca dan memahami kalimat pendek' },
  { key: 'menulis_pegang_pensil', domain: 'akademik', group: 'Menulis', label: 'Memegang alat tulis dengan nyaman' },
  { key: 'menulis_menyalin', domain: 'akademik', group: 'Menulis', label: 'Menyalin huruf, kata, atau kalimat' },
  { key: 'menulis_mandiri', domain: 'akademik', group: 'Menulis', label: 'Menulis gagasan sederhana secara mandiri' },
  { key: 'berhitung_angka', domain: 'akademik', group: 'Berhitung', label: 'Mengenali lambang dan urutan angka' },
  { key: 'berhitung_operasi', domain: 'akademik', group: 'Berhitung', label: 'Melakukan operasi hitung dasar' },
  { key: 'berhitung_lanjut', domain: 'akademik', group: 'Berhitung', label: 'Menggunakan bilangan ratusan atau ribuan' },
  { key: 'fokus_5_menit', domain: 'sikap_belajar', group: 'Sikap belajar', label: 'Memusatkan perhatian lebih dari lima menit' },
  { key: 'mencoba_mandiri', domain: 'sikap_belajar', group: 'Sikap belajar', label: 'Mencoba mengerjakan sebelum meminta bantuan' },
  { key: 'mengikuti_instruksi', domain: 'sikap_belajar', group: 'Sikap belajar', label: 'Mengikuti instruksi sesuai urutan' },
  { key: 'bermain_bersama', domain: 'sosial_emosional', group: 'Sosial dan emosional', label: 'Bermain atau bekerja bersama teman' },
  { key: 'menyampaikan_kebutuhan', domain: 'sosial_emosional', group: 'Sosial dan emosional', label: 'Menyampaikan kebutuhan dengan cara yang dipahami' },
  { key: 'regulasi_frustrasi', domain: 'sosial_emosional', group: 'Sosial dan emosional', label: 'Mengendalikan emosi ketika frustrasi' },
  { key: 'adl_makan', domain: 'adl', group: 'Bina diri', label: 'Makan dan minum sendiri' },
  { key: 'adl_toilet', domain: 'adl', group: 'Bina diri', label: 'Menggunakan toilet sendiri' },
  { key: 'adl_berpakaian', domain: 'adl', group: 'Bina diri', label: 'Memakai atau merapikan pakaian sendiri' },
  { key: 'motorik_jalan', domain: 'motorik_kasar', group: 'Motorik kasar', label: 'Berjalan dengan seimbang dan aman' },
  { key: 'motorik_lompat', domain: 'motorik_kasar', group: 'Motorik kasar', label: 'Melompat atau melakukan gerakan dua kaki' },
  { key: 'motorik_koordinasi', domain: 'motorik_kasar', group: 'Motorik kasar', label: 'Mengikuti gerakan tubuh terkoordinasi' },
  { key: 'halus_menggunting', domain: 'motorik_halus', group: 'Motorik halus', label: 'Menggunting mengikuti garis sederhana' },
  { key: 'halus_tekanan_tulis', domain: 'motorik_halus', group: 'Motorik halus', label: 'Mengatur tekanan alat tulis dengan cukup baik' },
  { key: 'halus_benda_kecil', domain: 'motorik_halus', group: 'Motorik halus', label: 'Memegang dan memindahkan benda kecil' },
]

export const TEAM_ROLES = [
  { value: 'guru_kelas', label: 'Guru kelas', required: true },
  { value: 'orang_tua', label: 'Orang tua / wali', required: true },
  { value: 'kepala_sekolah', label: 'Kepala sekolah', required: true },
  { value: 'guru_bk', label: 'Guru BK', required: false },
  { value: 'gpk', label: 'Guru Pembimbing Khusus', required: false },
  { value: 'psikolog', label: 'Psikolog', required: false },
  { value: 'terapis', label: 'Terapis', required: false },
] as const

export const TRACKING_LEVELS = [
  { code: '+', label: 'Mandiri', description: 'Konsisten tanpa bantuan', score: 100 },
  { code: '±', label: 'Kadang-kadang', description: 'Bisa tetapi belum konsisten', score: 85 },
  { code: 'P', label: 'Petunjuk', description: 'Membutuhkan clue ringan', score: 75 },
  { code: 'D', label: 'Demonstrasi', description: 'Perlu dicontohkan terlebih dahulu', score: 55 },
  { code: 'Bv', label: 'Bantuan verbal', description: 'Memerlukan instruksi lisan berulang', score: 40 },
  { code: 'Bf', label: 'Bantuan fisik', description: 'Memerlukan bimbingan fisik langsung', score: 20 },
] as const

const abilityRank: Record<AssessmentValue, number> = {
  mandiri: 3,
  kadang: 2,
  butuh_bantuan: 1,
  belum_bisa: 0,
}

export function recommendCurriculumPhases(assessment: Record<string, AssessmentValue>): PhaseRecommendation[] {
  const readingSentence = abilityRank[assessment.membaca_kalimat] ?? 0
  const writingIndependent = abilityRank[assessment.menulis_mandiri] ?? 0
  const basicOperation = abilityRank[assessment.berhitung_operasi] ?? 0
  const advancedNumber = abilityRank[assessment.berhitung_lanjut] ?? 0

  return [
    readingSentence >= 2
      ? {
          area: 'Membaca',
          mata_pelajaran: 'Bahasa Indonesia',
          elemen: 'Membaca dan Memirsa',
          fase: 'B',
          alasan: 'Siswa sudah cukup mampu membaca dan memahami kalimat pendek, sehingga dapat mulai menggunakan target membaca Fase B.',
        }
      : {
          area: 'Membaca',
          mata_pelajaran: 'Bahasa Indonesia',
          elemen: 'Membaca dan Memirsa',
          fase: 'A',
          alasan: 'Kemampuan membaca huruf, suku kata, atau kalimat pendek masih perlu dikuatkan melalui target Fase A.',
        },
    writingIndependent >= 2
      ? {
          area: 'Menulis',
          mata_pelajaran: 'Bahasa Indonesia',
          elemen: 'Menulis',
          fase: 'B',
          alasan: 'Siswa sudah mulai menulis gagasan sederhana, sehingga target menulis dapat diarahkan ke Fase B.',
        }
      : {
          area: 'Menulis',
          mata_pelajaran: 'Bahasa Indonesia',
          elemen: 'Menulis',
          fase: 'A',
          alasan: 'Kemampuan memegang alat tulis, menyalin, atau menulis mandiri masih perlu dikuatkan melalui target Fase A.',
        },
    advancedNumber >= 2
      ? {
          area: 'Matematika',
          mata_pelajaran: 'Matematika',
          elemen: 'Bilangan',
          fase: 'C',
          alasan: 'Siswa sudah cukup mampu menggunakan bilangan ratusan atau ribuan sehingga dapat menggunakan target Fase C.',
        }
      : basicOperation >= 2
        ? {
            area: 'Matematika',
            mata_pelajaran: 'Matematika',
            elemen: 'Bilangan',
            fase: 'B',
            alasan: 'Siswa sudah cukup mampu melakukan operasi hitung dasar sehingga dapat menggunakan target Fase B.',
          }
        : {
            area: 'Matematika',
            mata_pelajaran: 'Matematika',
            elemen: 'Bilangan',
            fase: 'A',
            alasan: 'Pengenalan angka dan operasi hitung dasar masih perlu dikuatkan melalui target Fase A.',
          },
  ]
}

export function expectedPhaseFromClass(className: string, level: string) {
  const number = Number(className.match(/\d+/)?.[0])
  if (level === 'SD') {
    if (number >= 5) return 'C'
    if (number >= 3) return 'B'
    return 'A'
  }
  if (level === 'SMP') return 'D'
  if (level === 'SMA') return number >= 11 ? 'F' : 'E'
  return null
}

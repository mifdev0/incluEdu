export const ASSESSMENT_SCALE = [
  { value: 'mandiri', label: 'Mandiri', description: 'Mampu dilakukan konsisten tanpa bantuan.' },
  { value: 'kadang', label: 'Kadang-kadang', description: 'Sudah bisa, tetapi belum konsisten.' },
  { value: 'butuh_bantuan', label: 'Butuh bantuan', description: 'Mampu setelah diarahkan atau dibantu.' },
  { value: 'belum_bisa', label: 'Belum bisa', description: 'Belum menunjukkan kemampuan tersebut.' },
] as const

export type AssessmentValue = typeof ASSESSMENT_SCALE[number]['value']
export type CurriculumPhase = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export const CURRICULUM_PHASES: CurriculumPhase[] = ['A', 'B', 'C', 'D', 'E', 'F']

export const PHASE_DESCRIPTIONS: Record<CurriculumPhase, string> = {
  A: 'Kemampuan dasar awal, umumnya setara kelas 1–2 SD.',
  B: 'Kemampuan dasar berkembang, umumnya setara kelas 3–4 SD.',
  C: 'Kemampuan akhir sekolah dasar, umumnya setara kelas 5–6 SD.',
  D: 'Kemampuan jenjang SMP.',
  E: 'Kemampuan awal jenjang SMA.',
  F: 'Kemampuan lanjutan jenjang SMA.',
}

export type PhaseRecommendation = {
  area: 'Membaca' | 'Menulis' | 'Matematika'
  mata_pelajaran: 'Bahasa Indonesia' | 'Matematika'
  elemen: string
  fase: CurriculumPhase
  alasan: string
}

export type AssessmentResponseRow = {
  item_key: string
  item_label: string
  domain: AssessmentItem['domain']
  nilai: AssessmentValue
  fase_uji?: CurriculumPhase | null
}

export type NonAcademicGoalDraft = {
  area: string
  tujuan: string
  indikator: string
  target: number
  aktivitas: string
  media_alat: string
  pelaksana: string
  frekuensi: string
  metode_evaluasi: string
  langkah_tugas: string[]
  jenis_target: 'non_akademik'
  kriteria_tuntas: string
}

export type AssessmentItem = {
  key: string
  domain: 'akademik' | 'sikap_belajar' | 'sosial_emosional' | 'adl' | 'motorik_kasar' | 'motorik_halus'
  group: string
  label: string
  phase?: CurriculumPhase
}

export const ACADEMIC_ASSESSMENT_ITEMS: AssessmentItem[] = [
  { key: 'a_membaca_huruf', domain: 'akademik', group: 'Membaca', phase: 'A', label: 'Mengenali huruf dan bunyinya' },
  { key: 'a_membaca_suku_kata', domain: 'akademik', group: 'Membaca', phase: 'A', label: 'Membaca suku kata dan kata sederhana' },
  { key: 'a_membaca_kalimat', domain: 'akademik', group: 'Membaca', phase: 'A', label: 'Memahami informasi dalam kalimat pendek' },
  { key: 'a_menulis_huruf', domain: 'akademik', group: 'Menulis', phase: 'A', label: 'Menulis huruf dan kata dengan bentuk yang dapat dikenali' },
  { key: 'a_menulis_menyalin', domain: 'akademik', group: 'Menulis', phase: 'A', label: 'Menyalin kata atau kalimat pendek' },
  { key: 'a_menulis_kalimat', domain: 'akademik', group: 'Menulis', phase: 'A', label: 'Menulis satu kalimat sederhana secara mandiri' },
  { key: 'a_matematika_angka', domain: 'akademik', group: 'Matematika', phase: 'A', label: 'Mengenali, mengurutkan, dan membandingkan bilangan dasar' },
  { key: 'a_matematika_operasi', domain: 'akademik', group: 'Matematika', phase: 'A', label: 'Melakukan penjumlahan atau pengurangan sederhana' },
  { key: 'a_matematika_masalah', domain: 'akademik', group: 'Matematika', phase: 'A', label: 'Menyelesaikan masalah hitung sederhana dengan benda atau gambar' },

  { key: 'b_membaca_teks', domain: 'akademik', group: 'Membaca', phase: 'B', label: 'Membaca teks pendek dengan cukup lancar' },
  { key: 'b_membaca_informasi', domain: 'akademik', group: 'Membaca', phase: 'B', label: 'Menemukan informasi yang tertulis jelas dalam paragraf' },
  { key: 'b_membaca_ide_pokok', domain: 'akademik', group: 'Membaca', phase: 'B', label: 'Menentukan gagasan utama teks pendek' },
  { key: 'b_menulis_paragraf', domain: 'akademik', group: 'Menulis', phase: 'B', label: 'Menulis paragraf pendek yang saling berkaitan' },
  { key: 'b_menulis_ejaan', domain: 'akademik', group: 'Menulis', phase: 'B', label: 'Menggunakan huruf kapital dan tanda baca dasar' },
  { key: 'b_menulis_informasi', domain: 'akademik', group: 'Menulis', phase: 'B', label: 'Menulis informasi atau pengalaman secara runtut' },
  { key: 'b_matematika_operasi', domain: 'akademik', group: 'Matematika', phase: 'B', label: 'Melakukan operasi hitung bilangan cacah sesuai tingkatnya' },
  { key: 'b_matematika_pengukuran', domain: 'akademik', group: 'Matematika', phase: 'B', label: 'Menggunakan pengukuran panjang, berat, waktu, atau uang' },
  { key: 'b_matematika_soal_cerita', domain: 'akademik', group: 'Matematika', phase: 'B', label: 'Memilih operasi yang tepat untuk soal cerita sederhana' },

  { key: 'c_membaca_ringkasan', domain: 'akademik', group: 'Membaca', phase: 'C', label: 'Merangkum informasi penting dari beberapa paragraf' },
  { key: 'c_membaca_inferensi', domain: 'akademik', group: 'Membaca', phase: 'C', label: 'Menarik kesimpulan sederhana dari teks' },
  { key: 'c_membaca_bandingkan', domain: 'akademik', group: 'Membaca', phase: 'C', label: 'Membandingkan informasi dari dua bagian teks' },
  { key: 'c_menulis_teks', domain: 'akademik', group: 'Menulis', phase: 'C', label: 'Menulis teks beberapa paragraf dengan struktur yang jelas' },
  { key: 'c_menulis_revisi', domain: 'akademik', group: 'Menulis', phase: 'C', label: 'Memeriksa dan memperbaiki isi atau ejaan tulisan' },
  { key: 'c_menulis_pendapat', domain: 'akademik', group: 'Menulis', phase: 'C', label: 'Menuliskan pendapat disertai alasan sederhana' },
  { key: 'c_matematika_pecahan', domain: 'akademik', group: 'Matematika', phase: 'C', label: 'Menggunakan pecahan, desimal, atau persen dasar' },
  { key: 'c_matematika_geometri', domain: 'akademik', group: 'Matematika', phase: 'C', label: 'Menyelesaikan masalah pengukuran dan geometri dasar' },
  { key: 'c_matematika_penalaran', domain: 'akademik', group: 'Matematika', phase: 'C', label: 'Menjelaskan langkah penyelesaian masalah matematika' },

  { key: 'd_membaca_kritis', domain: 'akademik', group: 'Membaca', phase: 'D', label: 'Menilai informasi utama dan pendukung dalam teks' },
  { key: 'd_membaca_inferensi', domain: 'akademik', group: 'Membaca', phase: 'D', label: 'Membuat inferensi berdasarkan bukti dalam teks' },
  { key: 'd_membaca_sumber', domain: 'akademik', group: 'Membaca', phase: 'D', label: 'Membandingkan sudut pandang atau informasi dari beberapa sumber' },
  { key: 'd_menulis_struktur', domain: 'akademik', group: 'Menulis', phase: 'D', label: 'Menulis teks informatif atau argumentatif dengan struktur jelas' },
  { key: 'd_menulis_bukti', domain: 'akademik', group: 'Menulis', phase: 'D', label: 'Menggunakan alasan atau bukti untuk mendukung gagasan' },
  { key: 'd_menulis_sunting', domain: 'akademik', group: 'Menulis', phase: 'D', label: 'Menyunting tulisan agar lebih runtut dan efektif' },
  { key: 'd_matematika_aljabar', domain: 'akademik', group: 'Matematika', phase: 'D', label: 'Menggunakan pola, rasio, proporsi, atau bentuk aljabar dasar' },
  { key: 'd_matematika_data', domain: 'akademik', group: 'Matematika', phase: 'D', label: 'Membaca dan menafsirkan data atau peluang sederhana' },
  { key: 'd_matematika_model', domain: 'akademik', group: 'Matematika', phase: 'D', label: 'Membuat model matematika dari masalah kontekstual' },

  { key: 'e_membaca_analisis', domain: 'akademik', group: 'Membaca', phase: 'E', label: 'Menganalisis gagasan, argumen, dan bukti dalam teks kompleks' },
  { key: 'e_membaca_validitas', domain: 'akademik', group: 'Membaca', phase: 'E', label: 'Menilai relevansi dan keandalan informasi dari berbagai sumber' },
  { key: 'e_membaca_sintesis', domain: 'akademik', group: 'Membaca', phase: 'E', label: 'Menggabungkan informasi dari beberapa teks menjadi pemahaman baru' },
  { key: 'e_menulis_argumen', domain: 'akademik', group: 'Menulis', phase: 'E', label: 'Menulis argumen terstruktur dengan bukti yang relevan' },
  { key: 'e_menulis_audiens', domain: 'akademik', group: 'Menulis', phase: 'E', label: 'Menyesuaikan bahasa dan bentuk tulisan dengan tujuan serta pembaca' },
  { key: 'e_menulis_revisi', domain: 'akademik', group: 'Menulis', phase: 'E', label: 'Merevisi tulisan berdasarkan ketepatan isi, struktur, dan bahasa' },
  { key: 'e_matematika_fungsi', domain: 'akademik', group: 'Matematika', phase: 'E', label: 'Menggunakan persamaan, fungsi, atau representasi aljabar' },
  { key: 'e_matematika_statistika', domain: 'akademik', group: 'Matematika', phase: 'E', label: 'Menganalisis data dan ukuran statistik sesuai tingkatnya' },
  { key: 'e_matematika_strategi', domain: 'akademik', group: 'Matematika', phase: 'E', label: 'Memilih dan menjelaskan strategi penyelesaian masalah kompleks' },

  { key: 'f_membaca_evaluasi', domain: 'akademik', group: 'Membaca', phase: 'F', label: 'Mengevaluasi argumen, bias, dan kualitas bukti secara kritis' },
  { key: 'f_membaca_interpretasi', domain: 'akademik', group: 'Membaca', phase: 'F', label: 'Menginterpretasi teks kompleks dalam konteks yang berbeda' },
  { key: 'f_membaca_sintesis', domain: 'akademik', group: 'Membaca', phase: 'F', label: 'Menyusun sintesis dari sumber yang beragam dan kompleks' },
  { key: 'f_menulis_kompleks', domain: 'akademik', group: 'Menulis', phase: 'F', label: 'Mengembangkan tulisan kompleks dengan argumen dan bukti mendalam' },
  { key: 'f_menulis_sumber', domain: 'akademik', group: 'Menulis', phase: 'F', label: 'Mengintegrasikan serta mencantumkan sumber secara tepat' },
  { key: 'f_menulis_reflektif', domain: 'akademik', group: 'Menulis', phase: 'F', label: 'Mengevaluasi dan memperbaiki tulisan secara mandiri' },
  { key: 'f_matematika_model', domain: 'akademik', group: 'Matematika', phase: 'F', label: 'Membangun dan mengevaluasi model matematika yang kompleks' },
  { key: 'f_matematika_pembuktian', domain: 'akademik', group: 'Matematika', phase: 'F', label: 'Menjelaskan alasan, pola, atau pembuktian matematis secara runtut' },
  { key: 'f_matematika_data', domain: 'akademik', group: 'Matematika', phase: 'F', label: 'Menafsirkan data kompleks untuk mengambil kesimpulan' },
]

export const NON_ACADEMIC_ASSESSMENT_ITEMS: AssessmentItem[] = [
  { key: 'fokus_5_menit', domain: 'sikap_belajar', group: 'Sikap belajar', label: 'Memusatkan perhatian sesuai durasi kegiatan yang disepakati' },
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

export const ASSESSMENT_ITEMS: AssessmentItem[] = [
  ...ACADEMIC_ASSESSMENT_ITEMS.filter((item) => item.phase === 'A'),
  ...NON_ACADEMIC_ASSESSMENT_ITEMS,
]

export function getAssessmentItemsForPhase(phase: CurriculumPhase): AssessmentItem[] {
  return [
    ...ACADEMIC_ASSESSMENT_ITEMS.filter((item) => item.phase === phase),
    ...NON_ACADEMIC_ASSESSMENT_ITEMS,
  ]
}

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

function previousPhase(phase: CurriculumPhase): CurriculumPhase {
  return CURRICULUM_PHASES[Math.max(0, CURRICULUM_PHASES.indexOf(phase) - 1)]
}

export function recommendCurriculumPhases(
  assessment: Record<string, AssessmentValue>,
  testedPhase: CurriculumPhase = 'A',
): PhaseRecommendation[] {
  return ([
    { area: 'Membaca', mata_pelajaran: 'Bahasa Indonesia', elemen: 'Membaca dan Memirsa' },
    { area: 'Menulis', mata_pelajaran: 'Bahasa Indonesia', elemen: 'Menulis' },
    { area: 'Matematika', mata_pelajaran: 'Matematika', elemen: 'Bilangan' },
  ] as const).map((config) => {
    const items = ACADEMIC_ASSESSMENT_ITEMS.filter((item) => item.phase === testedPhase && item.group === config.area)
    const scores = items.map((item) => abilityRank[assessment[item.key]] ?? 0)
    const average = scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0
    const recommendedPhase = average < 1.67 ? previousPhase(testedPhase) : testedPhase
    const strong = average >= 2.67
    const alasan = recommendedPhase !== testedPhase
      ? `Kemampuan pada indikator Fase ${testedPhase} masih memerlukan banyak bantuan. Target awal disarankan menggunakan Fase ${recommendedPhase}, lalu diuji kembali setelah ada kemajuan.`
      : strong
        ? `Sebagian besar indikator Fase ${testedPhase} sudah dilakukan mandiri. Gunakan target Fase ${testedPhase} dan pertimbangkan asesmen fase berikutnya untuk memastikan kesiapan naik level.`
        : `Kemampuan yang terlihat sesuai untuk mulai menggunakan target Fase ${testedPhase} dengan dukungan dan evaluasi berkala.`

    return { ...config, fase: recommendedPhase, alasan }
  })
}

export function expectedPhaseFromClass(className: string, level: string, grade?: number | null): CurriculumPhase | null {
  const number = grade || Number(className.match(/\d+/)?.[0])
  if (level === 'SD') {
    if (number >= 5) return 'C'
    if (number >= 3) return 'B'
    return 'A'
  }
  if (level === 'SMP') return 'D'
  if (level === 'SMA') return number >= 11 ? 'F' : 'E'
  return null
}

export function buildNonAcademicGoal(studentName: string, responses: AssessmentResponseRow[]): NonAcademicGoalDraft {
  const domainPriority: AssessmentItem['domain'][] = ['sikap_belajar', 'sosial_emosional', 'adl', 'motorik_halus', 'motorik_kasar']
  const needs = responses
    .filter((item) => item.domain !== 'akademik' && (item.nilai === 'butuh_bantuan' || item.nilai === 'belum_bisa'))
    .sort((a, b) => domainPriority.indexOf(a.domain) - domainPriority.indexOf(b.domain))
  const selected = needs[0] || responses.find((item) => item.domain !== 'akademik')
  const ability = selected?.item_label || 'mengikuti kegiatan pembelajaran dengan lebih mandiri'
  const areaMap: Record<AssessmentItem['domain'], string> = {
    akademik: 'Sikap belajar',
    sikap_belajar: 'Sikap belajar',
    sosial_emosional: 'Sosial dan emosional',
    adl: 'Bina diri',
    motorik_kasar: 'Motorik kasar',
    motorik_halus: 'Motorik halus',
  }
  const area = selected ? areaMap[selected.domain] : 'Sikap belajar'
  const lowerAbility = ability.charAt(0).toLowerCase() + ability.slice(1)

  return {
    area,
    tujuan: `${studentName} mampu ${lowerAbility} dengan bantuan paling banyak berupa petunjuk ringan dalam 4 dari 5 kesempatan.`,
    indikator: `Tingkat kemandirian saat ${lowerAbility}.`,
    target: 75,
    aktivitas: `Latihan ${lowerAbility} secara bertahap dalam kegiatan rutin.`,
    media_alat: 'Panduan visual, contoh langsung, dan penguatan positif sesuai kebutuhan.',
    pelaksana: 'Guru kelas dan anggota Tim PPI terkait',
    frekuensi: 'Dilakukan dalam kegiatan harian dan dicatat secara berkala',
    metode_evaluasi: 'Tracking tingkat bantuan + / ± / P / D / Bv / Bf',
    langkah_tugas: [
      `Memahami kegiatan ${lowerAbility}`,
      `Mencoba ${lowerAbility} setelah arahan awal`,
      `Menyelesaikan ${lowerAbility} dengan bantuan paling sedikit`,
    ],
    jenis_target: 'non_akademik',
    kriteria_tuntas: 'Tuntas jika mencapai level P atau lebih mandiri dalam 4 dari 5 kesempatan.',
  }
}

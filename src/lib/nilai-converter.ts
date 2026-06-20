import { DIMENSI_UNIVERSAL, DIMENSI_KHUSUS, type KategoriABK } from './observasi-schema'

const bobotMap: Record<string, number> = {}
function buildBobotMap() {
  for (const item of DIMENSI_UNIVERSAL) {
    for (const o of item.opsi) {
      bobotMap[o.value] = o.bobot
    }
  }
  for (const kategori of Object.keys(DIMENSI_KHUSUS) as KategoriABK[]) {
    for (const item of DIMENSI_KHUSUS[kategori]) {
      for (const o of item.opsi) {
        bobotMap[o.value] = o.bobot
      }
    }
  }
}
buildBobotMap()
Object.assign(bobotMap, {
  belum_terlihat: 0,
  banyak_bantuan: 35,
  sedikit_bantuan: 65,
  mandiri_konsisten: 100,
})

export function getBobot(value: string): number {
  return bobotMap[value] ?? 50
}

export function hitungNilaiKognitif(observasi: Record<string, string | undefined>, kategori: KategoriABK): number {
  const dimensiKognitifMap: Record<KategoriABK, string[]> = {
    slow_learner: ['pemahaman_instruksi', 'penyelesaian_tugas', 'retensi_materi', 'respons_pengulangan'],
    disleksia: ['membaca_teks', 'menulis', 'pemahaman_lisan', 'kompensasi'],
    adhd: ['durasi_fokus', 'impulsivitas', 'selesai_tugas_adhd', 'respons_struktur'],
    autisme: ['kontak_mata', 'komunikasi_verbal', 'rutinitas'],
    sensorik: ['partisipasi_kelas', 'penggunaan_alat_bantu'],
    lainnya: [],
  }

  const keys = dimensiKognitifMap[kategori] || []
  const values = keys.map(k => observasi[k]).filter((v): v is string => !!v)
  if (values.length === 0) return 65
  const total = values.reduce((sum, v) => sum + (bobotMap[v] ?? 65), 0)
  return Math.round(total / values.length)
}

export function hitungNilaiSosial(observasi: Record<string, string | undefined>): number {
  const v = observasi.interaksi_sosial
  return v ? (bobotMap[v] ?? 65) : 65
}

export function hitungNilaiEmosional(observasi: Record<string, string | undefined>): number {
  const emosi = observasi.kondisi_emosi ? (bobotMap[observasi.kondisi_emosi] ?? 65) : 65
  const motivasi = observasi.motivasi_belajar ? (bobotMap[observasi.motivasi_belajar] ?? 65) : 65
  return Math.round((emosi + motivasi) / 2)
}

export function hitungRataRata(observasi: Record<string, string | undefined>, kategori: KategoriABK): number {
  const kognitif = hitungNilaiKognitif(observasi, kategori)
  const sosial = hitungNilaiSosial(observasi)
  const emosional = hitungNilaiEmosional(observasi)
  return Math.round((kognitif + sosial + emosional) / 3)
}

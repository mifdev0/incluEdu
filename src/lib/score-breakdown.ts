import { DIMENSI_KHUSUS, DIMENSI_UNIVERSAL, type DimensiItem, type KategoriABK } from './observasi-schema'
import { getBobot } from './nilai-converter'
import { normalizeObservationCategory } from './observation-progress'

export type ScoreAspect = 'kognitif' | 'fokus' | 'sosial' | 'emosi'

export type ScoreDetail = {
  key: string
  label: string
  answer: string
  weight: number
}

const cognitiveKeys: Record<KategoriABK, string[]> = {
  slow_learner: ['pemahaman_instruksi', 'penyelesaian_tugas', 'retensi_materi', 'respons_pengulangan'],
  disleksia: ['membaca_teks', 'menulis', 'pemahaman_lisan', 'kompensasi'],
  adhd: ['durasi_fokus', 'impulsivitas', 'selesai_tugas_adhd', 'respons_struktur'],
  autisme: ['kontak_mata', 'komunikasi_verbal', 'rutinitas'],
  sensorik: ['partisipasi_kelas', 'penggunaan_alat_bantu'],
  lainnya: [],
}

function itemMap(category: string) {
  const normalized = normalizeObservationCategory(category)
  return new Map(
    [...DIMENSI_UNIVERSAL, ...(DIMENSI_KHUSUS[normalized] || [])]
      .map((item) => [item.key, item] as const),
  )
}

function detailFor(item: DimensiItem | undefined, value: string | undefined): ScoreDetail | null {
  if (!item || !value) return null
  return {
    key: item.key,
    label: item.label,
    answer: item.opsi.find((option) => option.value === value)?.label || value,
    weight: getBobot(value),
  }
}

export function getScoreDetails(
  answers: Record<string, string>,
  category: string,
  aspect: ScoreAspect,
): ScoreDetail[] {
  const normalized = normalizeObservationCategory(category)
  const items = itemMap(category)
  let keys: string[] = []

  if (aspect === 'kognitif') keys = cognitiveKeys[normalized]
  if (aspect === 'fokus') {
    keys = ['durasi_fokus', 'pemahaman_instruksi', 'motivasi_belajar']
    const firstAvailable = keys.find((key) => answers[key])
    keys = firstAvailable ? [firstAvailable] : []
  }
  if (aspect === 'sosial') keys = ['interaksi_sosial']
  if (aspect === 'emosi') keys = ['kondisi_emosi', 'motivasi_belajar']

  return keys
    .map((key) => detailFor(items.get(key), answers[key]))
    .filter((detail): detail is ScoreDetail => Boolean(detail))
}

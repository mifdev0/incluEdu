import type { ProgressPoint } from '@/components/progress-chart'
import { getBobot, hitungNilaiEmosional, hitungNilaiKognitif, hitungNilaiSosial } from './nilai-converter'
import type { KategoriABK } from './observasi-schema'

export type ObservationRow = {
  minggu_ke: number
  tanggal?: string
  jawaban: Record<string, string>
}

export function normalizeObservationCategory(category: string): KategoriABK {
  if (['slow_learner', 'disleksia', 'adhd', 'autisme'].includes(category)) return category as KategoriABK
  if (['tunanetra', 'tunarungu'].includes(category)) return 'sensorik'
  return 'lainnya'
}

export function observationsToProgress(rows: ObservationRow[], category: string): ProgressPoint[] {
  const normalizedCategory = normalizeObservationCategory(category)
  return rows.map((row) => {
    const cognitive = hitungNilaiKognitif(row.jawaban, normalizedCategory)
    const focusValue = row.jawaban.durasi_fokus || row.jawaban.pemahaman_instruksi || row.jawaban.motivasi_belajar
    return {
      label: `Minggu ${row.minggu_ke}`,
      kognitif: cognitive,
      fokus: focusValue ? getBobot(focusValue) : cognitive,
      sosial: hitungNilaiSosial(row.jawaban),
      emosi: hitungNilaiEmosional(row.jawaban),
    }
  })
}

export function progressTrend(points: ProgressPoint[]): 'membaik' | 'stagnan' | 'menurun' {
  if (points.length < 2) return 'stagnan'
  const average = (point: ProgressPoint) => (point.kognitif + point.fokus + point.sosial + point.emosi) / 4
  const change = average(points[points.length - 1]) - average(points[0])
  if (change >= 5) return 'membaik'
  if (change <= -5) return 'menurun'
  return 'stagnan'
}

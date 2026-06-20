export type NormalizedAnalysis = {
  trend: 'membaik' | 'stagnan' | 'menurun'
  nilai_kognitif: number
  nilai_fokus: number
  nilai_sosial: number
  nilai_emosional: number
  nilai_rata_rata: number
  highlights: string[]
  concerns: string[]
  rekomendasi_guru: string[]
  rapor_narasi: string
  rekomendasi_ortu: string[]
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => typeof item === 'object' && item !== null ? Object.values(item) : [item])
      .map((item) => String(item).trim())
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/\n+|(?:\s*[-•]\s+)|(?:\s*\d+[.)]\s+)/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).map((item) => String(item).trim()).filter(Boolean)
  }
  return []
}

function score(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.round(Math.min(100, Math.max(0, parsed)))
}

export function normalizeAnalysis(value: unknown): NormalizedAnalysis {
  const source = typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {}
  const rawTrend = String(source.trend || 'stagnan').toLowerCase()
  const trend: NormalizedAnalysis['trend'] =
    rawTrend.includes('membaik') ? 'membaik'
      : rawTrend.includes('menurun') ? 'menurun'
        : 'stagnan'

  const kognitif = score(source.nilai_kognitif)
  const sosial = score(source.nilai_sosial)
  const emosional = score(source.nilai_emosional)
  const providedAverage = score(source.nilai_rata_rata)

  return {
    trend,
    nilai_kognitif: kognitif,
    nilai_fokus: score(source.nilai_fokus),
    nilai_sosial: sosial,
    nilai_emosional: emosional,
    nilai_rata_rata: providedAverage || Math.round((kognitif + sosial + emosional) / 3),
    highlights: toStringList(source.highlights),
    concerns: toStringList(source.concerns),
    rekomendasi_guru: toStringList(source.rekomendasi_guru),
    rapor_narasi: String(source.rapor_narasi || '').trim(),
    rekomendasi_ortu: toStringList(source.rekomendasi_ortu),
  }
}

export function applyObservationScores(
  analysis: NormalizedAnalysis,
  scores: {
    trend: NormalizedAnalysis['trend']
    kognitif: number
    fokus: number
    sosial: number
    emosi: number
  } | null,
): NormalizedAnalysis {
  if (!scores) return analysis
  return {
    ...analysis,
    trend: scores.trend,
    nilai_kognitif: scores.kognitif,
    nilai_fokus: scores.fokus,
    nilai_sosial: scores.sosial,
    nilai_emosional: scores.emosi,
    nilai_rata_rata: Math.round((scores.kognitif + scores.fokus + scores.sosial + scores.emosi) / 4),
  }
}

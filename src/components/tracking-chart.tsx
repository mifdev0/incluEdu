'use client'

import { TRACKING_LEVELS } from '@/lib/ppi-v2-data'

type TrackingRow = {
  tujuan_ppi_id: string
  tanggal: string
  sesi_ke: number
  kode_bantuan: string
  benar: number | null
  total: number | null
  langkah_label: string
}

type Goal = {
  id: string
  jenis_target: 'akademik' | 'non_akademik'
  status: string
}

type TrackingChartProps = {
  tracking: TrackingRow[]
  goals: Goal[]
}

export function TrackingChart({ tracking, goals }: TrackingChartProps) {
  const activeIds = new Set(goals.filter((g) => g.status !== 'tercapai').map((g) => g.id))
  const academicIds = new Set(goals.filter((g) => g.jenis_target === 'akademik' && activeIds.has(g.id)).map((g) => g.id))
  const nonAcademicIds = new Set(goals.filter((g) => g.jenis_target === 'non_akademik' && activeIds.has(g.id)).map((g) => g.id))

  const byDate = new Map<string, { akademik: number[]; nonAkademik: number[] }>()
  for (const row of tracking) {
    if (!activeIds.has(row.tujuan_ppi_id)) continue
    const dateKey = row.tanggal.slice(0, 10)
    if (!byDate.has(dateKey)) byDate.set(dateKey, { akademik: [], nonAkademik: [] })
    const bucket = byDate.get(dateKey)!
    if (academicIds.has(row.tujuan_ppi_id) && row.benar !== null && row.total && row.total > 0) {
      bucket.akademik.push(Math.round((row.benar / row.total) * 100))
    }
    if (nonAcademicIds.has(row.tujuan_ppi_id)) {
      const score = TRACKING_LEVELS.find((l) => l.code === row.kode_bantuan)?.score
      if (score !== undefined) bucket.nonAkademik.push(score)
    }
  }

  const points: { date: string; akademik: number | null; nonAkademik: number | null }[] = []
  const sorted = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const [date, values] of sorted) {
    const avg = (arr: number[]) => (arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null)
    points.push({ date, akademik: avg(values.akademik), nonAkademik: avg(values.nonAkademik) })
  }

  const hasAcademic = points.some((p) => p.akademik !== null)
  const hasNonAcademic = points.some((p) => p.nonAkademik !== null)

  if (points.length === 0 || (!hasAcademic && !hasNonAcademic)) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
        {tracking.length === 0
          ? 'Belum ada data tracking.'
          : `Data tracking tersedia (${tracking.length} catatan) tetapi tidak ada yang cocok dengan goal aktif.`}
      </div>
    )
  }

  const width = 700
  const height = 280
  const pad = { top: 24, right: 24, bottom: 48, left: 48 }
  const cw = width - pad.left - pad.right
  const ch = height - pad.top - pad.bottom
  const xPos = (i: number) => pad.left + (i * cw) / Math.max(points.length - 1, 1)
  const yPos = (v: number) => pad.top + ((100 - v) / 100) * ch

  const shortDate = (d: string) => {
    const parts = d.split('-')
    return `${parseInt(parts[2])}/${parseInt(parts[1])}`
  }

  const visibleLines = [
    { key: 'akademik', label: 'Akademik', color: '#7C3AED', data: points.map((p) => p.akademik), show: hasAcademic },
    { key: 'nonAkademik', label: 'Non-akademik', color: '#16825D', data: points.map((p) => p.nonAkademik), show: hasNonAcademic },
  ].filter((l) => l.show)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
        {visibleLines.map((l) => (
          <div key={l.key} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Grafik perkembangan tracking harian">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={width - pad.right} y1={yPos(v)} y2={yPos(v)} stroke="#E6DDEC" strokeDasharray={v === 0 ? undefined : '5 7'} />
            <text x={pad.left - 12} y={yPos(v) + 4} textAnchor="end" className="fill-[#7b7487] text-[11px]">{v}</text>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={p.date} x={xPos(i)} y={height - 14} textAnchor="middle" className="fill-[#4a4455] text-[11px] font-semibold">{shortDate(p.date)}</text>
        ))}
        {visibleLines.map((l) => {
          const pts = l.data.map((v, i) => (v !== null ? `${xPos(i)},${yPos(v)}` : null)).filter(Boolean).join(' ')
          return (
            <g key={l.key}>
              {pts.split(' ').length >= 2 && <polyline points={pts} fill="none" stroke={l.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
              {l.data.map((v, i) => v !== null ? (
                <g key={`${l.key}-${i}`}>
                  <circle cx={xPos(i)} cy={yPos(v)} r="7" fill={l.color} stroke="white" strokeWidth="2" />
                  <title>{`${l.label} ${shortDate(points[i].date)}: ${v}%`}</title>
                </g>
              ) : null)}
            </g>
          )
        })}
      </svg>

      <div className="mt-2 text-center text-[11px] text-on-surface-variant">
        {tracking.length} catatan tracking · {points.length} hari · nilai rata-rata harian
      </div>
    </div>
  )
}

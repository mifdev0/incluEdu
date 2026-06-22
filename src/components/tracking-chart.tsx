'use client'

export type ChartPoint = {
  date: string
  akademik: number | null
  nonAkademik: number | null
}

type TrackingChartProps = {
  points: ChartPoint[]
}

export function TrackingChart({ points }: TrackingChartProps) {
  const hasAcademic = points.some((p) => p.akademik !== null)
  const hasNonAcademic = points.some((p) => p.nonAkademik !== null)

  if (points.length === 0 || (!hasAcademic && !hasNonAcademic)) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
        Belum ada data tracking untuk ditampilkan.
      </div>
    )
  }

  const shortDate = (d: string) => {
    const parts = d.split('-')
    return `${parseInt(parts[2])}/${parseInt(parts[1])}`
  }

  const W = 700, H = 260, PL = 48, PR = 24, PT = 20, PB = 40
  const CW = W - PL - PR
  const CH = H - PT - PB
  const xPos = (i: number) => PL + (i * CW) / Math.max(points.length - 1, 1)
  const yPos = (v: number) => PT + ((100 - v) / 100) * CH

  const visibleLines = [
    { key: 'akademik', label: 'Akademik', color: '#7C3AED', lineColor: '#7C3AED', data: points.map((p) => p.akademik), show: hasAcademic },
    { key: 'nonAkademik', label: 'Non-akademik', color: '#16825D', lineColor: '#16825D', data: points.map((p) => p.nonAkademik), show: hasNonAcademic },
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

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Grafik perkembangan tracking harian">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={yPos(v)} y2={yPos(v)} stroke="#E6DDEC" strokeDasharray={v === 0 ? undefined : '5 7'} />
            <text x={PL - 8} y={yPos(v) + 4} textAnchor="end" className="fill-[#7b7487] text-[11px]">{v}</text>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={p.date} x={xPos(i)} y={H - 10} textAnchor="middle" className="fill-[#4a4455] text-[11px] font-semibold">{shortDate(p.date)}</text>
        ))}
        {visibleLines.map((l) => {
          const pts = l.data.map((v, i) => (v !== null ? `${xPos(i)},${yPos(v)}` : null)).filter(Boolean).join(' ')
          return (
            <g key={l.key}>
              {points.length >= 2 && <polyline points={pts} fill="none" stroke={l.lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
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

      <div className="mt-2 text-center text-[11px] text-on-surface-variant">Titik = nilai rata-rata per hari. {points.length < 2 ? 'Kumpulkan tracking di hari berbeda untuk melihat garis tren.' : 'Garis menunjukkan tren naik/turun antar hari.'}</div>
    </div>
  )
}

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

      <div className="relative" style={{ height: '220px' }}>
        {/* sumbu Y */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-[11px] text-on-surface-variant">
          <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
        </div>
        {/* area chart */}
        <div className="ml-10 h-full">
          <svg width="100%" height="100%" className="overflow-visible" role="img" aria-label="Grafik perkembangan tracking harian">
            {[0, 25, 50, 75, 100].map((v) => (
              <line key={v} x1="0" x2="100%" y1={`${100 - v}%`} y2={`${100 - v}%`} stroke="#E6DDEC" strokeDasharray={v === 0 ? undefined : '5 7'} />
            ))}
            {visibleLines.map((l) => {
              const pts = l.data.map((v, i) => {
                if (v === null) return null
                const x = `${(i / Math.max(points.length - 1, 1)) * 100}%`
                const y = `${100 - v}%`
                return `${x},${y}`
              }).filter(Boolean).join(' ')
              return (
                <g key={l.key}>
                  {pts.split(' ').length >= 2 && <polyline points={pts} fill="none" stroke={l.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                  {l.data.map((v, i) => v !== null ? (
                    <g key={`${l.key}-${i}`}>
                      <circle cx={`${(i / Math.max(points.length - 1, 1)) * 100}%`} cy={`${100 - v}%`} r="7" fill={l.color} stroke="white" strokeWidth="2" />
                      <title>{`${l.label} ${shortDate(points[i].date)}: ${v}%`}</title>
                    </g>
                  ) : null)}
                </g>
              )
            })}
            {/* label tanggal */}
            {points.map((p, i) => (
              <text key={p.date} x={`${(i / Math.max(points.length - 1, 1)) * 100}%`} y="100%" textAnchor="middle" dy="16" className="fill-[#4a4455] text-[11px] font-semibold">{shortDate(p.date)}</text>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-on-surface-variant">Titik melambangkan nilai rata-rata seluruh target per hari tracking.</div>
    </div>
  )
}

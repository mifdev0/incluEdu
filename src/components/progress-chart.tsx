export type ProgressPoint = {
  label: string
  kognitif: number
  fokus: number
  sosial: number
  emosi: number
}

const series = [
  { key: 'kognitif', label: 'Kognitif', color: '#7C3AED' },
  { key: 'fokus', label: 'Fokus', color: '#0891B2' },
  { key: 'sosial', label: 'Sosial', color: '#16825D' },
  { key: 'emosi', label: 'Emosi', color: '#D97706' },
] as const

type ProgressChartProps = {
  data: ProgressPoint[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const width = 760
  const height = 320
  const padding = { top: 24, right: 24, bottom: 54, left: 46 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const x = (index: number) => padding.left + (index * chartWidth) / Math.max(data.length - 1, 1)
  const y = (value: number) => padding.top + ((100 - value) / 100) * chartHeight

  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik perkembangan siswa selama empat minggu" className="w-full h-auto">
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y(value)}
                y2={y(value)}
                stroke="#E6DDEC"
                strokeDasharray={value === 0 ? undefined : '5 7'}
              />
              <text x={padding.left - 12} y={y(value) + 4} textAnchor="end" className="fill-[#7b7487] text-[11px]">
                {value}
              </text>
            </g>
          ))}

          {data.map((point, index) => (
            <text key={point.label} x={x(index)} y={height - 20} textAnchor="middle" className="fill-[#4a4455] text-[12px] font-semibold">
              {point.label}
            </text>
          ))}

          {series.map((item) => {
            const points = data.map((point, index) => `${x(index)},${y(point[item.key])}`).join(' ')
            return (
              <g key={item.key}>
                <polyline points={points} fill="none" stroke={item.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((point, index) => (
                  <g key={`${item.key}-${point.label}`}>
                    <circle cx={x(index)} cy={y(point[item.key])} r="6" fill="white" stroke={item.color} strokeWidth="3" />
                    <title>{`${item.label} ${point.label}: ${point[item.key]}`}</title>
                  </g>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export function ProgressSparkline({ data, trend }: { data: ProgressPoint[]; trend: 'membaik' | 'stagnan' | 'menurun' }) {
  const values = data.map((point) => Math.round((point.kognitif + point.fokus + point.sosial + point.emosi) / 4))
  const width = 130
  const height = 42
  const min = Math.min(...values) - 5
  const max = Math.max(...values) + 5
  const points = values.map((value, index) => {
    const px = 4 + (index * (width - 8)) / Math.max(values.length - 1, 1)
    const py = height - 4 - ((value - min) / Math.max(max - min, 1)) * (height - 8)
    return `${px},${py}`
  }).join(' ')
  const color = trend === 'membaik' ? '#16825D' : trend === 'menurun' ? '#BA1A1A' : '#8A6D00'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-32 h-10" role="img" aria-label="Preview tren perkembangan">
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.split(' ').map((point, index) => {
        const [cx, cy] = point.split(',')
        return <circle key={index} cx={cx} cy={cy} r="3" fill="white" stroke={color} strokeWidth="2" />
      })}
    </svg>
  )
}

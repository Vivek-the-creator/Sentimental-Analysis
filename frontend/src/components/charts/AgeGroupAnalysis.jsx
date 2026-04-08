import React from 'react'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Neutral: '#f59e0b',
  Negative: '#ef4444',
}

function CustomTreemapNode(props) {
  const {
    depth, x, y, width, height, name, fill,
  } = props

  if (depth === 0) return null

  const showLabel = width > 72 && height > 42
  const title = width > 96 && height > 56

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        ry={10}
        fill={fill}
        fillOpacity={0.88}
        stroke="rgba(15,23,42,0.9)"
        strokeWidth={3}
      />
      {showLabel && (
        <text x={x + 10} y={y + 18} fill="#fff" fontSize={12} fontWeight={700}>
          {name}
        </text>
      )}
      {title && (
        <text x={x + 10} y={y + 35} fill="rgba(255,255,255,0.78)" fontSize={11}>
          Comments
        </text>
      )}
    </g>
  )
}

function AgeTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white shadow-xl">
      <p className="font-semibold">{item.age}</p>
      <p className="text-gray-300">{item.sentiment}: {item.size} comments</p>
    </div>
  )
}

function AgeGroupAnalysis({ data }) {
  const groups = [
    ['18-25', '18_25'],
    ['26-40', '26_40'],
    ['40+', '40_plus'],
    ['Unknown', 'unknown'],
  ]

  const sentiments = ['Positive', 'Neutral', 'Negative']

  const chartData = groups.flatMap(([label, key]) => sentiments.map((sentiment) => ({
    name: `${label} ${sentiment}`,
    age: label,
    sentiment,
    size: data?.[key]?.[sentiment] || 0,
    fill: SENTIMENT_COLORS[sentiment],
  }))).filter((entry) => entry.size > 0)

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-72 text-gray-500 text-sm">No data yet</div>
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={chartData}
          dataKey="size"
          nameKey="name"
          stroke="rgba(255,255,255,0.06)"
          fill="#1d4ed8"
          aspectRatio={4 / 3}
          content={<CustomTreemapNode />}
        >
          <Tooltip content={<AgeTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        {Object.entries(SENTIMENT_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgeGroupAnalysis

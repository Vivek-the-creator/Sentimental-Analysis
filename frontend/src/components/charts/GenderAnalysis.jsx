import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function GenderAnalysis({ data, printMode = false }) {
  const chartData = [
    {
      sentiment: 'Positive',
      Male: data?.male_positive || 0,
      Female: data?.female_positive || 0,
      Other: data?.other_positive || 0,
    },
    {
      sentiment: 'Neutral',
      Male: data?.male_neutral || 0,
      Female: data?.female_neutral || 0,
      Other: data?.other_neutral || 0,
    },
    {
      sentiment: 'Negative',
      Male: data?.male_negative || 0,
      Female: data?.female_negative || 0,
      Other: data?.other_negative || 0,
    },
  ]

  const hasData = chartData.some((entry) => entry.Male || entry.Female || entry.Other)

  if (!hasData) {
    return <div className="flex items-center justify-center h-72 text-gray-500 text-sm">No data yet</div>
  }

  const tickColor = printMode ? '#374151' : '#cbd5e1'
  const gridColor = printMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'
  const tooltipStyle = printMode
    ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111' }
    : { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} outerRadius="68%">
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="sentiment" tick={{ fill: tickColor, fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fill: printMode ? '#6b7280' : '#64748b', fontSize: 11 }} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: printMode ? '#111' : '#fff' }}
          labelStyle={{ color: printMode ? '#111' : '#fff' }}
        />
        <Legend formatter={(value) => <span style={{ color: printMode ? '#374151' : '#9ca3af', fontSize: 12 }}>{value}</span>} />
        <Radar name="Male" dataKey="Male" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.22} strokeWidth={2} />
        <Radar name="Female" dataKey="Female" stroke="#f472b6" fill="#f472b6" fillOpacity={0.22} strokeWidth={2} />
        <Radar name="Other" dataKey="Other" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.22} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default GenderAnalysis

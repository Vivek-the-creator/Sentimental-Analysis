import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function GenderAnalysis({ data }) {
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

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} outerRadius="68%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="sentiment" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
        <Radar name="Male" dataKey="Male" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.22} strokeWidth={2} />
        <Radar name="Female" dataKey="Female" stroke="#f472b6" fill="#f472b6" fillOpacity={0.22} strokeWidth={2} />
        <Radar name="Other" dataKey="Other" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.22} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default GenderAnalysis

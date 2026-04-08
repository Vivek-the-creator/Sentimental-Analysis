import React from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function SentimentBarChart({ data, printMode = false }) {
  const chartData = [
    { name: 'Positive', count: data?.positive || 0, fill: '#10b981' },
    { name: 'Neutral',  count: data?.neutral  || 0, fill: '#f59e0b' },
    { name: 'Negative', count: data?.negative || 0, fill: '#ef4444' },
  ]

  const tickColor = printMode ? '#374151' : '#9ca3af'
  const gridColor = printMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)'
  const tooltipStyle = printMode
    ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111' }
    : { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: printMode ? '#111' : '#fff' }}
          labelStyle={{ color: printMode ? '#111' : '#fff' }}
          cursor={{ fill: printMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }}
          formatter={(v) => [v, 'Comments']}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default SentimentBarChart

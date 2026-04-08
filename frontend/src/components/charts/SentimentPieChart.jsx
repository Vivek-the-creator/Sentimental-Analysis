import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' }

function SentimentPieChart({ data, printMode = false }) {
  const chartData = [
    { name: 'Positive', value: data?.positive || 0 },
    { name: 'Neutral',  value: data?.neutral  || 0 },
    { name: 'Negative', value: data?.negative || 0 },
  ].filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data yet</div>
  }

  const tickColor = printMode ? '#374151' : '#9ca3af'
  const tooltipStyle = printMode
    ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111' }
    : { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: printMode ? '#111' : '#fff' }}
          labelStyle={{ color: printMode ? '#111' : '#fff' }}
          formatter={(v) => [v, 'Comments']}
        />
        <Legend
          formatter={(value) => <span style={{ color: tickColor, fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default SentimentPieChart

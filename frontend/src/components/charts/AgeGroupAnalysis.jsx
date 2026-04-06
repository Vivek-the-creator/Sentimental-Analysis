import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function AgeGroupAnalysis({ data }) {
  const build = (key) => ({
    Positive: data?.[key]?.Positive || 0,
    Neutral:  data?.[key]?.Neutral  || 0,
    Negative: data?.[key]?.Negative || 0,
  })

  const chartData = [
    { age: '18–25', ...build('18_25') },
    { age: '26–40', ...build('26_40') },
    { age: '40+',   ...build('40_plus') },
    { age: 'Unknown',...build('unknown') },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="age" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
        <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Neutral"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AgeGroupAnalysis

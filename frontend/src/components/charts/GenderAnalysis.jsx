import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function GenderAnalysis({ data }) {
  const chartData = [
    {
      gender: 'Male',
      Positive: data?.male_positive || 0,
      Neutral:  data?.male_neutral  || 0,
      Negative: data?.male_negative || 0,
    },
    {
      gender: 'Female',
      Positive: data?.female_positive || 0,
      Neutral:  data?.female_neutral  || 0,
      Negative: data?.female_negative || 0,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="gender" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
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

export default GenderAnalysis

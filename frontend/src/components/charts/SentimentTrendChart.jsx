import React from 'react'
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

function formatTick(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatFullDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SentimentTrendChart({ data }) {
  const chartData = (data || []).map((entry) => ({
    ...entry,
    label: formatTick(entry.date),
  }))

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-72 text-gray-500 text-sm">No comment trend data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 18, left: -20, bottom: 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#fff' }}
          labelFormatter={(value, payload) => formatFullDate(payload?.[0]?.payload?.date || value)}
        />
        <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
        <Line type="linear" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="linear" dataKey="neutral" name="Neutral" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="linear" dataKey="negative" name="Negative" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default SentimentTrendChart

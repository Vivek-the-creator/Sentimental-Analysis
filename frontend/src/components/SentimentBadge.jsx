import React from 'react'

const COLORS = {
  Positive: { dot: 'bg-emerald-400', badge: 'badge-positive', icon: '😊' },
  Neutral:  { dot: 'bg-amber-400',   badge: 'badge-neutral',  icon: '😐' },
  Negative: { dot: 'bg-red-400',     badge: 'badge-negative', icon: '😞' },
}

function SentimentBadge({ sentiment, showIcon = true }) {
  const s = sentiment || 'Neutral'
  const cfg = COLORS[s] || COLORS.Neutral

  return (
    <span className={cfg.badge}>
      {showIcon && <span>{cfg.icon}</span>}
      {s}
    </span>
  )
}

export default SentimentBadge

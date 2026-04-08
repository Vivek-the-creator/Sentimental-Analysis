import React, { useState } from 'react'

const SENTIMENT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16']

function WordCloudChart({ words = [], printMode = false }) {
  const [tooltip, setTooltip] = useState(null)

  if (!words || words.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-sm ${printMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No words to display yet
      </div>
    )
  }

  const maxVal = Math.max(...words.map((w) => w.value))
  const minVal = Math.min(...words.map((w) => w.value))
  const range  = maxVal - minVal || 1

  const fontSize = (val) => {
    const ratio = (val - minVal) / range
    return Math.round(12 + ratio * 28)
  }

  if (printMode) {
    return (
      <div className="flex flex-wrap gap-3 items-center justify-center p-4 min-h-48">
        {words.map((w, i) => (
          <span
            key={w.text}
            className="font-semibold"
            style={{ fontSize: `${fontSize(w.value)}px`, color: SENTIMENT_COLORS[i % SENTIMENT_COLORS.length] }}
          >
            {w.text}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-3 items-center justify-center p-4 min-h-48">
        {words.map((w, i) => (
          <button
            key={w.text}
            onClick={() => setTooltip(tooltip?.text === w.text ? null : w)}
            className="transition-all duration-200 hover:scale-110 font-semibold cursor-pointer rounded-lg px-2 py-1 hover:bg-white/10"
            style={{
              fontSize: `${fontSize(w.value)}px`,
              color: SENTIMENT_COLORS[i % SENTIMENT_COLORS.length],
              opacity: tooltip && tooltip.text !== w.text ? 0.5 : 1,
            }}
          >
            {w.text}
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 mx-auto max-w-xs glass-card p-3 text-center animate-fade-in">
          <p className="font-semibold text-white">"{tooltip.text}"</p>
          <p className="text-sm text-gray-400 mt-1">
            Appeared <span className="text-blue-400 font-bold">{tooltip.value}</span> time{tooltip.value !== 1 ? 's' : ''} in comments
          </p>
        </div>
      )}
    </div>
  )
}

export default WordCloudChart

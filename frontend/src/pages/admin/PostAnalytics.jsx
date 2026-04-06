import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { analyticsAPI, postsAPI } from '../../services/api'
import SentimentPieChart  from '../../components/charts/SentimentPieChart'
import SentimentBarChart  from '../../components/charts/SentimentBarChart'
import GenderAnalysis     from '../../components/charts/GenderAnalysis'
import AgeGroupAnalysis   from '../../components/charts/AgeGroupAnalysis'
import WordCloudChart     from '../../components/charts/WordCloudChart'

function ChartCard({ title, children }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PostAnalytics() {
  const { id } = useParams()
  const [post,      setPost]      = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [words,     setWords]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [postRes, analyticsRes, wordRes] = await Promise.all([
          postsAPI.getById(id),
          analyticsAPI.getAnalytics(id),
          analyticsAPI.getWordCloud(id),
        ])
        setPost(postRes.data)
        setAnalytics(analyticsRes.data)
        setWords(wordRes.data.words || [])
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="glass-card h-72 animate-pulse-slow" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/admin" className="btn-secondary">← Back to Dashboard</Link>
      </div>
    )
  }

  const total = analytics?.total_comments || 0
  const likes = analytics?.total_likes    || 0

  return (
    <main className="page-container animate-fade-in">
      {/* Back */}
      <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Analytics Report</span>
        <h1 className="text-2xl font-extrabold text-white mt-1 line-clamp-2">{post?.title}</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Comments',  value: total, color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-700/20' },
          { label: 'Total Likes',     value: likes, color: 'text-red-400',  bg: 'from-red-600/20  to-red-700/20'  },
          { label: 'Positive',        value: analytics?.sentiment?.positive || 0, color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-700/20' },
          { label: 'Negative',        value: analytics?.sentiment?.negative || 0, color: 'text-red-400',    bg: 'from-red-500/20    to-red-600/20'    },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-5 bg-gradient-to-br ${s.bg}`}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Sentiment Distribution (Pie)">
          <SentimentPieChart data={analytics?.sentiment} />
        </ChartCard>
        <ChartCard title="Sentiment Count (Bar)">
          <SentimentBarChart data={analytics?.sentiment} />
        </ChartCard>
        <ChartCard title="Gender Analysis">
          <GenderAnalysis data={analytics?.gender} />
        </ChartCard>
        <ChartCard title="Age Group Analysis">
          <AgeGroupAnalysis data={analytics?.age_groups} />
        </ChartCard>
      </div>

      {/* Word Cloud */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Word Cloud</h3>
        <p className="text-xs text-gray-600 mb-4">Click any word to see its frequency in comments</p>
        <WordCloudChart words={words} />
      </div>
    </main>
  )
}

export default PostAnalytics

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { analyticsAPI, postsAPI } from '../../services/api'
import SentimentPieChart from '../../components/charts/SentimentPieChart'
import SentimentBarChart from '../../components/charts/SentimentBarChart'
import GenderAnalysis from '../../components/charts/GenderAnalysis'
import AgeGroupAnalysis from '../../components/charts/AgeGroupAnalysis'
import SentimentTrendChart from '../../components/charts/SentimentTrendChart'
import WordCloudChart from '../../components/charts/WordCloudChart'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PostAnalytics() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef(null)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const el = reportRef.current
      el.classList.remove('hidden')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      el.style.top = '0'
      el.style.width = '900px'
      await new Promise((r) => setTimeout(r, 300))
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 900,
      })
      el.classList.add('hidden')
      el.style.position = ''
      el.style.left = ''
      el.style.top = ''
      el.style.width = ''
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width
      let y = 0
      while (y < imgH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -y, pageW, imgH)
        y += pageH
      }
      pdf.save(`analytics-${post?.title?.replace(/\s+/g, '-') || id}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

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
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={`glass-card animate-pulse-slow ${item === 3 ? 'md:col-span-2 h-80' : 'h-72'}`} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/admin" className="btn-secondary">Back to Dashboard</Link>
      </div>
    )
  }

  const total = analytics?.total_comments || 0
  const likes = analytics?.total_likes || 0

  return (
    <main className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="btn-primary"
        >
          {downloading ? (
            <><div className="spinner w-4 h-4" /> Generating…</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg> Download Report</>
          )}
        </button>
      </div>

      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Analytics Report</span>
        <h1 className="text-2xl font-extrabold text-white mt-1 line-clamp-2">{post?.title}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Comments', value: total, color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-700/20' },
          { label: 'Total Likes', value: likes, color: 'text-red-400', bg: 'from-red-600/20 to-red-700/20' },
          { label: 'Positive', value: analytics?.sentiment?.positive || 0, color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-700/20' },
          { label: 'Negative', value: analytics?.sentiment?.negative || 0, color: 'text-red-400', bg: 'from-red-500/20 to-red-600/20' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card p-5 bg-gradient-to-br ${stat.bg}`}>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Sentiment Distribution (Pie)">
          <SentimentPieChart data={analytics?.sentiment} />
        </ChartCard>
        <ChartCard title="Sentiment Count (Bar)">
          <SentimentBarChart data={analytics?.sentiment} />
        </ChartCard>
        <ChartCard title="Comment Trend Over Time" className="md:col-span-2">
          <SentimentTrendChart data={analytics?.comment_trend} />
        </ChartCard>
        <ChartCard title="Gender Analysis (Radar)">
          <GenderAnalysis data={analytics?.gender} />
        </ChartCard>
        <ChartCard title="Age Group Analysis (Treemap)">
          <AgeGroupAnalysis data={analytics?.age_groups} />
        </ChartCard>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Word Cloud</h3>
        <p className="text-xs text-gray-600 mb-4">Click any word to see its frequency in comments</p>
        <WordCloudChart words={words} />
      </div>

      <div ref={reportRef} className="hidden">
        <div className="bg-white p-8 space-y-8">
          <div className="text-center border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Report</h1>
            <h2 className="text-xl text-gray-700 mt-2">{post?.title}</h2>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Sentiment Distribution (Pie Chart)</h3>
            <div className="bg-white">
              <SentimentPieChart data={analytics?.sentiment} printMode />
            </div>
            <div className="mt-3 text-gray-800 space-y-1">
              <p>• Positive: {analytics?.sentiment?.positive || 0}</p>
              <p>• Neutral: {analytics?.sentiment?.neutral || 0}</p>
              <p>• Negative: {analytics?.sentiment?.negative || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Sentiment Count (Bar Chart)</h3>
            <div className="bg-white">
              <SentimentBarChart data={analytics?.sentiment} printMode />
            </div>
            <div className="mt-3 text-gray-800 space-y-1">
              <p>• Positive: {analytics?.sentiment?.positive || 0}</p>
              <p>• Neutral: {analytics?.sentiment?.neutral || 0}</p>
              <p>• Negative: {analytics?.sentiment?.negative || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Comment Trend Over Time</h3>
            <div className="bg-white">
              <SentimentTrendChart data={analytics?.comment_trend} printMode />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Gender Analysis (Radar Chart)</h3>
            <div className="bg-white">
              <GenderAnalysis data={analytics?.gender} printMode />
            </div>
            <div className="mt-3 text-gray-800 space-y-1">
              <p className="font-semibold">Male:</p>
              <p className="ml-4">• Positive: {analytics?.gender?.male_positive || 0}</p>
              <p className="ml-4">• Neutral: {analytics?.gender?.male_neutral || 0}</p>
              <p className="ml-4">• Negative: {analytics?.gender?.male_negative || 0}</p>
              <p className="font-semibold mt-2">Female:</p>
              <p className="ml-4">• Positive: {analytics?.gender?.female_positive || 0}</p>
              <p className="ml-4">• Neutral: {analytics?.gender?.female_neutral || 0}</p>
              <p className="ml-4">• Negative: {analytics?.gender?.female_negative || 0}</p>
              <p className="font-semibold mt-2">Other:</p>
              <p className="ml-4">• Positive: {analytics?.gender?.other_positive || 0}</p>
              <p className="ml-4">• Neutral: {analytics?.gender?.other_neutral || 0}</p>
              <p className="ml-4">• Negative: {analytics?.gender?.other_negative || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Age Group Analysis (Treemap)</h3>
            <div className="bg-white">
              <AgeGroupAnalysis data={analytics?.age_groups} printMode />
            </div>
            <div className="mt-3 text-gray-800 space-y-1">
              {[['18-25', '18_25'], ['26-40', '26_40'], ['40+', '40_plus'], ['Unknown', 'unknown']].map(([label, key]) => (
                <div key={key}>
                  <p className="font-semibold">{label}:</p>
                  <p className="ml-4">• Positive: {analytics?.age_groups?.[key]?.Positive || 0}</p>
                  <p className="ml-4">• Neutral: {analytics?.age_groups?.[key]?.Neutral || 0}</p>
                  <p className="ml-4">• Negative: {analytics?.age_groups?.[key]?.Negative || 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Word Cloud</h3>
            <div className="bg-white">
              <WordCloudChart words={words} printMode />
            </div>
            <div className="mt-3 text-gray-800 space-y-1">
              {words.slice(0, 10).map((w) => (
                <p key={w.text}>• {w.text}: {w.value}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PostAnalytics

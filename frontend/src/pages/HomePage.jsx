import React, { useState } from 'react'
import PostCard from '../components/PostCard'
import { usePosts } from '../hooks/usePosts'

function HomePage() {
  const [page, setPage] = useState(1)
  const { posts, total, pages, loading, error } = usePosts(page)

  return (
    <main className="page-container animate-fade-in">
      {/* Hero */}
      <div className="relative text-center py-16 mb-12 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-transparent rounded-3xl border border-white/8" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-500/15 blur-3xl rounded-full" />
        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/30 mb-4">
            🏛️ AI-Powered E-Consultation Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Government Schemes<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Powered by AI Sentiment
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Explore government schemes, share your feedback, and let AI analyse the pulse of the nation.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Schemes', value: total },
          { label: 'AI-Analysed', value: '100%' },
          { label: 'Real-time', value: '✓' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Latest Schemes</h2>
        <span className="text-sm text-gray-500">{total} scheme{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-72 animate-pulse-slow" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-2">Failed to load schemes</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 glass-card">
          <div className="text-5xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No schemes yet</h3>
          <p className="text-gray-400 text-sm">Government schemes will appear here once added by admins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                p === page ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}

export default HomePage

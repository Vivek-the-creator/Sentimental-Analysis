import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { postsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function AdminDashboard() {
  const { user }  = useAuth()
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [total,    setTotal]    = useState(0)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await postsAPI.getAll(page, 10)
      setPosts(res.data.posts)
      setPages(res.data.pages)
      setTotal(res.data.total)
    } catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [page])

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(postId)
    try {
      await postsAPI.delete(postId)
      fetchPosts()
    } catch (_) { alert('Failed to delete post') }
    finally { setDeleting(null) }
  }

  const date = (dt) => new Date(dt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <main className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Welcome back, {user?.name} 👋</p>
        </div>
        <Link to="/admin/create-post" id="create-post-btn" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Scheme
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Schemes', value: total, icon: '📋', color: 'from-blue-600 to-blue-700' },
          { label: 'AI Powered',    value: '✓',   icon: '🤖', color: 'from-purple-600 to-purple-700' },
          { label: 'Live Sentiments',value: '24/7',icon: '📊', color: 'from-emerald-600 to-emerald-700' },
          { label: 'Platform',      value: 'v1.0', icon: '🚀', color: 'from-amber-600 to-amber-700' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} items-center justify-center text-lg mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Posts Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <h2 className="text-lg font-semibold text-white">All Schemes</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p>No schemes yet.</p>
            <Link to="/admin/create-post" className="btn-primary mt-4 inline-flex">Create First Scheme</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map((post) => (
              <div key={post.post_id} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={post.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{date(post.created_at)}</span>
                    <span>❤️ {post.like_count}</span>
                    <span>💬 {post.comment_count}</span>
                    {post.beneficial_for && <span className="max-w-52 rounded bg-blue-600/20 px-1.5 py-0.5 text-blue-400 line-clamp-2">{post.beneficial_for.split('\n').filter(Boolean).map(l => l.startsWith('- ') ? l.slice(2) : l).join(', ')}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/post/${post.post_id}`}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-all"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/edit-post/${post.post_id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/admin/analytics/${post.post_id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs transition-all"
                  >
                    Analytics
                  </Link>
                  <button
                    onClick={() => handleDelete(post.post_id, post.title)}
                    disabled={deleting === post.post_id}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all disabled:opacity-50"
                  >
                    {deleting === post.post_id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-white/8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminDashboard

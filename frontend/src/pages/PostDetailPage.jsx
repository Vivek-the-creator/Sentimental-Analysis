import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=60'

function PostDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    postsAPI.getById(id)
      .then((res) => setPost(res.data))
      .catch(() => setError('Scheme not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass-card h-64 animate-pulse-slow mb-6 rounded-2xl" />
        <div className="glass-card h-96 animate-pulse-slow rounded-2xl" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="page-container text-center py-24">
        <p className="text-red-400 text-lg mb-4">{error || 'Post not found'}</p>
        <Link to="/" className="btn-secondary">← Back to Home</Link>
      </div>
    )
  }

  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="page-container animate-fade-in max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Schemes
      </button>

      {/* Thumbnail */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-white/8">
        <img
          src={post.thumbnail || PLACEHOLDER}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
        {post.beneficial_for && (
          <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-blue-600/90 text-sm font-semibold text-white backdrop-blur-sm">
            👥 {post.beneficial_for}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
        <span>📅 {date}</span>
        {post.creator_name && <span>· By {post.creator_name}</span>}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Short desc */}
      {post.short_description && (
        <p className="text-lg text-gray-300 leading-relaxed mb-6 border-l-2 border-blue-500 pl-4">
          {post.short_description}
        </p>
      )}

      {/* Detailed desc */}
      {post.detailed_description && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">About this Scheme</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
            {post.detailed_description}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-10 p-4 glass-card">
        <LikeButton postId={post.post_id} initialCount={post.like_count} />
        <button
          onClick={handleShare}
          className="btn-secondary text-sm py-2.5 px-5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        {user?.role === 'admin' && (
          <Link to={`/admin/analytics/${post.post_id}`} className="btn-primary text-sm py-2.5 px-5 ml-auto">
            📊 View Analytics
          </Link>
        )}
      </div>

      {/* Comments */}
      <div className="glass-card p-6">
        <CommentSection postId={post.post_id} />
      </div>
    </article>
  )
}

export default PostDetailPage

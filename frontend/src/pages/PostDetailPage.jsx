import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=60'

function renderInlineFormatting(text, keyPrefix) {
  // Order matters: __ before _ to avoid single-underscore eating double
  const parts = text.split(/(\*\*__.*?__\*\*|__\*\*.*?\*\*__|\*\*_.*?_\*\*|_\*\*.*?\*\*_|\*\*.*?\*\*|__.*?__|_.*?_)/g)

  return parts.filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`

    // Bold + Underline: **__text__** or __**text**__
    if ((part.startsWith('**__') && part.endsWith('__**')) || (part.startsWith('__**') && part.endsWith('**__'))) {
      const inner = part.slice(4, -4)
      return <strong key={key}><u>{inner}</u></strong>
    }
    // Bold + Italic: **_text_** or _**text**_
    if ((part.startsWith('**_') && part.endsWith('_**')) || (part.startsWith('_**') && part.endsWith('**_'))) {
      const inner = part.slice(3, -3)
      return <strong key={key}><em>{inner}</em></strong>
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <u key={key}>{part.slice(2, -2)}</u>
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    return <React.Fragment key={key}>{part}</React.Fragment>
  })
}

function renderDetailedDescription(text) {
  const lines = text.split('\n')
  const blocks = []
  let bulletItems = []

  const flushBullets = () => {
    if (!bulletItems.length) return

    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-5">
        {bulletItems.map((item, index) => (
          <li key={`item-${blocks.length}-${index}`}>{renderInlineFormatting(item, `list-${blocks.length}-${index}`)}</li>
        ))}
      </ul>
    )
    bulletItems = []
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushBullets()
      blocks.push(<div key={`space-${blocks.length}`} className="h-2" />)
      return
    }

    if (trimmed.startsWith('- ')) {
      bulletItems.push(trimmed.slice(2))
      return
    }

    flushBullets()
    blocks.push(
      <p key={`paragraph-${blocks.length}`}>
        {renderInlineFormatting(line, `paragraph-${blocks.length}`)}
      </p>
    )
  })

  flushBullets()

  return blocks
}

function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    )
  }

  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="page-container animate-fade-in max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Schemes
      </button>

      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-white/8">
        <img
          src={post.thumbnail || PLACEHOLDER}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
        {post.beneficial_for && (
          <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] px-3 py-1.5 rounded-xl bg-blue-600/90 text-sm font-semibold text-white backdrop-blur-sm">
            <span className="block mb-0.5">People who benefit:</span>
            <ul className="list-disc pl-4 space-y-0.5 font-normal">
              {post.beneficial_for.split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line.startsWith('- ') ? line.slice(2) : line}</li>
              ))}
            </ul>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
        <span>{date}</span>
        {post.creator_name && <span>By {post.creator_name}</span>}
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
        {post.title}
      </h1>

      {post.short_description && (
        <p className="text-lg text-gray-300 leading-relaxed mb-6 border-l-2 border-blue-500 pl-4">
          {post.short_description}
        </p>
      )}

      {post.detailed_description && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">About this Scheme</h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-300">
            {renderDetailedDescription(post.detailed_description)}
          </div>
        </div>
      )}

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
          <div className="flex gap-2 ml-auto">
            <Link to={`/admin/edit-post/${post.post_id}`} className="btn-secondary text-sm py-2.5 px-5">
              Edit Scheme
            </Link>
            <Link to={`/admin/analytics/${post.post_id}`} className="btn-primary text-sm py-2.5 px-5">
              View Analytics
            </Link>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <CommentSection postId={post.post_id} />
      </div>
    </article>
  )
}

export default PostDetailPage

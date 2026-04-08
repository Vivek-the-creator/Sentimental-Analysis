import React from 'react'
import { Link } from 'react-router-dom'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60'

function PostCard({ post }) {
  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link
      to={`/post/${post.post_id}`}
      id={`post-card-${post.post_id}`}
      className="glass-card group block overflow-hidden animate-fade-in"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.thumbnail || PLACEHOLDER}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        {post.beneficial_for && (
          <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] whitespace-pre-line px-2.5 py-1 rounded-lg bg-blue-600/80 text-xs font-semibold text-white backdrop-blur-sm line-clamp-3">
            {post.beneficial_for}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-white text-lg leading-snug mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {post.short_description || 'Click to read more about this government scheme.'}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
          <span>{date}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PostCard

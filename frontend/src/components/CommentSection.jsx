import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { commentsAPI } from '../services/api'
import SentimentBadge from './SentimentBadge'
import { useNavigate } from 'react-router-dom'

function CommentSection({ postId }) {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [comments,  setComments]  = useState([])
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitting,setSubmitting]= useState(false)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [error,     setError]     = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText,  setEditText]  = useState('')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await commentsAPI.getByPost(postId, page)
      setComments(res.data.comments)
      setPages(res.data.pages)
    } catch (_) {}
    finally { setLoading(false) }
  }, [postId, page])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await commentsAPI.create({ post_id: postId, comment_text: text.trim() })
      setText('')
      setPage(1)
      fetchComments()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (comment) => {
    setEditingId(comment.comment_id)
    setEditText(comment.comment_text)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return
    try {
      const res = await commentsAPI.update(commentId, { comment_text: editText.trim() })
      setComments(comments.map(c => 
        c.comment_id === commentId 
          ? { ...c, comment_text: res.data.comment_text, sentiment: res.data.sentiment }
          : c
      ))
      setEditingId(null)
      setEditText('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update comment')
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await commentsAPI.delete(commentId)
      setComments(comments.filter(c => c.comment_id !== commentId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete comment')
    }
  }

  const timeAgo = (dt) => {
    const diff = Date.now() - new Date(dt).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'Just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">
        Comments <span className="text-gray-500 font-normal text-base">{comments.length > 0 ? `(${comments.length})` : ''}</span>
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3">
        <textarea
          id="comment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Share your thoughts on this scheme…' : 'Sign in to leave a comment'}
          disabled={!user || submitting}
          rows={3}
          className="input-field resize-none text-sm"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            ✨ Your comment will be automatically analysed by our AI
          </p>
          <button
            id="submit-comment-btn"
            type="submit"
            disabled={!user || submitting || !text.trim()}
            className="btn-primary text-sm py-2 px-5"
          >
            {submitting ? (
              <span className="flex items-center gap-2"><span className="spinner w-3 h-3" /> Analysing…</span>
            ) : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="spinner w-8 h-8" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.comment_id} className="glass-card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.user_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SentimentBadge sentiment={c.sentiment} />
                  {user && user.user_id === c.user_id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(c.comment_id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {editingId === c.comment_id ? (
                <div className="mt-3 pl-10 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="input-field resize-none text-sm w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(c.comment_id)}
                      className="btn-primary text-xs py-1.5 px-4"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-secondary text-xs py-1.5 px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-300 leading-relaxed pl-10">{c.comment_text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                p === page ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection

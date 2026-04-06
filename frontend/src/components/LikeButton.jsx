import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { likesAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

function LikeButton({ postId, initialCount = 0 }) {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [liked,    setLiked]    = useState(false)
  const [count,    setCount]    = useState(initialCount)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (!user) return
    likesAPI.checkStatus(postId)
      .then((res) => setLiked(res.data.liked))
      .catch(() => {})
  }, [postId, user])

  const handleToggle = async () => {
    if (!user) { navigate('/login'); return }
    if (loading) return
    setLoading(true)
    try {
      const res = await likesAPI.toggle(postId)
      setLiked(res.data.liked)
      setCount((c) => res.data.liked ? c + 1 : Math.max(0, c - 1))
    } catch (_) {}
    finally { setLoading(false) }
  }

  return (
    <button
      id={`like-btn-${postId}`}
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border
        ${liked
          ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
        }`}
    >
      <svg
        className={`w-5 h-5 transition-transform ${liked ? 'scale-110' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count}</span>
    </button>
  )
}

export default LikeButton

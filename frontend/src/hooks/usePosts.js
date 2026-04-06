import { useState, useEffect, useCallback } from 'react'
import { postsAPI } from '../services/api'

export function usePosts(page = 1) {
  const [posts,   setPosts]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await postsAPI.getAll(page)
      setPosts(res.data.posts)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return { posts, total, pages, loading, error, refetch: fetchPosts }
}

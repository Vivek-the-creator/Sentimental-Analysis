import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gs_token')
      localStorage.removeItem('gs_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register:      (data) => api.post('/api/register', data),
  adminRegister: (data) => api.post('/api/admin/register', data),
  login:         (data) => api.post('/api/login', data),
}

export const postsAPI = {
  getAll:  (page = 1, limit = 9) => api.get(`/api/posts?page=${page}&limit=${limit}`),
  getMine: (page = 1, limit = 10) => api.get(`/api/posts/mine?page=${page}&limit=${limit}`),
  getById: (id)                   => api.get(`/api/posts/${id}`),
  create:  (data)                 => api.post('/api/posts', data),
  update:  (id, data)             => api.put(`/api/posts/${id}`, data),
  delete:  (id)                   => api.delete(`/api/posts/${id}`),
}

export const commentsAPI = {
  getByPost: (postId, page = 1) => api.get(`/api/comments/${postId}?page=${page}&limit=20`),
  create:    (data)             => api.post('/api/comments', data),
  update:    (id, data)         => api.put(`/api/comments/${id}`, data),
  delete:    (id)               => api.delete(`/api/comments/${id}`),
}

export const likesAPI = {
  toggle:      (postId) => api.post('/api/like', { post_id: postId }),
  checkStatus: (postId) => api.get(`/api/like/${postId}/status`),
}

export const analyticsAPI = {
  getAnalytics: (postId) => api.get(`/api/analytics/${postId}`),
  getWordCloud: (postId) => api.get(`/api/wordcloud/${postId}`),
}

export const mlAPI = {
  predict: (text) => api.post('/api/predict', { text }),
}

export { API_URL }
export default api

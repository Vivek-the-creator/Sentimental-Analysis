import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { postsAPI } from '../../services/api'

function CreatePost() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    thumbnail: '',
    beneficial_for: '',
    short_description: '',
    detailed_description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await postsAPI.create(form)
      setSuccess(true)
      setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create scheme post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-container animate-fade-in max-w-3xl">
      {/* Back */}
      <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Create New Scheme</h1>
        <p className="text-gray-400 mt-1 text-sm">Fill in the details below to publish a government scheme post</p>
      </div>

      <div className="glass-card p-8">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Scheme Published!</h3>
            <p className="text-gray-400 text-sm">Redirecting to dashboard…</p>
          </div>
        ) : (
          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="input-label">Scheme Title *</label>
              <input
                id="post-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. PM Kisan Samman Nidhi Yojana"
                className="input-field"
              />
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="input-label">Thumbnail Image URL</label>
              <input
                id="post-thumbnail"
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {form.thumbnail && (
                <div className="mt-2 h-32 rounded-xl overflow-hidden border border-white/10">
                  <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}} />
                </div>
              )}
            </div>

            {/* Beneficial For */}
            <div>
              <label className="input-label">Beneficial For</label>
              <input
                id="post-beneficial"
                name="beneficial_for"
                value={form.beneficial_for}
                onChange={handleChange}
                placeholder="e.g. Farmers, Youth, Women, Senior Citizens"
                className="input-field"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="input-label">Short Description</label>
              <textarea
                id="post-short-desc"
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief summary shown on the scheme card (1–2 sentences)"
                className="input-field resize-none"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="input-label">Detailed Description</label>
              <textarea
                id="post-detailed-desc"
                name="detailed_description"
                value={form.detailed_description}
                onChange={handleChange}
                rows={8}
                placeholder="Full details of the scheme — eligibility, benefits, how to apply, etc."
                className="input-field resize-y"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link to="/admin" className="btn-secondary flex-1 justify-center">Cancel</Link>
              <button
                id="publish-post-btn"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? <><span className="spinner w-4 h-4" /> Publishing…</> : '🚀 Publish Scheme'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default CreatePost

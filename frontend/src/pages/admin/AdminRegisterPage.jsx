import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function AdminRegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', gender: '', age: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name:     form.name,
        email:    form.email,
        password: form.password,
        gender:   form.gender || null,
        age:      form.age ? parseInt(form.age) : null,
      }
      // Call admin registration API
      await authAPI.adminRegister(payload)
      // Auto-login after register
      const res = await authAPI.login({ email: form.email, password: form.password })
      login(res.data.access_token, res.data.user)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.detail || 'Admin Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Registration</h1>
          <p className="text-gray-400 mt-1 text-sm">Create an administrator account</p>
        </div>

        <div className="glass-card p-8 border-purple-500/10 shadow-[0_8px_32px_0_rgba(147,51,234,0.1)]">
          <form id="admin-register-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input id="admin-reg-name" type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Admin Name" required className="input-field" />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input id="admin-reg-email" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="admin@example.com" required className="input-field" />
            </div>
            <div>
              <label className="input-label">Password *</label>
              <input id="admin-reg-password" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Gender</label>
                <select id="admin-reg-gender" name="gender" value={form.gender}
                  onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="input-label">Age</label>
                <input id="admin-reg-age" type="number" name="age" value={form.age}
                  onChange={handleChange} placeholder="35" min={18} max={120} className="input-field" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button id="admin-register-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-purple-500/20">
              {loading ? <><span className="spinner w-4 h-4" /> Creating profile…</> : 'Register Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-gray-400 text-sm">
              Citizen Registration?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Citizen Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRegisterPage

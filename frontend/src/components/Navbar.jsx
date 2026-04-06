import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent group-hover:to-blue-200 transition-all">
              GovSentinel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[{ path: '/', label: 'Home' }].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 bg-gray-950/95 px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm">Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm">Dashboard</Link>
          )}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm">Sign Out</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-blue-400 hover:bg-blue-500/10 text-sm">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar

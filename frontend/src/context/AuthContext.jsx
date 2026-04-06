import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const t = localStorage.getItem('gs_token')
      const u = localStorage.getItem('gs_user')
      if (t && u) {
        setToken(t)
        setUser(JSON.parse(u))
      }
    } catch (_) {}
    setLoading(false)
  }, [])

  const login = (tokenData, userData) => {
    setToken(tokenData)
    setUser(userData)
    localStorage.setItem('gs_token', tokenData)
    localStorage.setItem('gs_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('gs_token')
    localStorage.removeItem('gs_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

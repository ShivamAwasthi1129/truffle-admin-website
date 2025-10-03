"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLE_PERMISSIONS } from './schemas/user.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token and user data
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      verifyToken(storedToken)
    } else if (storedRefreshToken) {
      // Try to refresh the token
      refreshToken(storedRefreshToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(tokenToVerify)
      } else if (response.status === 503) {
        // Database connection timeout - keep user logged in with cached data
        console.warn('Database connection timeout, using cached user data')
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setToken(tokenToVerify)
        } else {
          logout()
        }
      } else {
        // Token is invalid, try to refresh
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (storedRefreshToken) {
          await refreshToken(storedRefreshToken)
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async (refreshTokenValue) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      } else if (response.status === 503) {
        // Database connection timeout - keep user logged in with cached data
        console.warn('Database connection timeout during refresh, using cached user data')
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
        } else {
          logout()
        }
      } else {
        // Refresh failed, logout
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, userType = 'admin') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const hasPermission = (moduleName) => {
    if (!user) return false
    
    // Use user's actual permissions array if available, otherwise fall back to role-based permissions
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(moduleName)
    }
    
    // Fallback to role-based permissions for backward compatibility
    const permissions = ROLE_PERMISSIONS[user.role] || []
    return permissions.includes(moduleName)
  }

  const isAuthenticated = () => {
    return !!user && !!token
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

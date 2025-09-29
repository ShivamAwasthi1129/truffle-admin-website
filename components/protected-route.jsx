"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context.jsx'

export function ProtectedRoute({ children, requiredPermission = null }) {
  const { user, loading, hasPermission, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        // Instead of redirecting to unauthorized, redirect to the first available module
        const availableModules = [
          'inventory', 'vendors', 'clients', 'concierges', 'bookings',
          'service-commissions', 'concierge-commissions', 'user-registration', 'users', 'analytics'
        ]
        
        const firstAvailableModule = availableModules.find(module => hasPermission(module))
        if (firstAvailableModule) {
          router.push(`/?module=${firstAvailableModule}`)
        } else {
          router.push('/unauthorized')
        }
        return
      }
    }
  }, [user, loading, requiredPermission, hasPermission, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null
  }

  return children
}

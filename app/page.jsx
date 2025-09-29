"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar.jsx"
import InventoryModule from "@/components/modules/inventory-module.jsx"
import { VendorModule } from "@/components/modules/vendor-module.jsx"
import { ClientModule } from "@/components/modules/client-module.jsx"
import { ConciergeModule } from "@/components/modules/concierge-module.jsx"
import { BookingModule } from "@/components/modules/booking-module.jsx"
import { UserModule } from "@/components/modules/user-module.jsx"
import { UserRegistrationModule } from "@/components/modules/user-registration-module.jsx"
import AnalyticsModule from "@/components/modules/analytics-module.jsx"
import { ServiceCommissionModule } from "@/components/modules/service-commission-module.jsx"
import { ConciergeCommissionModule } from "@/components/modules/concierge-commission-module.jsx"
import { ProtectedRoute } from "@/components/protected-route.jsx"
import { useAuth } from "@/lib/auth-context.jsx"

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("inventory")
  const { user, hasPermission } = useAuth()
  const searchParams = useSearchParams()

  // Set default module based on user permissions or URL parameter
  useEffect(() => {
    if (user && user.permissions) {
      const availableModules = [
        'inventory', 'vendors', 'clients', 'concierges', 'bookings',
        'service-commissions', 'concierge-commissions', 'user-registration', 'users', 'analytics'
      ]
      
      // Check if there's a module parameter in the URL
      const urlModule = searchParams.get('module')
      if (urlModule && hasPermission(urlModule)) {
        setActiveModule(urlModule)
        return
      }
      
      // Otherwise, set the first available module
      const firstAvailableModule = availableModules.find(module => hasPermission(module))
      if (firstAvailableModule) {
        setActiveModule(firstAvailableModule)
      }
    }
  }, [user, hasPermission, searchParams])

  const renderModule = () => {
    switch (activeModule) {
      case "inventory":
        return <ProtectedRoute requiredPermission="inventory"><InventoryModule /></ProtectedRoute>
      case "vendors":
        return <ProtectedRoute requiredPermission="vendors"><VendorModule /></ProtectedRoute>
      case "clients":
        return <ProtectedRoute requiredPermission="clients"><ClientModule /></ProtectedRoute>
      case "concierges":
        return <ProtectedRoute requiredPermission="concierges"><ConciergeModule /></ProtectedRoute>
      case "bookings":
        return <ProtectedRoute requiredPermission="bookings"><BookingModule /></ProtectedRoute>
      case "service-commissions":
        return <ProtectedRoute requiredPermission="service-commissions"><ServiceCommissionModule /></ProtectedRoute>
      case "concierge-commissions":
        return <ProtectedRoute requiredPermission="concierge-commissions"><ConciergeCommissionModule /></ProtectedRoute>
      case "user-registration":
        return <ProtectedRoute requiredPermission="user-registration"><UserRegistrationModule /></ProtectedRoute>
      case "users":
        return <ProtectedRoute requiredPermission="users"><UserModule /></ProtectedRoute>
      case "analytics":
        return <ProtectedRoute requiredPermission="analytics"><AnalyticsModule /></ProtectedRoute>
      default:
        return <ProtectedRoute requiredPermission="inventory"><InventoryModule /></ProtectedRoute>
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{renderModule()}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

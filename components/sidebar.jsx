"use client"

import { useState } from "react"
import { cn } from "@/lib/utils.js"
import { Button } from "@/components/ui/button.jsx"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { useAuth } from "@/lib/auth-context.jsx"
import {
  Package,
  Building2,
  Users,
  UserCheck,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Percent,
  LogOut,
  User as UserIcon,
  UserPlus,
} from "lucide-react"

const allModules = [
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "vendors", label: "Vendor Management", icon: Building2 },
  { id: "clients", label: "Client Management", icon: Users },
  { id: "concierges", label: "Concierge Team", icon: UserCheck },
  { id: "bookings", label: "Booking Management", icon: Calendar },
  { id: "service-commissions", label: "Service Commissions", icon: Percent },
  { id: "concierge-commissions", label: "Concierge Commissions", icon: DollarSign },
  { id: "user-registration", label: "User Registration", icon: UserPlus },
  { id: "users", label: "User Management", icon: Settings },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
]

export function Sidebar({ activeModule, onModuleChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, hasPermission, logout } = useAuth()

  // Filter modules based on user permissions
  const availableModules = allModules.filter(module => hasPermission(module.id))

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout()
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Trufle Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {availableModules.map((module) => {
            const Icon = module.icon
            const isActive = activeModule === module.id

            return (
              <Button
                key={module.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  collapsed ? "px-2" : "px-3",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => onModuleChange(module.id)}
              >
                <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{module.label}</span>}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60 mb-2">
            Trufle Operations Panel v1.0
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}

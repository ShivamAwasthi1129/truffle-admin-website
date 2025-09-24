"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Settings } from "lucide-react"

export function UserModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground">Manage system users and their permissions</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>User Administration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>User management module is under development</p>
            <p className="text-sm">This module will include user creation, role management, and access control</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Percent } from "lucide-react"

export function ServiceCommissionModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Service Commissions
        </h1>
        <p className="text-muted-foreground">Manage service provider commissions and payments</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Commission Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Service commission module is under development</p>
            <p className="text-sm">This module will include commission tracking, payments, and vendor settlements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
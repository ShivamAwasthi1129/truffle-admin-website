"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { BarChart3 } from "lucide-react"

export default function AnalyticsModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">View business insights and performance metrics</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Business Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Analytics module is under development</p>
            <p className="text-sm">This module will include revenue tracking, performance metrics, and business insights</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
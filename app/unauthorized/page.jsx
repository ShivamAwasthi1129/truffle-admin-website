"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl text-white">Access Denied</CardTitle>
          <p className="text-gray-400">You don't have permission to access this resource</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-300">
            <p>Your current role doesn't have access to this module.</p>
            <p>Please contact your administrator if you believe this is an error.</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

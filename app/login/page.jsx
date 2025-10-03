"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx"
import { Eye, EyeOff, Lock, Mail, User, Key } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordRequest, setShowPasswordRequest] = useState(false)
  const [passwordRequestEmail, setPasswordRequestEmail] = useState("")
  const [passwordRequestLoading, setPasswordRequestLoading] = useState(false)
  const [passwordRequestMessage, setPasswordRequestMessage] = useState("")
  const { login, user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      router.push('/')
    }
  }, [user, isAuthenticated, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        // Redirect to dashboard
        router.push('/')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordRequest = async (e) => {
    e.preventDefault()
    setPasswordRequestLoading(true)
    setPasswordRequestMessage("")

    try {
      const response = await fetch('/api/auth/password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: passwordRequestEmail
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordRequestMessage("Password request sent successfully! An admin will review your request and change your password if approved.")
        setPasswordRequestEmail("")
        setTimeout(() => {
          setShowPasswordRequest(false)
          setPasswordRequestMessage("")
        }, 3000)
      } else {
        setPasswordRequestMessage(data.error || 'Failed to send password request')
      }
    } catch (error) {
      setPasswordRequestMessage('Network error. Please try again.')
    } finally {
      setPasswordRequestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Trufle Admin</h1>
          <p className="text-gray-300">Luxury Concierge Operations Panel</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Sign In</CardTitle>
            <p className="text-center text-gray-400">Access your admin dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-gray-400 hover:text-white text-sm"
                  onClick={() => setShowPasswordRequest(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Request Password Change
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-center text-sm text-gray-400">
                <p className="mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Super Admin:</strong> superadmin@trufle.com / SuperAdmin123!</p>
                  <p><strong>Admin:</strong> admin@trufle.com / Admin123!</p>
                  <p><strong>Billing:</strong> billing@trufle.com / Billing123!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Request Dialog */}
        <Dialog open={showPasswordRequest} onOpenChange={setShowPasswordRequest}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Request Password Change</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your email address to request a password change. An admin will review your request and change your password if approved.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handlePasswordRequest} className="space-y-4">
              {passwordRequestMessage && (
                <Alert className={passwordRequestMessage.includes('successfully') ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
                  <AlertDescription className={passwordRequestMessage.includes('successfully') ? "text-green-400" : "text-red-400"}>
                    {passwordRequestMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="request-email" className="text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="request-email"
                    type="email"
                    value={passwordRequestEmail}
                    onChange={(e) => setPasswordRequestEmail(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  onClick={() => setShowPasswordRequest(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={passwordRequestLoading}
                >
                  {passwordRequestLoading ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

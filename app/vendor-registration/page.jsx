"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { CheckCircle, AlertCircle } from "lucide-react"
import { VendorForm } from "../vendors/vendor-form.jsx"

export function VendorRegistrationPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSuccess = () => {
    setIsSuccess(true)
    setError(null)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setIsSuccess(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-400 mb-6">
              Your vendor registration has been submitted successfully. 
              Our team will review your application and contact you within 2-3 business days.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• You will receive an email confirmation shortly</p>
              <p>• Check your email for updates on your application status</p>
              <p>• You can contact support if you have any questions</p>
            </div>
            <Button 
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={() => {
                setIsSuccess(false)
                window.location.reload()
              }}
            >
              Register Another Vendor
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Vendor Registration</h1>
            <p className="text-gray-400 text-lg">
              Join our exclusive network of luxury service providers
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Please provide accurate information to ensure a smooth verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorForm
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={() => window.history.back()}
              />
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Join Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Access to high-end clientele</li>
                  <li>• Streamlined booking process</li>
                  <li>• Marketing support and exposure</li>
                  <li>• Competitive commission rates</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Document verification (2-3 days)</li>
                  <li>• Background checks</li>
                  <li>• Service quality assessment</li>
                  <li>• Insurance verification</li>
                  <li>• Final approval notification</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Email: vendors@luxuryplatform.com</li>
                  <li>• Phone: +1 (555) 123-4567</li>
                  <li>• Live chat available</li>
                  <li>• FAQ and documentation</li>
                  <li>• Dedicated account manager</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

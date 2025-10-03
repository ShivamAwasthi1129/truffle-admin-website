"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Edit,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Star,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react"

export function VendorDetails({ vendor, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("overview")

  const getVerificationBadge = (status) => {
    const variants = {
      verified: "default",
      pending: "secondary",
      rejected: "destructive",
      suspended: "outline"
    }

    const icons = {
      verified: <CheckCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
      suspended: <AlertTriangle className="h-3 w-3" />
    }

    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getAccountStatusBadge = (status) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive"
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const serviceCategories = [
    { value: "private_jets", label: "Private Jets" },
    { value: "charter_flights", label: "Charter Flights" },
    { value: "yachts", label: "Yachts" },
    { value: "luxury_cars", label: "Luxury Cars" },
    { value: "super_cars", label: "Super Cars" },
    { value: "helicopters", label: "Helicopters" }
  ]

  const experienceLevels = {
    beginner: "Beginner",
    intermediate: "Intermediate", 
    advanced: "Advanced",
    expert: "Expert"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            {vendor.firstName} {vendor.lastName}
          </h2>
          <p className="text-gray-400">{vendor.businessName}</p>
          <div className="flex items-center gap-2 mt-2">
            {getVerificationBadge(vendor.verificationStatus)}
            {getAccountStatusBadge(vendor.accountStatus)}
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {vendor.address?.street}, {vendor.address?.city}, {vendor.address?.state} {vendor.address?.zipCode}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{vendor.address?.country}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Created:</span>
                  <p>{formatDate(vendor.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Last Updated:</span>
                  <p>{formatDate(vendor.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Last Login:</span>
                  <p>{formatDate(vendor.lastLoginAt)}</p>
                </div>
                {vendor.verifiedAt && (
                  <div>
                    <span className="text-sm text-gray-400">Verified:</span>
                    <p>{formatDate(vendor.verifiedAt)}</p>
                  </div>
                )}
                {vendor.verifiedBy && (
                  <div>
                    <span className="text-sm text-gray-400">Verified By:</span>
                    <p>{vendor.verifiedBy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Notes */}
          {vendor.verificationNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{vendor.verificationNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vendor.notificationPreferences?.email ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>Email Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vendor.notificationPreferences?.sms ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>SMS Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vendor.notificationPreferences?.push ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>Push Notifications</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Business Name:</span>
                  <p className="font-medium">{vendor.businessName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Business Type:</span>
                  <p className="capitalize">{vendor.businessType}</p>
                </div>
                {vendor.businessRegistrationNumber && (
                  <div>
                    <span className="text-sm text-gray-400">Registration Number:</span>
                    <p>{vendor.businessRegistrationNumber}</p>
                  </div>
                )}
                {vendor.taxId && (
                  <div>
                    <span className="text-sm text-gray-400">Tax ID:</span>
                    <p>{vendor.taxId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Street:</span>
                  <p>{vendor.address?.street}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">City:</span>
                  <p>{vendor.address?.city}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">State/Province:</span>
                  <p>{vendor.address?.state}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">ZIP/Postal Code:</span>
                  <p>{vendor.address?.zipCode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Country:</span>
                  <p>{vendor.address?.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vendor.adminPanelAccess ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>Admin Panel Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vendor.receiveUpdates ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>Receive Updates</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {vendor.serviceCategories && vendor.serviceCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.serviceCategories.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service.description && (
                      <div>
                        <span className="text-sm text-gray-400">Description:</span>
                        <p>{service.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-400">Experience Level:</span>
                      <p className="capitalize">{experienceLevels[service.experience] || service.experience}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Years of Experience:</span>
                      <p>{service.yearsOfExperience} years</p>
                    </div>
                    {service.certifications && service.certifications.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-400">Certifications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.certifications.map((cert, certIndex) => (
                            <Badge key={certIndex} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-400">No service categories configured</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Listings</p>
                    <p className="text-2xl font-bold">{vendor.stats?.totalListings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold">{vendor.stats?.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold">${vendor.stats?.totalRevenue || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Star className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Rating</p>
                    <p className="text-2xl font-bold">{vendor.stats?.rating || 0}</p>
                    <p className="text-xs text-gray-400">({vendor.stats?.reviewCount || 0} reviews)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Revenue and booking trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-800/30 rounded-lg">
                <p className="text-gray-400">Performance chart would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

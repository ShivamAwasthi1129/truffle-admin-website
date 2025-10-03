"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Checkbox } from "@/components/ui/checkbox.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"

export function VendorForm({ vendor, isEditMode, onSuccess, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "company",
    businessRegistrationNumber: "",
    taxId: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    serviceCategories: [],
    verificationStatus: "pending",
    verificationNotes: "",
    accountStatus: "active",
    adminPanelAccess: false,
    receiveUpdates: true,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const businessTypes = [
    { value: "company", label: "Company" },
    { value: "individual", label: "Individual" },
    { value: "partnership", label: "Partnership" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" }
  ]

  const serviceCategories = [
    { value: "private_jets", label: "Private Jets" },
    { value: "charter_flights", label: "Charter Flights" },
    { value: "yachts", label: "Yachts" },
    { value: "luxury_cars", label: "Luxury Cars" },
    { value: "super_cars", label: "Super Cars" },
    { value: "helicopters", label: "Helicopters" }
  ]

  const countries = [
    "United States", "United Kingdom", "UAE", "France", "Switzerland", 
    "India", "Singapore", "Japan", "Australia", "Canada", "Germany", "Italy"
  ]

  const experienceLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" }
  ]

  useEffect(() => {
    if (vendor && isEditMode) {
      setFormData({
        firstName: vendor.firstName || "",
        lastName: vendor.lastName || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        businessName: vendor.businessName || "",
        businessType: vendor.businessType || "company",
        businessRegistrationNumber: vendor.businessRegistrationNumber || "",
        taxId: vendor.taxId || "",
        address: {
          street: vendor.address?.street || "",
          city: vendor.address?.city || "",
          state: vendor.address?.state || "",
          country: vendor.address?.country || "",
          zipCode: vendor.address?.zipCode || ""
        },
        serviceCategories: vendor.serviceCategories || [],
        verificationStatus: vendor.verificationStatus || "pending",
        verificationNotes: vendor.verificationNotes || "",
        accountStatus: vendor.accountStatus || "active",
        adminPanelAccess: vendor.adminPanelAccess || false,
        receiveUpdates: vendor.receiveUpdates || true,
        notificationPreferences: {
          email: vendor.notificationPreferences?.email || true,
          sms: vendor.notificationPreferences?.sms || false,
          push: vendor.notificationPreferences?.push || true
        }
      })
    }
  }, [vendor, isEditMode])

  const validateForm = () => {
    const newErrors = {}

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required"
    }

    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required"
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.address.country.trim()) {
      newErrors.country = "Country is required"
    }

    if (formData.serviceCategories.length === 0) {
      newErrors.serviceCategories = "Please select at least one service category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEditMode ? `/api/vendors/${vendor._id}` : "/api/vendors"
      const method = isEditMode ? "PUT" : "POST"

      // Remove empty password for updates
      const submitData = { ...formData }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        if (isEditMode) {
          onUpdate()
        } else {
          onSuccess()
        }
      } else {
        console.error("Error:", data.error)
        setErrors({ submit: data.error })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ submit: "Failed to submit form" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleServiceCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter(c => c !== category)
        : [...prev.serviceCategories, category]
    }))
    
    if (errors.serviceCategories) {
      setErrors(prev => ({ ...prev, serviceCategories: null }))
    }
  }

  const addServiceCategory = (category) => {
    const newServiceCategory = {
      category,
      description: "",
      experience: "beginner",
      yearsOfExperience: 0,
      certifications: []
    }

    setFormData(prev => ({
      ...prev,
      serviceCategories: [...prev.serviceCategories, newServiceCategory]
    }))
  }

  const updateServiceCategory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const removeServiceCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before submitting:
            <ul className="mt-2 list-disc list-inside">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="Enter first name"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Enter last name"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Business details and registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.businessName ? 'border-red-500' : ''}`}
                    placeholder="Enter business name"
                    disabled={isSubmitting}
                  />
                  {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => handleInputChange('businessType', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
                  <Input
                    id="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                    className="bg-gray-800/50 border-gray-700"
                    placeholder="Enter registration number"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="bg-gray-800/50 border-gray-700"
                    placeholder="Enter tax ID"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className={`bg-gray-800/50 border-gray-700 ${errors.street ? 'border-red-500' : ''}`}
                  placeholder="Enter street address"
                  disabled={isSubmitting}
                />
                {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className={`bg-gray-800/50 border-gray-700 ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Enter city"
                    disabled={isSubmitting}
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="bg-gray-800/50 border-gray-700"
                    placeholder="Enter state/province"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select 
                    value={formData.address.country} 
                    onValueChange={(value) => handleInputChange('address.country', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`bg-gray-800/50 border-gray-700 ${errors.country ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    className="bg-gray-800/50 border-gray-700"
                    placeholder="Enter ZIP/postal code"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Select and configure service categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Available Service Categories *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 p-4 border border-gray-700 rounded-md bg-gray-800/30">
                  {serviceCategories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.value}
                        checked={formData.serviceCategories.some(sc => sc.category === category.value)}
                        onCheckedChange={() => {
                          if (formData.serviceCategories.some(sc => sc.category === category.value)) {
                            setFormData(prev => ({
                              ...prev,
                              serviceCategories: prev.serviceCategories.filter(sc => sc.category !== category.value)
                            }))
                          } else {
                            addServiceCategory(category.value)
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={category.value} className="text-sm cursor-pointer">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.serviceCategories && <p className="text-red-400 text-sm mt-1">{errors.serviceCategories}</p>}
              </div>

              {formData.serviceCategories.length > 0 && (
                <div className="space-y-4">
                  <Label>Service Category Details</Label>
                  {formData.serviceCategories.map((service, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">
                          {serviceCategories.find(cat => cat.value === service.category)?.label}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceCategory(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={service.description}
                            onChange={(e) => updateServiceCategory(index, 'description', e.target.value)}
                            className="bg-gray-800/50 border-gray-700"
                            placeholder="Describe your experience in this category"
                            rows={2}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label>Experience Level</Label>
                          <Select 
                            value={service.experience} 
                            onValueChange={(value) => updateServiceCategory(index, 'experience', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {experienceLevels.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          min="0"
                          value={service.yearsOfExperience}
                          onChange={(e) => updateServiceCategory(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                          className="bg-gray-800/50 border-gray-700"
                          placeholder="0"
                          disabled={isSubmitting}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Verification and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="verificationStatus">Verification Status</Label>
                  <Select 
                    value={formData.verificationStatus} 
                    onValueChange={(value) => handleInputChange('verificationStatus', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountStatus">Account Status</Label>
                  <Select 
                    value={formData.accountStatus} 
                    onValueChange={(value) => handleInputChange('accountStatus', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="verificationNotes">Verification Notes</Label>
                <Textarea
                  id="verificationNotes"
                  value={formData.verificationNotes}
                  onChange={(e) => handleInputChange('verificationNotes', e.target.value)}
                  className="bg-gray-800/50 border-gray-700"
                  placeholder="Add verification notes or comments"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adminPanelAccess"
                    checked={formData.adminPanelAccess}
                    onCheckedChange={(checked) => handleInputChange('adminPanelAccess', checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="adminPanelAccess">Admin Panel Access</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onCheckedChange={(checked) => handleInputChange('receiveUpdates', checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="receiveUpdates">Receive Updates</Label>
                </div>
              </div>

              <div>
                <Label>Notification Preferences</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotifications"
                      checked={formData.notificationPreferences.email}
                      onCheckedChange={(checked) => handleInputChange('notificationPreferences.email', checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsNotifications"
                      checked={formData.notificationPreferences.sms}
                      onCheckedChange={(checked) => handleInputChange('notificationPreferences.sms', checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pushNotifications"
                      checked={formData.notificationPreferences.push}
                      onCheckedChange={(checked) => handleInputChange('notificationPreferences.push', checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-500 to-purple-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : (isEditMode ? "Update Vendor" : "Create Vendor")}
        </Button>
      </div>
    </form>
  )
}

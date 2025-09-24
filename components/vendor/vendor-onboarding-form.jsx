"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Checkbox } from "@/components/ui/checkbox.jsx"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"

export function VendorOnboardingForm({ onSubmit, availableServices, onAddService }) {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    companyAddress: "",
    country: "",
    email: "",
    phone: "",
    description: "",
    serviceTypes: [],
    yearsInBusiness: 0,
    certifications: [],
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = "Company name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Company name must be at least 2 characters"
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact person name is required"
    } else if (formData.contactName.trim().length < 2) {
      newErrors.contactName = "Contact person name must be at least 2 characters"
    }

    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = "Company address is required"
    } else if (formData.companyAddress.trim().length < 10) {
      newErrors.companyAddress = "Please provide a complete address"
    }

    if (!formData.country) {
      newErrors.country = "Country is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = "Please select at least one service type"
    }

    if (formData.yearsInBusiness < 0) {
      newErrors.yearsInBusiness = "Years in business cannot be negative"
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter((s) => s !== service)
        : [...prev.serviceTypes, service],
    }))
    
    // Clear service types error when user selects a service
    if (errors.serviceTypes) {
      setErrors(prev => ({ ...prev, serviceTypes: null }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`bg-gray-800/50 border-gray-700 ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Enter company name"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="contactName">Contact Person Name *</Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className={`bg-gray-800/50 border-gray-700 ${errors.contactName ? 'border-red-500' : ''}`}
            placeholder="Primary contact person"
            disabled={isSubmitting}
          />
          {errors.contactName && <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="companyAddress">Company Address *</Label>
        <Textarea
          id="companyAddress"
          value={formData.companyAddress}
          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
          className={`bg-gray-800/50 border-gray-700 ${errors.companyAddress ? 'border-red-500' : ''}`}
          placeholder="Full company address including city, state/province, postal code"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.companyAddress && <p className="text-red-400 text-sm mt-1">{errors.companyAddress}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select 
            value={formData.country} 
            onValueChange={(value) => handleInputChange('country', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={`bg-gray-800/50 border-gray-700 ${errors.country ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="Switzerland">Switzerland</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Singapore">Singapore</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="yearsInBusiness">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            type="number"
            min="0"
            value={formData.yearsInBusiness}
            onChange={(e) => handleInputChange('yearsInBusiness', parseInt(e.target.value) || 0)}
            className={`bg-gray-800/50 border-gray-700 ${errors.yearsInBusiness ? 'border-red-500' : ''}`}
            placeholder="0"
            disabled={isSubmitting}
          />
          {errors.yearsInBusiness && <p className="text-red-400 text-sm mt-1">{errors.yearsInBusiness}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Services Offered *</Label>
          <Button 
            type="button" 
            onClick={onAddService} 
            size="sm" 
            variant="outline"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a Service
          </Button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-gray-700 rounded-md bg-gray-800/30 ${errors.serviceTypes ? 'border-red-500' : ''}`}>
          {availableServices.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.serviceTypes.includes(service)}
                onCheckedChange={() => handleServiceToggle(service)}
                disabled={isSubmitting}
              />
              <Label htmlFor={service} className="text-sm cursor-pointer">
                {service}
              </Label>
            </div>
          ))}
        </div>
        {errors.serviceTypes && <p className="text-red-400 text-sm mt-1">{errors.serviceTypes}</p>}
      </div>

      <div>
        <Label htmlFor="description">Company Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="bg-gray-800/50 border-gray-700"
          placeholder="Brief description of your company and services"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-500 to-purple-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}

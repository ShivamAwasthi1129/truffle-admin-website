"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Settings
} from "lucide-react"

export function InventoryForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem, 
  category 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricing: "",
    location: "",
    status: "Available",
    availability: true,
    image: "",
    fleetDetails: {},
    additionalAmenities: {},
    travelmodes: {}
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        pricing: editingItem.pricing || "",
        location: editingItem.location || "",
        status: editingItem.status || "Available",
        availability: editingItem.availability !== undefined ? editingItem.availability : true,
        image: editingItem.image || "",
        fleetDetails: editingItem.fleetDetails || {},
        additionalAmenities: editingItem.additionalAmenities || {},
        travelmodes: editingItem.travelmodes || {}
      })
    } else {
      setFormData({
        name: "",
        description: "",
        pricing: "",
        location: "",
        status: "Available",
        availability: true,
        image: "",
        fleetDetails: {},
        additionalAmenities: {},
        travelmodes: {}
      })
    }
    setErrors({})
  }, [editingItem, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.pricing || formData.pricing <= 0) newErrors.pricing = "Valid pricing is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const itemData = {
        ...formData,
        id: editingItem?.id || `${category}${Date.now()}`,
        category,
        pricing: parseFloat(formData.pricing),
        createdAt: editingItem?.createdAt || new Date(),
        updatedAt: new Date()
      }
      
      await onSubmit(itemData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleFleetDetailChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      fleetDetails: {
        ...prev.fleetDetails,
        [key]: value
      }
    }))
  }

  const addAmenity = () => {
    const amenityName = prompt("Enter amenity name:")
    if (amenityName) {
      setFormData(prev => ({
        ...prev,
        additionalAmenities: {
          ...prev.additionalAmenities,
          [amenityName]: { value: "free", name: "", phone: "" }
        }
      }))
    }
  }

  const removeAmenity = (amenityName) => {
    setFormData(prev => {
      const newAmenities = { ...prev.additionalAmenities }
      delete newAmenities[amenityName]
      return {
        ...prev,
        additionalAmenities: newAmenities
      }
    })
  }

  const updateAmenity = (amenityName, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalAmenities: {
        ...prev.additionalAmenities,
        [amenityName]: {
          ...prev.additionalAmenities[amenityName],
          [field]: value
        }
      }
    }))
  }

  const getCategorySpecificFields = () => {
    switch (category) {
      case 'PrivateJet':
        return [
          { key: 'registrationNo', label: 'Registration Number', type: 'text' },
          { key: 'seatCapacity', label: 'Seat Capacity', type: 'number' },
          { key: 'maxSpeed', label: 'Max Speed (knots)', type: 'text' },
          { key: 'flyingRange', label: 'Flying Range', type: 'text' },
          { key: 'mfgDate', label: 'Manufacturing Date', type: 'date' },
          { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date' },
          { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
          { key: 'baseStation', label: 'Base Station', type: 'text' },
          { key: 'flightType', label: 'Flight Type', type: 'text' },
          { key: 'luggage', label: 'Luggage Capacity', type: 'text' },
          { key: 'vendor_email', label: 'Vendor Email', type: 'email' },
          { key: 'verified', label: 'Verified', type: 'checkbox' }
        ]
      case 'Yacht':
        return [
          { key: 'registrationNo', label: 'Registration Number', type: 'text' },
          { key: 'seatCapacity', label: 'Guest Capacity', type: 'number' },
          { key: 'length', label: 'Length (meters)', type: 'text' },
          { key: 'beam', label: 'Beam (meters)', type: 'text' },
          { key: 'draft', label: 'Draft (meters)', type: 'text' },
          { key: 'maxSpeed', label: 'Max Speed (knots)', type: 'text' },
          { key: 'fuelCapacity', label: 'Fuel Capacity', type: 'text' },
          { key: 'mfgDate', label: 'Manufacturing Date', type: 'date' },
          { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date' },
          { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
          { key: 'baseStation', label: 'Base Station', type: 'text' },
          { key: 'vesselType', label: 'Vessel Type', type: 'text' }
        ]
      case 'Villa':
        return [
          { key: 'registrationNo', label: 'Property ID', type: 'text' },
          { key: 'seatCapacity', label: 'Guest Capacity', type: 'number' },
          { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
          { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
          { key: 'squareFeet', label: 'Square Feet', type: 'number' },
          { key: 'lotSize', label: 'Lot Size', type: 'text' },
          { key: 'yearBuilt', label: 'Year Built', type: 'number' },
          { key: 'mfgDate', label: 'Purchase Date', type: 'date' },
          { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date' },
          { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
          { key: 'baseStation', label: 'Location', type: 'text' },
          { key: 'propertyType', label: 'Property Type', type: 'text' }
        ]
      case 'LuxuryCar':
        return [
          { key: 'registrationNo', label: 'Registration Number', type: 'text' },
          { key: 'seatCapacity', label: 'Seat Capacity', type: 'number' },
          { key: 'engine', label: 'Engine', type: 'text' },
          { key: 'power', label: 'Power (HP)', type: 'text' },
          { key: 'maxSpeed', label: 'Max Speed (mph)', type: 'text' },
          { key: 'fuelType', label: 'Fuel Type', type: 'text' },
          { key: 'transmission', label: 'Transmission', type: 'text' },
          { key: 'mfgDate', label: 'Manufacturing Date', type: 'date' },
          { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date' },
          { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
          { key: 'baseStation', label: 'Base Station', type: 'text' },
          { key: 'vehicleType', label: 'Vehicle Type', type: 'text' }
        ]
      case 'Limousine':
        return [
          { key: 'registrationNo', label: 'Registration Number', type: 'text' },
          { key: 'seatCapacity', label: 'Seat Capacity', type: 'number' },
          { key: 'engine', label: 'Engine', type: 'text' },
          { key: 'power', label: 'Power (HP)', type: 'text' },
          { key: 'maxSpeed', label: 'Max Speed (mph)', type: 'text' },
          { key: 'length', label: 'Length (meters)', type: 'text' },
          { key: 'fuelType', label: 'Fuel Type', type: 'text' },
          { key: 'transmission', label: 'Transmission', type: 'text' },
          { key: 'mfgDate', label: 'Manufacturing Date', type: 'date' },
          { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date' },
          { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
          { key: 'baseStation', label: 'Base Station', type: 'text' }
        ]
      default:
        return []
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingItem ? 'Edit' : 'Add'} {category.replace(/([A-Z])/g, ' $1').trim()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fleet">Fleet Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter item name"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing">Price per Day (USD) *</Label>
                  <Input
                    id="pricing"
                    type="number"
                    value={formData.pricing}
                    onChange={(e) => handleInputChange('pricing', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter daily price"
                  />
                  {errors.pricing && <p className="text-red-400 text-sm">{errors.pricing}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter location"
                  />
                  {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={formData.availability.toString()} onValueChange={(value) => handleInputChange('availability', value === 'true')}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Enter detailed description"
                  rows={3}
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="fleet" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCategorySpecificFields().map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === 'checkbox' ? (
                      <Select 
                        value={formData.fleetDetails[field.key]?.toString() || 'false'} 
                        onValueChange={(value) => handleFleetDetailChange(field.key, value === 'true')}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData.fleetDetails[field.key] || ''}
                        onChange={(e) => handleFleetDetailChange(field.key, e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Additional Amenities</h3>
                <Button type="button" onClick={addAmenity} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Amenity
                </Button>
              </div>

              <div className="space-y-4">
                {Object.entries(formData.additionalAmenities).map(([amenityName, details]) => (
                  <Card key={amenityName} className="bg-gray-700/50 border-gray-600">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white text-sm">{amenityName}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAmenity(amenityName)}
                          className="text-red-400 hover:text-red-300 border-red-400/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Select 
                            value={details.value} 
                            onValueChange={(value) => updateAmenity(amenityName, 'value', value)}
                          >
                            <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="chargeable">Chargeable</SelectItem>
                              <SelectItem value="not_available">Not Available</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Contact Name</Label>
                          <Input
                            value={details.name}
                            onChange={(e) => updateAmenity(amenityName, 'name', e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white text-xs"
                            placeholder="Contact name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Phone</Label>
                          <Input
                            value={details.phone}
                            onChange={(e) => updateAmenity(amenityName, 'phone', e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white text-xs"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-16 w-16 mx-auto mb-4" />
                <p>Gallery management will be implemented in the next phase</p>
                <p className="text-sm">For now, use the main image URL field</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

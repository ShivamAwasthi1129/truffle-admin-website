"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { 
  Plus, 
  Trash2,
  MapPin,
  DollarSign,
  Users,
  Star,
  Image as ImageIcon,
  Settings,
  Tag,
  Car
} from "lucide-react"

export function SuperCarForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem, 
  category = 'super_cars'
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "super_cars",
    location: {
      address: "",
      place_id: "",
      lat: 0,
      lng: 0,
      coord: {
        type: "Point",
        coordinates: [0, 0]
      }
    },
    currency: "USD",
    tags: [],
    images: [],
    features: [],
    capacity: 0,
    availability: "available",
    rating: 0,
    reviews: [],
    // Additional fields for super car management
    make: "",
    model: "",
    horsepower: 0,
    price_per_day: 0,
    available: true,
    // New fields as per requirements
    max_speed: 0,
    range: 0,
    last_maintenance: "",
    insurance_expiry: "",
    transmission: ""
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newImage, setNewImage] = useState("")

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        category: editingItem.category || "super_cars",
        location: editingItem.location || {
          address: "",
          place_id: "",
          lat: 0,
          lng: 0,
          coord: {
            type: "Point",
            coordinates: [0, 0]
          }
        },
        currency: editingItem.currency || "USD",
        tags: editingItem.tags || [],
        images: editingItem.images || [],
        features: editingItem.features || [],
        capacity: editingItem.capacity || 0,
        availability: editingItem.availability || "available",
        rating: editingItem.rating || 0,
        reviews: editingItem.reviews || [],
        // Additional fields
        make: editingItem.make || "",
        model: editingItem.model || "",
        horsepower: editingItem.horsepower || 0,
        price_per_day: editingItem.price_per_day || 0,
        available: editingItem.available !== undefined ? editingItem.available : true,
        // New fields as per requirements
        max_speed: editingItem.max_speed || 0,
        range: editingItem.range || 0,
        last_maintenance: editingItem.last_maintenance || "",
        insurance_expiry: editingItem.insurance_expiry || "",
        transmission: editingItem.transmission || ""
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "super_cars",
        location: {
          address: "",
          place_id: "",
          lat: 0,
          lng: 0,
          coord: {
            type: "Point",
            coordinates: [0, 0]
          }
        },
        currency: "USD",
        tags: [],
        images: [],
        features: [],
        capacity: 0,
        availability: "available",
        rating: 0,
        reviews: [],
        // Additional fields
        make: "",
        model: "",
        horsepower: 0,
        price_per_day: 0,
        available: true,
        // New fields as per requirements
        max_speed: 0,
        range: 0,
        last_maintenance: "",
        insurance_expiry: "",
        transmission: ""
      })
    }
    setErrors({})
  }, [editingItem, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.capacity < 0) newErrors.capacity = "Capacity cannot be negative"
    if (!formData.location.address.trim()) newErrors.location = "Location address is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Only include fields defined in the schema
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        currency: formData.currency,
        tags: formData.tags,
        images: formData.images,
        features: formData.features,
        capacity: parseInt(formData.capacity) || 0,
        availability: formData.availability,
        rating: parseFloat(formData.rating) || 0,
        reviews: formData.reviews,
        // Additional fields
        make: formData.make,
        model: formData.model,
        horsepower: parseInt(formData.horsepower) || 0,
        price_per_day: parseFloat(formData.price_per_day) || 0,
        available: formData.available,
        // New fields as per requirements
        max_speed: parseFloat(formData.max_speed) || 0,
        range: parseFloat(formData.range) || 0,
        last_maintenance: formData.last_maintenance,
        insurance_expiry: formData.insurance_expiry,
        transmission: formData.transmission
      }
      
      // Ensure location coordinates are properly formatted
      if (itemData.location) {
        itemData.location.lat = parseFloat(itemData.location.lat) || 0
        itemData.location.lng = parseFloat(itemData.location.lng) || 0
        if (itemData.location.coord && itemData.location.coord.coordinates) {
          itemData.location.coord.coordinates = [
            parseFloat(itemData.location.lng || 0),
            parseFloat(itemData.location.lat || 0)
          ]
        }
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

  const handleLocationChange = (field, value) => {
    const numValue = field === 'lat' || field === 'lng' ? parseFloat(value) || 0 : value
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: numValue,
        coord: {
          type: "Point",
          coordinates: field === 'lng' ? [numValue, prev.location.lat] : 
                      field === 'lat' ? [prev.location.lng, numValue] : prev.location.coord.coordinates
        }
      }
    }))
    
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: undefined
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }))
  }

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage("")
    }
  }

  const removeImage = (imageToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Car className="h-5 w-5" />
            {editingItem ? 'Edit' : 'Add'} Super Car
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-700">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="car">Car Details</TabsTrigger>
              <TabsTrigger value="technical">Technical Specs</TabsTrigger>
              <TabsTrigger value="location">Location & Pricing</TabsTrigger>
              <TabsTrigger value="features">Features & Tags</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Car Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="e.g., McLaren P1"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="e.g., McLaren"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="e.g., P1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability Status</Label>
                  <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="4.9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Legendary hybrid hypercar with track-focused performance..."
                  rows={3}
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="car" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Passenger Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="2"
                  />
                  {errors.capacity && <p className="text-red-400 text-sm">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horsepower">Horsepower</Label>
                  <Input
                    id="horsepower"
                    type="number"
                    min="0"
                    value={formData.horsepower}
                    onChange={(e) => handleInputChange('horsepower', parseInt(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="903"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available">Available for Booking</Label>
                  <Select value={formData.available.toString()} onValueChange={(value) => handleInputChange('available', value === 'true')}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_speed">Max Speed (km/h)</Label>
                  <Input
                    id="max_speed"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.max_speed}
                    onChange={(e) => handleInputChange('max_speed', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="350"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range">Range (km)</Label>
                  <Input
                    id="range"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.range}
                    onChange={(e) => handleInputChange('range', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="DCT">DCT (Dual Clutch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_maintenance">Last Maintenance Date</Label>
                  <Input
                    id="last_maintenance"
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => handleInputChange('last_maintenance', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                  <Input
                    id="insurance_expiry"
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => handleInputChange('insurance_expiry', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_address">Location Address *</Label>
                  <Input
                    id="location_address"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Dubai, UAE"
                  />
                  {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="place_id">Place ID</Label>
                  <Input
                    id="place_id"
                    value={formData.location.place_id}
                    onChange={(e) => handleLocationChange('place_id', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="ChIJDubaiUAE"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.location.lat}
                    onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="25.2048"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.location.lng}
                    onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="55.2708"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_day">Price per Day (USD)</Label>
                  <Input
                    id="price_per_day"
                    type="number"
                    min="0"
                    value={formData.price_per_day}
                    onChange={(e) => handleInputChange('price_per_day', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="1500"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="bg-gray-600 border-gray-500 text-white text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-300">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add feature..."
                        className="bg-gray-600 border-gray-500 text-white text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center justify-between">
                          <span>{feature}</span>
                          <button type="button" onClick={() => removeFeature(feature)} className="hover:text-red-300">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Image URL..."
                      className="bg-gray-600 border-gray-500 text-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <Button type="button" onClick={addImage} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative bg-gray-600 rounded p-2">
                        <img 
                          src={image} 
                          alt={`Super Car ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div className="hidden w-full h-20 bg-gray-500 rounded items-center justify-center text-xs text-gray-300">
                          Invalid URL
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeImage(image)} 
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Saving...' : (editingItem ? 'Update Super Car' : 'Create Super Car')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

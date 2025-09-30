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
  Anchor
} from "lucide-react"

export function YachtForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem, 
  category = 'yachts'
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "yachts",
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
    price: 0,
    currency: "USD",
    tags: [],
    images: [],
    features: [],
    capacity: 0,
    availability: "available",
    rating: 0,
    reviews: [],
    // Additional fields for yacht management
    length_m: 0,
    cabins: 0,
    price_per_day: 0,
    base_marina: {
      address: "",
      place_id: "",
      lat: 0,
      lng: 0
    },
    available: true
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
        category: editingItem.category || "yachts",
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
        price: editingItem.price || 0,
        currency: editingItem.currency || "USD",
        tags: editingItem.tags || [],
        images: editingItem.images || [],
        features: editingItem.features || [],
        capacity: editingItem.capacity || 0,
        availability: editingItem.availability || "available",
        rating: editingItem.rating || 0,
        reviews: editingItem.reviews || [],
        // Additional fields
        length_m: editingItem.length_m || 0,
        cabins: editingItem.cabins || 0,
        price_per_day: editingItem.price_per_day || 0,
        base_marina: editingItem.base_marina || {
          address: "",
          place_id: "",
          lat: 0,
          lng: 0
        },
        available: editingItem.available !== undefined ? editingItem.available : true
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "yachts",
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
        price: 0,
        currency: "USD",
        tags: [],
        images: [],
        features: [],
        capacity: 0,
        availability: "available",
        rating: 0,
        reviews: [],
        // Additional fields
        length_m: 0,
        cabins: 0,
        price_per_day: 0,
        base_marina: {
          address: "",
          place_id: "",
          lat: 0,
          lng: 0
        },
        available: true
      })
    }
    setErrors({})
  }, [editingItem, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.price < 0) newErrors.price = "Price cannot be negative"
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
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        tags: formData.tags,
        images: formData.images,
        features: formData.features,
        capacity: parseInt(formData.capacity) || 0,
        availability: formData.availability,
        rating: parseFloat(formData.rating) || 0,
        reviews: formData.reviews,
        // Additional fields
        length_m: parseFloat(formData.length_m) || 0,
        cabins: parseInt(formData.cabins) || 0,
        price_per_day: parseFloat(formData.price_per_day) || 0,
        base_marina: formData.base_marina,
        available: formData.available
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
      
      // Ensure base_marina coordinates are properly formatted
      if (itemData.base_marina) {
        itemData.base_marina.lat = parseFloat(itemData.base_marina.lat) || 0
        itemData.base_marina.lng = parseFloat(itemData.base_marina.lng) || 0
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

  const handleBaseMarinaChange = (field, value) => {
    const numValue = field === 'lat' || field === 'lng' ? parseFloat(value) || 0 : value
    
    setFormData(prev => ({
      ...prev,
      base_marina: {
        ...prev.base_marina,
        [field]: numValue
      }
    }))
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
            <Anchor className="h-5 w-5" />
            {editingItem ? 'Edit' : 'Add'} Yacht
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-700">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="yacht">Yacht Details</TabsTrigger>
              <TabsTrigger value="location">Location & Pricing</TabsTrigger>
              <TabsTrigger value="features">Features & Tags</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Yacht Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="e.g., Sunseeker Predator 74"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
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
                    placeholder="4.8"
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
                  placeholder="Sport yacht combining performance with luxury accommodations..."
                  rows={3}
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="yacht" className="space-y-4">
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
                    placeholder="8"
                  />
                  {errors.capacity && <p className="text-red-400 text-sm">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length_m">Length (meters)</Label>
                  <Input
                    id="length_m"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.length_m}
                    onChange={(e) => handleInputChange('length_m', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="22.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cabins">Number of Cabins</Label>
                  <Input
                    id="cabins"
                    type="number"
                    min="0"
                    value={formData.cabins}
                    onChange={(e) => handleInputChange('cabins', parseInt(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="3"
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

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_address">Location Address *</Label>
                  <Input
                    id="location_address"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Fort Lauderdale, FL"
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
                    placeholder="ChIJFortLauderdale"
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
                    placeholder="26.1224"
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
                    placeholder="-80.1373"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Base Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="10000"
                  />
                  {errors.price && <p className="text-red-400 text-sm">{errors.price}</p>}
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
                    placeholder="10000"
                  />
                </div>
              </div>

              {/* Base Marina Section */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Anchor className="h-4 w-4" />
                    Base Marina
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_marina_address">Marina Address</Label>
                    <Input
                      id="base_marina_address"
                      value={formData.base_marina.address}
                      onChange={(e) => handleBaseMarinaChange('address', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="Marina Bay, Fort Lauderdale"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_marina_place_id">Marina Place ID</Label>
                    <Input
                      id="base_marina_place_id"
                      value={formData.base_marina.place_id}
                      onChange={(e) => handleBaseMarinaChange('place_id', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="ChIJMarinaBay"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_marina_lat">Marina Latitude</Label>
                    <Input
                      id="base_marina_lat"
                      type="number"
                      step="any"
                      value={formData.base_marina.lat}
                      onChange={(e) => handleBaseMarinaChange('lat', parseFloat(e.target.value))}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="26.1224"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_marina_lng">Marina Longitude</Label>
                    <Input
                      id="base_marina_lng"
                      type="number"
                      step="any"
                      value={formData.base_marina.lng}
                      onChange={(e) => handleBaseMarinaChange('lng', parseFloat(e.target.value))}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="-80.1373"
                    />
                  </div>
                </CardContent>
              </Card>
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
                          alt={`Yacht ${index + 1}`}
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
              {loading ? 'Saving...' : (editingItem ? 'Update Yacht' : 'Create Yacht')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

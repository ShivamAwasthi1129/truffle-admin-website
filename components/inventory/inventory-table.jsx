"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx"
import { 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Image as ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react"

export function InventoryTable({ 
  category, 
  items, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView 
}) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleView = (item) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (available) => {
    if (available === true) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Available</Badge>
    } else if (available === false) {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Unavailable</Badge>
    } else {
      return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Unknown</Badge>
    }
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'charter_flights': return '✈️'
      case 'helicopters': return '🚁'
      case 'luxury_cars': return '🚗'
      case 'private_jets': return '🛩️'
      case 'super_cars': return '🏎️'
      case 'yachts': return '🛥️'
      default: return '📦'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'charter_flights': return 'Charter Flights'
      case 'helicopters': return 'Helicopters'
      case 'luxury_cars': return 'Luxury Cars'
      case 'private_jets': return 'Private Jets'
      case 'super_cars': return 'Super Cars'
      case 'yachts': return 'Yachts'
      default: return category
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(category)}</span>
          {getCategoryLabel(category)}
        </CardTitle>
        <Button 
          onClick={() => onAdd(category)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {getCategoryLabel(category).slice(0, -1)}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-700/50 border-gray-600">
              <TableHead className="text-gray-300">Image</TableHead>
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Description</TableHead>
              <TableHead className="text-gray-300">Location</TableHead>
              <TableHead className="text-gray-300">Price</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Capacity</TableHead>
              <TableHead className="text-right text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  No {category.toLowerCase()} items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id} className="border-gray-700 hover:bg-gray-700/30">
                  <TableCell>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-white">{item.name}</TableCell>
                  <TableCell className="text-gray-300 max-w-xs truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location?.address || item.base_location?.address || item.base_marina?.address || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium text-green-400">
                    {formatCurrency(item.price || item.price_per_hour || item.price_per_day || 0)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.available)}</TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {item.seats || item.cabins || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(item)}
                        className="text-blue-400 hover:text-blue-300 border-blue-400/50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="text-green-400 hover:text-green-300 border-green-400/50"
                        title="Edit Item"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(item._id)}
                        className="text-red-400 hover:text-red-300 border-red-400/50"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gray-800 border-gray-700 text-white">
          <DialogHeader className="pb-4 border-b border-gray-700">
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(selectedItem?.category)}</span>
                <div>
                  <h2 className="text-xl font-bold">{selectedItem?.name}</h2>
                  <p className="text-sm text-gray-400">{getCategoryLabel(selectedItem?.category)} • {selectedItem?.location?.address || selectedItem?.base_location?.address || selectedItem?.base_marina?.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedItem?.available)}
                <span className="text-lg font-semibold text-green-400">{formatCurrency(selectedItem?.price || selectedItem?.price_per_hour || selectedItem?.price_per_day || 0)}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
                {/* Left Column - Main Image & Key Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Main Image */}
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                    {selectedItem.images && selectedItem.images.length > 0 ? (
                      <img 
                        src={selectedItem.images[0]} 
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(selectedItem)}
                      className="flex-1 bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(selectedItem._id)}
                      className="flex-1 bg-red-600/10 border-red-600/20 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Key Specifications */}
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-blue-400">Key Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedItem.seats && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Seats:</span>
                          <span className="text-white">{selectedItem.seats}</span>
                        </div>
                      )}
                      {selectedItem.cabins && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Cabins:</span>
                          <span className="text-white">{selectedItem.cabins}</span>
                        </div>
                      )}
                      {selectedItem.range_km && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Range:</span>
                          <span className="text-white">{selectedItem.range_km} km</span>
                        </div>
                      )}
                      {selectedItem.length_m && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Length:</span>
                          <span className="text-white">{selectedItem.length_m} m</span>
                        </div>
                      )}
                      {selectedItem.horsepower && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Horsepower:</span>
                          <span className="text-white">{selectedItem.horsepower} hp</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Description */}
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-blue-400">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedItem.description}</p>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <CollapsibleSection title="Tags" defaultOpen={false}>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Gallery */}
                  {selectedItem.images && selectedItem.images.length > 1 && (
                    <CollapsibleSection title="Gallery" defaultOpen={false}>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {selectedItem.images.slice(1).map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-700">
                            <img 
                              src={image} 
                              alt={`${selectedItem.name} ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Collapsible Section Component
function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="bg-gray-700/30 border-gray-600">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-600/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-sm font-medium text-blue-400 flex items-center justify-between">
          <span>{title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

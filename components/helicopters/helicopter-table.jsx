"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table.jsx"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Plane,
  MapPin,
  DollarSign,
  Users,
  Star,
  Calendar,
  Filter
} from "lucide-react"
import { HelicopterForm } from "./helicopter-form.jsx"

export function HelicopterTable() {
  const [helicopters, setHelicopters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchHelicopters()
  }, [pagination.page, searchTerm, statusFilter])

  const fetchHelicopters = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/helicopters?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHelicopters(data.items || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }))
      } else {
        console.error('Failed to fetch helicopters')
      }
    } catch (error) {
      console.error('Error fetching helicopters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (itemData) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        alert('Authentication error: Please log in again')
        return
      }
      
      const response = await fetch('/api/helicopters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        console.error('Failed to create helicopter:', errorData)
        alert(`Creation failed: ${errorData.error || 'Network error'}`)
        return
      }

      const responseData = await response.json()
      console.log('Helicopter created successfully:', responseData)
      await fetchHelicopters()
      
    } catch (error) {
      console.error('Error creating helicopter:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Please check your connection and try again')
      } else {
        alert(`Creation failed: ${error.message}`)
      }
    }
  }

  const handleUpdate = async (itemData) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        alert('Authentication error: Please log in again')
        return
      }
      
      console.log('Updating helicopter:', editingItem._id)
      console.log('Update data:', itemData)
      
      const response = await fetch(`/api/helicopters/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        console.error('Failed to update helicopter:', errorData)
        alert(`Update failed: ${errorData.error || 'Network error'}`)
        return
      }

      const responseData = await response.json()
      console.log('Update successful:', responseData)
      await fetchHelicopters()
      
    } catch (error) {
      console.error('Error updating helicopter:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Please check your connection and try again')
      } else {
        alert(`Update failed: ${error.message}`)
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this helicopter?')) return

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        alert('Authentication error: Please log in again')
        return
      }
      
      const response = await fetch(`/api/helicopters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        console.error('Failed to delete helicopter:', errorData)
        alert(`Deletion failed: ${errorData.error || 'Network error'}`)
        return
      }

      console.log('Helicopter deleted successfully')
      await fetchHelicopters()
      
    } catch (error) {
      console.error('Error deleting helicopter:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Please check your connection and try again')
      } else {
        alert(`Deletion failed: ${error.message}`)
      }
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const handleFormSubmit = async (itemData) => {
    if (editingItem) {
      await handleUpdate(itemData)
    } else {
      await handleCreate(itemData)
    }
    handleFormClose()
  }

  const getAvailabilityBadge = (availability, available) => {
    const status = availability || (available ? 'available' : 'unavailable')
    const variants = {
      available: 'bg-green-600 text-white',
      unavailable: 'bg-red-600 text-white',
      maintenance: 'bg-yellow-600 text-white',
      booked: 'bg-blue-600 text-white'
    }
    return (
      <Badge className={variants[status] || 'bg-gray-600 text-white'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Helicopters</h1>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Helicopter
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search helicopters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Helicopters ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Loading helicopters...
            </div>
          ) : helicopters.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No helicopters found</p>
              <p className="text-sm">Create your first helicopter to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Helicopter</TableHead>
                    <TableHead className="text-gray-300">Registration</TableHead>
                    <TableHead className="text-gray-300">Model</TableHead>
                    <TableHead className="text-gray-300">Location</TableHead>
                    <TableHead className="text-gray-300">Capacity</TableHead>
                    <TableHead className="text-gray-300">Price/Hour</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {helicopters.map((helicopter) => (
                    <TableRow key={helicopter._id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {helicopter.images?.[0] && (
                            <img 
                              src={helicopter.images[0]} 
                              alt={helicopter.name}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div>
                            <div className="font-medium">{helicopter.name}</div>
                            {helicopter.model && (
                              <div className="text-xs text-gray-400">{helicopter.model}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="text-sm">
                          {helicopter.registration_no || 'N/A'}
                        </div>
                        {helicopter.max_speed_knots > 0 && (
                          <div className="text-xs text-gray-400">
                            {helicopter.max_speed_knots} knots
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {helicopter.model || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {helicopter.location?.address || helicopter.base_location?.address || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{helicopter.capacity || helicopter.seats || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatPrice(helicopter.price_per_hour, helicopter.currency)}/hr</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {helicopter.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{helicopter.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getAvailabilityBadge(helicopter.availability, helicopter.available)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{formatDate(helicopter.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(helicopter)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(helicopter._id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <HelicopterForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        category="helicopters"
      />
    </div>
  )
}

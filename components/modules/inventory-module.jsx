"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  Clock
} from "lucide-react"

export default function InventoryModule() {
  const [inventory, setInventory] = useState([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    status: "available",
    location: "",
    value: "",
    description: "",
    supplier: "",
    purchaseDate: "",
    warrantyExpiry: "",
    maintenanceSchedule: "monthly"
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load inventory on component mount
  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data.items || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load inventory')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error loading inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initialize dummy data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetch('/api/inventory/init', { method: 'POST' })
        await loadInventory()
      } catch (err) {
        console.error('Error initializing inventory data:', err)
        await loadInventory()
      }
    }
    
    initializeData()
  }, [])

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
      case "in-use":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Eye className="h-3 w-3 mr-1" />In Use</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Maintenance</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.location) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Inventory item created successfully!")
        setNewItem({
          name: "",
          category: "",
          status: "available",
          location: "",
          value: "",
          description: "",
          supplier: "",
          purchaseDate: "",
          warrantyExpiry: "",
          maintenanceSchedule: "monthly"
        })
        setIsAddDialogOpen(false)
        await loadInventory()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to create inventory item')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Inventory item deleted successfully!")
        await loadInventory()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to delete inventory item')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">Manage luxury assets and equipment</p>
          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError("")}
                className="mt-2 text-red-400 border-red-400/50"
              >
                Dismiss
              </Button>
            </div>
          )}
          {success && (
            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aircraft">Aircraft</SelectItem>
                    <SelectItem value="Marine">Marine</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="value">Value (USD)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newItem.value}
                  onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                  placeholder="Enter value"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="flex-1">
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {inventory.filter(item => item.status === "available").length}
                </p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {inventory.filter(item => item.status === "in-use").length}
                </p>
                <p className="text-sm text-muted-foreground">In Use</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {inventory.filter(item => item.status === "maintenance").length}
                </p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-500">{inventory.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Inventory Items</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-800/50 border-gray-700"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading inventory...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item._id} className="hover:bg-gray-800/30">
                      <TableCell className="font-medium text-blue-400">{item.id}</TableCell>
                      <TableCell className="font-semibold">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.value)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                            className="text-blue-400 hover:text-blue-300 border-blue-400/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-red-400 hover:text-red-300 border-red-400/50"
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
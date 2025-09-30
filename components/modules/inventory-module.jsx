"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { InventoryTable } from "@/components/inventory/inventory-table.jsx"
import { InventoryForm } from "@/components/inventory/inventory-form.jsx"
import { CharterFlightTable } from "@/components/charter-flights/charter-flight-table.jsx"
import { HelicopterTable } from "@/components/helicopters/helicopter-table.jsx"
import { LuxuryCarTable } from "@/components/luxury-cars/luxury-car-table.jsx"
import { PrivateJetTable } from "@/components/private-jets/private-jet-table.jsx"
import { SuperCarTable } from "@/components/super-cars/super-car-table.jsx"
// Removed mock data import - using real data from database
import { CATEGORY_DISPLAY } from "@/lib/schemas/inventory-schemas.js"
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  RefreshCw
} from "lucide-react"

export default function InventoryModule() {
  const [inventory, setInventory] = useState([])
  const [activeCategory, setActiveCategory] = useState("charter_flights")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Load inventory from API on component mount
  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      let allItems = []
      
      // Load data from all category-specific APIs
      const categories = Object.keys(CATEGORY_DISPLAY)
      
      for (const category of categories) {
        try {
          const apiEndpoint = `/api/${category.replace('_', '-')}`
          const response = await fetch(apiEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            allItems = allItems.concat(data.items || [])
          } else {
            console.warn(`Failed to load ${category}:`, response.status)
          }
        } catch (err) {
          console.warn(`Error loading ${category}:`, err)
        }
      }
      
      setInventory(allItems)
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('Error loading inventory:', err)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  // No initialization needed - data is loaded from database

  const getCategoryItems = (category) => {
    return inventory.filter(item => item.category === category)
  }

  const getFilteredItems = (category) => {
    let items = getCategoryItems(category)
    
    if (searchTerm) {
      items = items.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && typeof item.location === 'string' && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && typeof item.location === 'object' && item.location.address && item.location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.base_location && item.base_location.address && item.base_location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.base_marina && item.base_marina.address && item.base_marina.address.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        items = items.filter(item => item.available === true)
      } else if (filterStatus === "unavailable") {
        items = items.filter(item => item.available === false)
      }
    }
    
    return items
  }

  const handleAdd = (category) => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = async (itemId, category) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const apiEndpoint = `/api/${category.replace('_', '-')}/${itemId}`
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccess("Inventory item deleted successfully!")
        await loadInventory()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete inventory item')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (item) => {
    // View functionality is handled in InventoryTable component
    console.log('View item:', item)
  }

  const handleFormSubmit = async (itemData) => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const category = itemData.category || activeCategory
      const apiEndpoint = editingItem 
        ? `/api/${category.replace('_', '-')}/${editingItem._id}`
        : `/api/${category.replace('_', '-')}`
      
      const method = editingItem ? 'PUT' : 'POST'
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Inventory item ${editingItem ? 'updated' : 'created'} successfully!`)
        await loadInventory()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || `Failed to ${editingItem ? 'update' : 'create'} inventory item`)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTotalValue = () => {
    return inventory.reduce((total, item) => {
      const price = item.price || item.price_per_hour || item.price_per_day || 0
      return total + price
    }, 0)
  }

  const getCategoryStats = (category) => {
    const items = getCategoryItems(category)
    const totalValue = items.reduce((total, item) => {
      const price = item.price || item.price_per_hour || item.price_per_day || 0
      return total + price
    }, 0)
    const availableCount = items.filter(item => item.available === true).length
    
    return {
      count: items.length,
      totalValue,
      availableCount
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground">Manage luxury assets and equipment</p>
          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                onClick={() => setError("")}
                className="mt-2 text-red-400 text-xs hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}
          {success && (
            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadInventory}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(CATEGORY_DISPLAY).map(([categoryId, categoryInfo]) => {
          const stats = getCategoryStats(categoryId)
          const isActive = activeCategory === categoryId
          
          return (
            <Card 
              key={categoryId}
              className={`cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-lg' 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveCategory(categoryId)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{categoryInfo.icon}</div>
                <h3 className="font-semibold text-white text-sm">{categoryInfo.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{stats.count} items</p>
                <p className="text-xs text-green-400 mt-1">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-blue-400 mt-1">{stats.availableCount} available</p>
              </CardContent>
            </Card>
          )
        })}
        
        {/* Total Value Card */}
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-white text-sm">Total Value</h3>
            <p className="text-lg font-bold text-yellow-400 mt-1">{formatCurrency(getTotalValue())}</p>
            <p className="text-xs text-gray-400 mt-1">{inventory.length} total items</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
          {Object.entries(CATEGORY_DISPLAY).map(([categoryId, categoryInfo]) => (
            <TabsTrigger 
              key={categoryId} 
              value={categoryId}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              <span className="mr-2">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(CATEGORY_DISPLAY).map(([categoryId, categoryInfo]) => (
          <TabsContent key={categoryId} value={categoryId} className="mt-6">
            {categoryId === 'charter_flights' ? (
              <CharterFlightTable />
            ) : categoryId === 'helicopters' ? (
              <HelicopterTable />
            ) : categoryId === 'luxury_cars' ? (
              <LuxuryCarTable />
            ) : categoryId === 'private_jets' ? (
              <PrivateJetTable />
            ) : categoryId === 'super_cars' ? (
              <SuperCarTable />
            ) : (
              <InventoryTable
                category={categoryId}
                items={getFilteredItems(categoryId)}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={(itemId) => handleDelete(itemId, categoryId)}
                onView={handleView}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Inventory Form Modal */}
      <InventoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        category={activeCategory}
      />
    </div>
  )
}
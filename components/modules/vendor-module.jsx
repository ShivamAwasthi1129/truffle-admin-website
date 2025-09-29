"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Checkbox } from "@/components/ui/checkbox.jsx"
import { Progress } from "@/components/ui/progress.jsx"
import { MapPin } from "lucide-react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  Globe,
  Award,
  Settings,
  Upload,
  Download,
  Eye,
} from "lucide-react"
import { VendorService } from "@/lib/services/vendor-service.js"

export function VendorModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vendors, setVendors] = useState([])
  const [availableServices, setAvailableServices] = useState([
    "Private Jet Charter", "Luxury Yacht Rental", "Helicopter Tours", 
    "Luxury Villa Rentals", "Private Dining Experiences", "Art Gallery Tours",
    "Ski Chalet Rentals", "Wine Tasting Tours", "Spa Services", "Concierge Services"
  ])
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [managingVendor, setManagingVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Load vendors from API
  useEffect(() => {
    loadVendors()
  }, [filters, pagination.page, pagination.limit])

  const loadVendors = async () => {
    try {
      setLoading(true)
      setError(null)
      const currentFilters = {
        ...filters,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      }
      const response = await VendorService.getVendors(currentFilters)
      setVendors(response.vendors)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors')
      console.error('Error loading vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initialize test data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize dummy users first
        await fetch('/api/auth/init-users', { method: 'POST' })
        await VendorService.initializeTestData()
        loadVendors()
      } catch (err) {
        console.error('Error initializing test data:', err)
        loadVendors()
      }
    }
    
    initializeData()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  const approveVendor = async (id) => {
    try {
      await VendorService.updateVendor(id, { status: 'approved' })
      await loadVendors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve vendor')
    }
  }

  const rejectVendor = async (id) => {
    try {
      await VendorService.updateVendor(id, { status: 'rejected' })
      await loadVendors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject vendor')
    }
  }

  const editVendor = (vendor) => {
    setEditingVendor(vendor)
  }

  const deleteVendor = async (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await VendorService.deleteVendor(id)
        await loadVendors()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete vendor')
      }
    }
  }

  const manageVendor = (vendor) => {
    setManagingVendor(vendor)
  }

  const updateVendor = async (updatedVendor) => {
    try {
      await VendorService.updateVendor(updatedVendor.id, updatedVendor)
      await loadVendors()
      setEditingVendor(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor')
    }
  }

  const updateVendorManagement = async (updatedVendor) => {
    try {
      await VendorService.updateVendor(updatedVendor.id, updatedVendor)
      await loadVendors()
      setManagingVendor(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor')
    }
  }

  const addNewService = (serviceName) => {
    if (serviceName && !availableServices.includes(serviceName)) {
      setAvailableServices([...availableServices, serviceName])
      setIsAddServiceOpen(false)
    }
  }

  const addNewVendor = async (formData) => {
    try {
      await VendorService.createVendor({
        name: formData.name,
        contactName: formData.contactName,
        companyAddress: formData.companyAddress,
        country: formData.country,
        email: formData.email,
        phone: formData.phone,
        serviceTypes: formData.serviceTypes,
        yearsInBusiness: formData.yearsInBusiness,
        certifications: formData.certifications || [],
      })
      await loadVendors()
      setIsOnboardingOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor')
    }
  }

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadVendors()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const filteredVendors = vendors

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Vendor Management
          </h1>
          <p className="text-muted-foreground">Manage concierge service providers and partnerships</p>
          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="mt-2 text-red-400 border-red-400/50"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-gray-800/50 border-gray-700"
            />
          </div>
          <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Vendor Onboarding</DialogTitle>
              </DialogHeader>
              <VendorOnboardingForm
                onSubmit={addNewVendor}
                availableServices={availableServices}
                onAddService={() => setIsAddServiceOpen(true)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {vendors.filter((v) => v.status === "approved").length}
                </p>
                <p className="text-sm text-muted-foreground">Approved Vendors</p>
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
                  {vendors.filter((v) => v.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {vendors.filter((v) => v.status === "rejected").length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">{vendors.length}</p>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="directory">Vendor Directory</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="documents">Document Management</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>All Vendors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading vendors...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No vendors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-gray-800/30">
                      <TableCell className="font-medium text-blue-400">{vendor.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{vendor.name}</p>
                          {vendor.contactName && <p className="text-sm text-blue-400">Contact: {vendor.contactName}</p>}
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {vendor.country}
                          </p>
                          {vendor.companyAddress && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {vendor.companyAddress}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </p>
                          <p className="text-sm flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {vendor.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {vendor.serviceTypes.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {vendor.serviceTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{vendor.serviceTypes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{vendor.yearsInBusiness} years</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.docsUploaded ? (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            <FileText className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            <FileText className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {vendor.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveVendor(vendor.id)}
                                className="text-green-400 hover:text-green-300 border-green-400/50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectVendor(vendor.id)}
                                className="text-red-400 hover:text-red-300 border-red-400/50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => manageVendor(vendor)}
                            className="text-purple-400 hover:text-purple-300 border-purple-400/50"
                            title="Manage Status, Experience & Documents"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editVendor(vendor)}
                            className="text-blue-400 hover:text-blue-300 border-blue-400/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVendor(vendor.id)}
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
              
              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vendors
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="page-size" className="text-sm text-gray-400">Show:</Label>
                      <Select 
                        value={pagination.limit.toString()} 
                        onValueChange={(value) => {
                          setPagination(prev => ({ ...prev, limit: parseInt(value), page: 1 }))
                        }}
                      >
                        <SelectTrigger className="w-20 h-8 bg-gray-800/50 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page <= 1}
                        className="bg-gray-800/50 border-gray-700"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const pageNum = pagination.page <= 3 
                            ? i + 1 
                            : pagination.page >= pagination.pages - 2
                            ? pagination.pages - 4 + i
                            : pagination.page - 2 + i
                          
                          if (pageNum < 1 || pageNum > pagination.pages) return null
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                              className={pageNum === pagination.page 
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "bg-gray-800/50 border-gray-700"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.pages}
                        className="bg-gray-800/50 border-gray-700"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors
                  .filter((v) => v.status === "pending")
                  .map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vendor.country} • {vendor.email}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => approveVendor(vendor.id)} className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => rejectVendor(vendor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Document management interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Service Types Management</span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-blue-500"
                  onClick={() => setIsAddServiceOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Type
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service, idx) => (
                  <Card key={idx} className="bg-gray-800/30 border-gray-700">
                    <CardContent className="p-4">
                      <p className="font-medium">{service}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendors.filter((v) => v.serviceTypes.includes(service)).length} vendors offer this service
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service Type</DialogTitle>
          </DialogHeader>
          <AddServiceForm onSubmit={addNewService} onCancel={() => setIsAddServiceOpen(false)} />
        </DialogContent>
      </Dialog>

      {editingVendor && (
        <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
            </DialogHeader>
            <VendorEditForm vendor={editingVendor} onSubmit={updateVendor} availableServices={availableServices} />
          </DialogContent>
        </Dialog>
      )}

      {managingVendor && (
        <Dialog open={!!managingVendor} onOpenChange={() => setManagingVendor(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-400" />
                <span>Manage Vendor: {managingVendor.name}</span>
              </DialogTitle>
            </DialogHeader>
            <VendorManagementForm vendor={managingVendor} onSubmit={updateVendorManagement} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Simple form components
function VendorOnboardingForm({ onSubmit, availableServices, onAddService }) {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    companyAddress: "",
    country: "",
    email: "",
    phone: "",
    serviceTypes: [],
    yearsInBusiness: 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
            required
          />
        </div>
        <div>
          <Label htmlFor="contactName">Contact Person *</Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => setFormData({...formData, contactName: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="companyAddress">Company Address *</Label>
        <Textarea
          id="companyAddress"
          value={formData.companyAddress}
          onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
          className="bg-gray-800/50 border-gray-700"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="France">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
            required
          />
        </div>
        <div>
          <Label htmlFor="yearsInBusiness">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            type="number"
            value={formData.yearsInBusiness}
            onChange={(e) => setFormData({...formData, yearsInBusiness: parseInt(e.target.value) || 0})}
            className="bg-gray-800/50 border-gray-700"
          />
        </div>
      </div>

      <div>
        <Label>Services Offered *</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-gray-700 rounded-md bg-gray-800/30 mt-2">
          {availableServices.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.serviceTypes.includes(service)}
                onCheckedChange={() => handleServiceToggle(service)}
              />
              <Label htmlFor={service} className="text-sm cursor-pointer">
                {service}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500">
          Submit Application
        </Button>
      </div>
    </form>
  )
}

function AddServiceForm({ onSubmit, onCancel }) {
  const [serviceName, setServiceName] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (serviceName.trim()) {
      onSubmit(serviceName.trim())
      setServiceName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="service-name">Service Name</Label>
        <Input
          id="service-name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Enter new service type..."
          className="bg-gray-800/50 border-gray-700"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-500">
          Add Service
        </Button>
      </div>
    </form>
  )
}

function VendorEditForm({ vendor, onSubmit, availableServices }) {
  const [formData, setFormData] = useState(vendor)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Company Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
          />
        </div>
        <div>
          <Label htmlFor="edit-contactName">Contact Person</Label>
          <Input
            id="edit-contactName"
            value={formData.contactName}
            onChange={(e) => setFormData({...formData, contactName: e.target.value})}
            className="bg-gray-800/50 border-gray-700"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500">
          Update Vendor
        </Button>
      </div>
    </form>
  )
}

function VendorManagementForm({ vendor, onSubmit }) {
  const [formData, setFormData] = useState(vendor)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger className="bg-gray-800/50 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
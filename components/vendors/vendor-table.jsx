"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Key
} from "lucide-react"
import { VendorForm } from "./vendor-form.jsx"
import { VendorDetails } from "./vendor-details.jsx"

export function VendorTable() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [accountStatusFilter, setAccountStatusFilter] = useState("all")
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

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

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(verificationFilter !== "all" && { verificationStatus: verificationFilter }),
        ...(accountStatusFilter !== "all" && { accountStatus: accountStatusFilter }),
        ...(serviceCategoryFilter !== "all" && { serviceCategory: serviceCategoryFilter }),
        ...(countryFilter !== "all" && { country: countryFilter })
      })

      const response = await fetch(`/api/vendors?${params}`)
      const data = await response.json()

      if (response.ok) {
        setVendors(data.vendors)
        setPagination(data.pagination)
      } else {
        console.error("Failed to fetch vendors:", data.error)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [pagination.page, searchTerm, verificationFilter, accountStatusFilter, serviceCategoryFilter, countryFilter])

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "verification":
        setVerificationFilter(value)
        break
      case "accountStatus":
        setAccountStatusFilter(value)
        break
      case "serviceCategory":
        setServiceCategoryFilter(value)
        break
      case "country":
        setCountryFilter(value)
        break
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleVendorCreated = () => {
    setIsFormOpen(false)
    fetchVendors()
  }

  const handleVendorUpdated = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setSelectedVendor(null)
    fetchVendors()
  }

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsEditMode(true)
    setIsFormOpen(true)
  }

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsDetailsOpen(true)
  }

  const handleDeleteVendor = async (vendorId) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchVendors()
      } else {
        const data = await response.json()
        console.error("Failed to delete vendor:", data.error)
      }
    } catch (error) {
      console.error("Error deleting vendor:", error)
    }
  }

  const handleChangePassword = async (vendorId) => {
    if (!confirm("Are you sure you want to change this vendor's password? A new password will be generated and sent via email.")) return

    try {
      const response = await fetch(`/api/vendors/${vendorId}/password-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        alert("Password changed successfully! New password has been sent to the vendor's email.")
        fetchVendors()
      } else {
        console.error("Failed to change password:", data.error)
        alert("Failed to change password: " + data.error)
      }
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Error changing password: " + error.message)
    }
  }

  const getVerificationBadge = (status) => {
    const variants = {
      verified: "default",
      pending: "secondary",
      rejected: "destructive",
      suspended: "outline"
    }

    const icons = {
      verified: <CheckCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
      suspended: <AlertTriangle className="h-3 w-3" />
    }

    // Handle undefined/null status
    if (!status) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Unknown
        </Badge>
      )
    }

    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getAccountStatusBadge = (status) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive"
    }

    // Handle undefined/null status
    if (!status) {
      return (
        <Badge variant="secondary">
          Unknown
        </Badge>
      )
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-gray-400">Manage vendor registrations and verifications</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedVendor(null)
            setIsEditMode(false)
            setIsFormOpen(true)
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Verification Status</label>
              <Select value={verificationFilter} onValueChange={(value) => handleFilterChange("verification", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Account Status</label>
              <Select value={accountStatusFilter} onValueChange={(value) => handleFilterChange("accountStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Service Category</label>
              <Select value={serviceCategoryFilter} onValueChange={(value) => handleFilterChange("serviceCategory", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {serviceCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={countryFilter} onValueChange={(value) => handleFilterChange("country", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendors ({pagination.total})</CardTitle>
              <CardDescription>
                Showing {vendors.length} of {pagination.total} vendors
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchVendors}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading vendors...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {vendor.firstName} {vendor.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{vendor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vendor.businessName}</div>
                          <div className="text-sm text-gray-400">{vendor.businessType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{vendor.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {vendor.address?.city}, {vendor.address?.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {vendor.serviceCategories?.slice(0, 2).map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                            </Badge>
                          ))}
                          {vendor.serviceCategories?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{vendor.serviceCategories.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(vendor.verificationStatus)}
                      </TableCell>
                      <TableCell>
                        {getAccountStatusBadge(vendor.accountStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {vendor.verificationStatus === 'verified' && vendor.adminPanelAccess && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangePassword(vendor._id)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Change Password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVendor(vendor._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
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
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update vendor information" : "Register a new vendor"}
            </DialogDescription>
          </DialogHeader>
          <VendorForm
            vendor={selectedVendor}
            isEditMode={isEditMode}
            onSuccess={handleVendorCreated}
            onUpdate={handleVendorUpdated}
            onCancel={() => {
              setIsFormOpen(false)
              setIsEditMode(false)
              setSelectedVendor(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Vendor Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Complete vendor information and verification status
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <VendorDetails
              vendor={selectedVendor}
              onClose={() => {
                setIsDetailsOpen(false)
                setSelectedVendor(null)
              }}
              onUpdate={fetchVendors}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

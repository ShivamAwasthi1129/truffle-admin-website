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
import { Checkbox } from "@/components/ui/checkbox.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  XCircle
} from "lucide-react"

export function UserRegistrationModule() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    role: "admin",
    permissions: [],
    isActive: true,
    customRole: "",
    createCustomRole: false
  })

  const availableRoles = [
    { value: "super_admin", label: "Super Admin", description: "Full system access" },
    { value: "admin", label: "Admin", description: "Operational management" },
    { value: "billing_specialist", label: "Billing Specialist", description: "Financial management" },
    { value: "custom", label: "Custom Role", description: "Create a new custom role" }
  ]

  const departments = [
    "Operations", "Finance", "Customer Service", "IT", "Human Resources", 
    "Marketing", "Sales", "Legal", "Procurement", "Quality Assurance"
  ]

  const availablePermissions = [
    "inventory", "vendors", "clients", "concierges", "bookings", 
    "service-commissions", "concierge-commissions", "analytics", "user-registration"
  ]

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load users')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    // Validation
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      setError("Email, password, first name, and last name are required")
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newUser.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (newUser.createCustomRole && !newUser.customRole) {
      setError("Custom role name is required when creating a custom role")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const userData = {
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        department: newUser.department,
        role: newUser.createCustomRole ? newUser.customRole : newUser.role,
        permissions: newUser.permissions,
        isActive: newUser.isActive,
        createCustomRole: newUser.createCustomRole,
        customRole: newUser.customRole
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("User created successfully!")
        setNewUser({ 
          email: "", 
          password: "", 
          confirmPassword: "",
          firstName: "",
          lastName: "",
          phone: "",
          department: "",
          role: "admin", 
          permissions: [],
          isActive: true,
          customRole: "",
          createCustomRole: false
        })
        setIsAddDialogOpen(false)
        await loadUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId, updateData) => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("User updated successfully!")
        setEditingUser(null)
        await loadUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
        await loadUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || `Failed to ${isActive ? 'activate' : 'deactivate'} user`)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("User deleted successfully!")
        await loadUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><UserCheck className="h-3 w-3 mr-1" />Admin</Badge>
      case "billing_specialist":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Users className="h-3 w-3 mr-1" />Billing Specialist</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handlePermissionToggle = (permission) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            User Registration
          </h1>
          <p className="text-muted-foreground">Manage system users and their access permissions</p>
          {error && (
            <Alert className="mt-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mt-4 bg-green-500/10 border-green-500/20">
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    placeholder="Enter first name"
                    className="bg-gray-800/50 border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    placeholder="Enter last name"
                    className="bg-gray-800/50 border-gray-700"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                  className="bg-gray-800/50 border-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password (min 8 chars)"
                    className="bg-gray-800/50 border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    placeholder="Confirm password"
                    className="bg-gray-800/50 border-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value, createCustomRole: value === 'custom'})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newUser.createCustomRole && (
                <div>
                  <Label htmlFor="customRole">Custom Role Name *</Label>
                  <Input
                    id="customRole"
                    value={newUser.customRole}
                    onChange={(e) => setNewUser({...newUser, customRole: e.target.value})}
                    placeholder="Enter custom role name"
                    className="bg-gray-800/50 border-gray-700"
                    required
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newUser.isActive}
                  onCheckedChange={(checked) => setNewUser({...newUser, isActive: checked})}
                />
                <Label htmlFor="isActive" className="text-sm">
                  User is active (can login)
                </Label>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-gray-700 rounded-md bg-gray-800/30 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newUser.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm cursor-pointer">
                        {permission.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-500">
                  {users.filter(u => u.role === "super_admin").length}
                </p>
                <p className="text-sm text-muted-foreground">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {users.filter(u => u.role === "admin").length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {users.filter(u => u.role === "billing_specialist").length}
                </p>
                <p className="text-sm text-muted-foreground">Billing Specialists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-500">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>User Directory</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-800/50 border-gray-700"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="billing_specialist">Billing Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-800/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-400" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions?.slice(0, 3).map((permission, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {permission.replace('-', ' ')}
                            </Badge>
                          ))}
                          {user.permissions?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user._id, !user.isActive)}
                            className={`${user.isActive ? 'text-red-400 hover:text-red-300 border-red-400/50' : 'text-green-400 hover:text-green-300 border-green-400/50'}`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            className="text-blue-400 hover:text-blue-300 border-blue-400/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
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

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.email}</DialogTitle>
            </DialogHeader>
            <UserEditForm 
              user={editingUser} 
              onSubmit={handleUpdateUser} 
              onCancel={() => setEditingUser(null)}
              availableRoles={availableRoles}
              availablePermissions={availablePermissions}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function UserEditForm({ user, onSubmit, onCancel, availableRoles, availablePermissions }) {
  const [formData, setFormData] = useState({
    email: user.email,
    role: user.role,
    permissions: user.permissions || []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(user._id, formData)
  }

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-gray-800/50 border-gray-700"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger className="bg-gray-800/50 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-gray-700 rounded-md bg-gray-800/30 mt-2">
          {availablePermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-${permission}`}
                checked={formData.permissions.includes(permission)}
                onCheckedChange={() => handlePermissionToggle(permission)}
              />
              <Label htmlFor={`edit-${permission}`} className="text-sm cursor-pointer">
                {permission.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
          Update User
        </Button>
      </div>
    </form>
  )
}

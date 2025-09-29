/**
 * CRUD Validation Test Suite
 * Tests all major CRUD operations across modules
 */

const BASE_URL = 'http://localhost:3000/api'

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  delay: 1000
}

// Test data
const TEST_DATA = {
  user: {
    email: 'test@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    permissions: ['inventory', 'vendors'],
    isActive: true
  },
  vendor: {
    name: 'Test Vendor',
    contactName: 'John Doe',
    companyAddress: '123 Test St',
    country: 'United States',
    email: 'vendor@test.com',
    phone: '+1234567890',
    serviceTypes: ['Private Jet Charter']
  },
  inventory: {
    name: 'Test Private Jet',
    description: 'Test jet for validation',
    category: 'PrivateJet',
    pricing: 5000,
    location: 'Test Airport',
    status: 'Available',
    availability: true,
    image: 'https://example.com/test.jpg'
  }
}

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { response, data, success: response.ok }
  } catch (error) {
    return { error: error.message, success: false }
  }
}

// Authentication helpers
let authToken = null
let refreshToken = null

const login = async () => {
  const result = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'superadmin@trufle.com',
      password: 'SuperAdmin123!'
    })
  })
  
  if (result.success) {
    authToken = result.data.token
    refreshToken = result.data.refreshToken
    return true
  }
  return false
}

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${authToken}`
})

// Test suites
const AuthTests = {
  async testLogin() {
    console.log('🔐 Testing Login...')
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'superadmin@trufle.com',
        password: 'SuperAdmin123!'
      })
    })
    
    if (result.success && result.data.token) {
      console.log('✅ Login successful')
      return true
    } else {
      console.log('❌ Login failed:', result.data?.error)
      return false
    }
  },

  async testTokenRefresh() {
    console.log('🔄 Testing Token Refresh...')
    if (!refreshToken) {
      console.log('❌ No refresh token available')
      return false
    }
    
    const result = await makeRequest(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
    
    if (result.success && result.data.token) {
      console.log('✅ Token refresh successful')
      authToken = result.data.token
      return true
    } else {
      console.log('❌ Token refresh failed:', result.data?.error)
      return false
    }
  },

  async testTokenVerification() {
    console.log('🔍 Testing Token Verification...')
    const result = await makeRequest(`${BASE_URL}/auth/verify`, {
      headers: getAuthHeaders()
    })
    
    if (result.success && result.data.user) {
      console.log('✅ Token verification successful')
      return true
    } else {
      console.log('❌ Token verification failed:', result.data?.error)
      return false
    }
  }
}

const UserTests = {
  async testCreateUser() {
    console.log('👤 Testing User Creation...')
    const result = await makeRequest(`${BASE_URL}/auth/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(TEST_DATA.user)
    })
    
    if (result.success && result.data.user) {
      console.log('✅ User creation successful')
      return result.data.user._id
    } else {
      console.log('❌ User creation failed:', result.data?.error)
      return null
    }
  },

  async testGetUsers() {
    console.log('📋 Testing Get Users...')
    const result = await makeRequest(`${BASE_URL}/auth/users`, {
      headers: getAuthHeaders()
    })
    
    if (result.success && Array.isArray(result.data.users)) {
      console.log('✅ Get users successful')
      return result.data.users
    } else {
      console.log('❌ Get users failed:', result.data?.error)
      return []
    }
  },

  async testUpdateUser(userId) {
    console.log('✏️ Testing User Update...')
    const result = await makeRequest(`${BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'User'
      })
    })
    
    if (result.success && result.data.user) {
      console.log('✅ User update successful')
      return true
    } else {
      console.log('❌ User update failed:', result.data?.error)
      return false
    }
  },

  async testDeleteUser(userId) {
    console.log('🗑️ Testing User Deletion...')
    const result = await makeRequest(`${BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (result.success) {
      console.log('✅ User deletion successful')
      return true
    } else {
      console.log('❌ User deletion failed:', result.data?.error)
      return false
    }
  },

  async testSuperAdminSelfDeactivation() {
    console.log('🛡️ Testing Super Admin Self-Deactivation Prevention...')
    const users = await this.testGetUsers()
    const superAdmin = users.find(u => u.role === 'super_admin')
    
    if (!superAdmin) {
      console.log('❌ No super admin found for test')
      return false
    }
    
    const result = await makeRequest(`${BASE_URL}/auth/users/${superAdmin._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive: false })
    })
    
    if (!result.success && result.data?.error?.includes('Cannot deactivate')) {
      console.log('✅ Super admin self-deactivation prevention working')
      return true
    } else {
      console.log('❌ Super admin self-deactivation prevention failed')
      return false
    }
  }
}

const VendorTests = {
  async testCreateVendor() {
    console.log('🏢 Testing Vendor Creation...')
    const result = await makeRequest(`${BASE_URL}/vendors`, {
      method: 'POST',
      body: JSON.stringify(TEST_DATA.vendor)
    })
    
    if (result.success && result.data.id) {
      console.log('✅ Vendor creation successful')
      return result.data._id
    } else {
      console.log('❌ Vendor creation failed:', result.data?.error)
      return null
    }
  },

  async testGetVendors() {
    console.log('📋 Testing Get Vendors with Pagination...')
    const result = await makeRequest(`${BASE_URL}/vendors?page=1&limit=10`, {
      headers: getAuthHeaders()
    })
    
    if (result.success && result.data.vendors && result.data.pagination) {
      console.log('✅ Get vendors with pagination successful')
      return result.data.vendors
    } else {
      console.log('❌ Get vendors failed:', result.data?.error)
      return []
    }
  },

  async testUpdateVendor(vendorId) {
    console.log('✏️ Testing Vendor Update...')
    const result = await makeRequest(`${BASE_URL}/vendors/${vendorId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: 'Updated Vendor',
        status: 'approved'
      })
    })
    
    if (result.success && result.data.vendor) {
      console.log('✅ Vendor update successful')
      return true
    } else {
      console.log('❌ Vendor update failed:', result.data?.error)
      return false
    }
  },

  async testDeleteVendor(vendorId) {
    console.log('🗑️ Testing Vendor Deletion...')
    const result = await makeRequest(`${BASE_URL}/vendors/${vendorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (result.success) {
      console.log('✅ Vendor deletion successful')
      return true
    } else {
      console.log('❌ Vendor deletion failed:', result.data?.error)
      return false
    }
  }
}

const InventoryTests = {
  async testCreateInventory() {
    console.log('📦 Testing Inventory Creation...')
    const result = await makeRequest(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(TEST_DATA.inventory)
    })
    
    if (result.success && result.data.item) {
      console.log('✅ Inventory creation successful')
      return result.data.item._id
    } else {
      console.log('❌ Inventory creation failed:', result.data?.error)
      return null
    }
  },

  async testGetInventory() {
    console.log('📋 Testing Get Inventory...')
    const result = await makeRequest(`${BASE_URL}/inventory`, {
      headers: getAuthHeaders()
    })
    
    if (result.success && Array.isArray(result.data.items)) {
      console.log('✅ Get inventory successful')
      return result.data.items
    } else {
      console.log('❌ Get inventory failed:', result.data?.error)
      return []
    }
  },

  async testUpdateInventory(inventoryId) {
    console.log('✏️ Testing Inventory Update...')
    const result = await makeRequest(`${BASE_URL}/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: 'Updated Inventory Item',
        pricing: 6000
      })
    })
    
    if (result.success && result.data.item) {
      console.log('✅ Inventory update successful')
      return true
    } else {
      console.log('❌ Inventory update failed:', result.data?.error)
      return false
    }
  },

  async testDeleteInventory(inventoryId) {
    console.log('🗑️ Testing Inventory Deletion...')
    const result = await makeRequest(`${BASE_URL}/inventory/${inventoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (result.success) {
      console.log('✅ Inventory deletion successful')
      return true
    } else {
      console.log('❌ Inventory deletion failed:', result.data?.error)
      return false
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting CRUD Validation Tests...\n')
  
  const results = {
    auth: { passed: 0, total: 0 },
    users: { passed: 0, total: 0 },
    vendors: { passed: 0, total: 0 },
    inventory: { passed: 0, total: 0 }
  }
  
  try {
    // Authentication tests
    console.log('=== AUTHENTICATION TESTS ===')
    for (const [testName, testFn] of Object.entries(AuthTests)) {
      results.auth.total++
      if (await testFn()) {
        results.auth.passed++
      }
      await delay(TEST_CONFIG.delay)
    }
    
    // Login for subsequent tests
    if (!await login()) {
      console.log('❌ Cannot proceed without authentication')
      return results
    }
    
    // User management tests
    console.log('\n=== USER MANAGEMENT TESTS ===')
    let userId = null
    for (const [testName, testFn] of Object.entries(UserTests)) {
      results.users.total++
      const result = await testFn()
      if (result === true || result === userId) {
        results.users.passed++
        if (testName === 'testCreateUser' && result) {
          userId = result
        }
      }
      await delay(TEST_CONFIG.delay)
    }
    
    // Vendor management tests
    console.log('\n=== VENDOR MANAGEMENT TESTS ===')
    let vendorId = null
    for (const [testName, testFn] of Object.entries(VendorTests)) {
      results.vendors.total++
      const result = await testFn()
      if (result === true || result === vendorId) {
        results.vendors.passed++
        if (testName === 'testCreateVendor' && result) {
          vendorId = result
        }
      }
      await delay(TEST_CONFIG.delay)
    }
    
    // Inventory management tests
    console.log('\n=== INVENTORY MANAGEMENT TESTS ===')
    let inventoryId = null
    for (const [testName, testFn] of Object.entries(InventoryTests)) {
      results.inventory.total++
      const result = await testFn()
      if (result === true || result === inventoryId) {
        results.inventory.passed++
        if (testName === 'testCreateInventory' && result) {
          inventoryId = result
        }
      }
      await delay(TEST_CONFIG.delay)
    }
    
  } catch (error) {
    console.log('❌ Test execution error:', error.message)
  }
  
  // Print results
  console.log('\n=== TEST RESULTS ===')
  console.log(`🔐 Authentication: ${results.auth.passed}/${results.auth.total} passed`)
  console.log(`👤 User Management: ${results.users.passed}/${results.users.total} passed`)
  console.log(`🏢 Vendor Management: ${results.vendors.passed}/${results.vendors.total} passed`)
  console.log(`📦 Inventory Management: ${results.inventory.passed}/${results.inventory.total} passed`)
  
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0)
  const totalTests = Object.values(results).reduce((sum, r) => sum + r.total, 0)
  
  console.log(`\n📊 Overall: ${totalPassed}/${totalTests} tests passed`)
  
  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed! CRUD operations are working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.')
  }
  
  return results
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, AuthTests, UserTests, VendorTests, InventoryTests }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runTests().catch(console.error)
}

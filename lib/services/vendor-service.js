// Vendor service for API calls
const API_BASE_URL = '/api/vendors'

export class VendorService {
  static async getVendors(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`${API_BASE_URL}?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching vendors:', error)
      throw new Error('Failed to fetch vendors')
    }
  }

  static async createVendor(vendorData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create vendor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating vendor:', error)
      throw error
    }
  }

  static async updateVendor(vendorId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update vendor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating vendor:', error)
      throw error
    }
  }

  static async deleteVendor(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vendorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete vendor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      throw error
    }
  }

  static async initializeTestData() {
    try {
      const response = await fetch(`${API_BASE_URL}/init`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize test data')
      }

      return await response.json()
    } catch (error) {
      console.error('Error initializing test data:', error)
      throw error
    }
  }
}
// Inventory Management Tests
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Inventory Management System', () => {
  let authToken;
  let testItem;

  beforeEach(async () => {
    // Get authentication token
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'superadmin@trufle.com',
        password: 'SuperAdmin123!'
      })
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;

    testItem = {
      name: 'Test Luxury Item',
      category: 'Vehicle',
      description: 'A test luxury vehicle',
      location: 'Test Location',
      value: 100000,
      status: 'available',
      supplier: 'Test Supplier',
      purchaseDate: '2024-01-01',
      warrantyExpiry: '2029-01-01',
      maintenanceSchedule: 'monthly'
    };
  });

  describe('Inventory CRUD Operations', () => {
    it('should create a new inventory item', async () => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testItem)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe('Inventory item created successfully');
      expect(data.item.name).toBe(testItem.name);
      expect(data.item.category).toBe(testItem.category);
      expect(data.item.value).toBe(testItem.value);
      expect(data.item.id).toMatch(/^INV\d{4}$/);
    });

    it('should reject creation with missing required fields', async () => {
      const incompleteItem = {
        name: 'Test Item',
        // Missing category and location
        value: 100000
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(incompleteItem)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should retrieve all inventory items', async () => {
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toBeInstanceOf(Array);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it('should retrieve inventory items with search filter', async () => {
      const response = await fetch('/api/inventory?search=jet', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toBeInstanceOf(Array);
      // All returned items should contain 'jet' in their name
      data.items.forEach(item => {
        expect(item.name.toLowerCase()).toContain('jet');
      });
    });

    it('should retrieve inventory items with category filter', async () => {
      const response = await fetch('/api/inventory?category=Aircraft', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toBeInstanceOf(Array);
      // All returned items should be Aircraft category
      data.items.forEach(item => {
        expect(item.category).toBe('Aircraft');
      });
    });

    it('should retrieve inventory items with status filter', async () => {
      const response = await fetch('/api/inventory?status=available', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toBeInstanceOf(Array);
      // All returned items should be available
      data.items.forEach(item => {
        expect(item.status).toBe('available');
      });
    });

    it('should update an inventory item', async () => {
      // First create an item
      const createResponse = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testItem)
      });

      const createData = await createResponse.json();
      const itemId = createData.item._id;

      // Update the item
      const updateData = {
        name: 'Updated Test Item',
        status: 'in-use',
        value: 150000
      };

      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Inventory item updated successfully');
      expect(data.item.name).toBe(updateData.name);
      expect(data.item.status).toBe(updateData.status);
      expect(data.item.value).toBe(updateData.value);
    });

    it('should delete an inventory item', async () => {
      // First create an item
      const createResponse = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testItem)
      });

      const createData = await createResponse.json();
      const itemId = createData.item._id;

      // Delete the item
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Inventory item deleted successfully');

      // Verify item is deleted
      const getResponse = await fetch(`/api/inventory/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const response = await fetch(`/api/inventory/${fakeId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Inventory item not found');
    });
  });

  describe('Inventory Initialization', () => {
    it('should initialize dummy inventory data', async () => {
      const response = await fetch('/api/inventory/init', {
        method: 'POST'
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe('Inventory dummy data created successfully');
      expect(data.insertedCount).toBeGreaterThan(0);
      expect(data.items).toBeInstanceOf(Array);
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should not duplicate existing inventory data', async () => {
      // First initialization
      await fetch('/api/inventory/init', {
        method: 'POST'
      });

      // Second initialization
      const response = await fetch('/api/inventory/init', {
        method: 'POST'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('already exists');
    });
  });

  describe('Access Control', () => {
    it('should allow users with inventory permission to access inventory', async () => {
      // Login as admin (has inventory permission)
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@trufle.com',
          password: 'Admin123!'
        })
      });

      const loginData = await loginResponse.json();
      const adminToken = loginData.token;

      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      expect(response.status).toBe(200);
    });

    it('should deny access to users without inventory permission', async () => {
      // Login as billing specialist (no inventory permission)
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'billing@trufle.com',
          password: 'Billing123!'
        })
      });

      const loginData = await loginResponse.json();
      const billingToken = loginData.token;

      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${billingToken}`
        }
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Inventory permission required');
    });

    it('should deny access without authentication token', async () => {
      const response = await fetch('/api/inventory');

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });
  });

  describe('Pagination', () => {
    it('should support pagination parameters', async () => {
      const response = await fetch('/api/inventory?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(5);
      expect(data.items.length).toBeLessThanOrEqual(5);
    });

    it('should return correct pagination metadata', async () => {
      const response = await fetch('/api/inventory?page=2&limit=3', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('pages');
      expect(data.pagination.pages).toBeGreaterThanOrEqual(1);
    });
  });
});

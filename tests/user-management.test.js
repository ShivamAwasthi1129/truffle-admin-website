// User Management Tests
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('User Management System', () => {
  let superAdminToken;
  let testUser;

  beforeEach(async () => {
    // Get super admin authentication token
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
    superAdminToken = loginData.token;

    testUser = {
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1-555-123-4567',
      department: 'IT',
      role: 'admin',
      permissions: ['inventory', 'vendors'],
      isActive: true
    };
  });

  describe('User Registration (Super Admin Only)', () => {
    it('should create a new user with all required fields', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe('User created successfully');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.firstName).toBe(testUser.firstName);
      expect(data.user.lastName).toBe(testUser.lastName);
      expect(data.user.phone).toBe(testUser.phone);
      expect(data.user.department).toBe(testUser.department);
      expect(data.user.role).toBe(testUser.role);
      expect(data.user.permissions).toEqual(testUser.permissions);
      expect(data.user.isActive).toBe(testUser.isActive);
    });

    it('should create a user with custom role', async () => {
      const customRoleUser = {
        ...testUser,
        email: 'customrole@example.com',
        createCustomRole: true,
        customRole: 'custom_manager',
        role: 'custom_manager'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(customRoleUser)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user.role).toBe('custom_manager');
    });

    it('should reject user creation with missing required fields', async () => {
      const incompleteUser = {
        email: 'incomplete@example.com',
        password: 'TestPassword123!'
        // Missing firstName, lastName
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(incompleteUser)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject user creation with weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        email: 'weakpass@example.com',
        password: '123'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(weakPasswordUser)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('8 characters');
    });

    it('should reject user creation with duplicate email', async () => {
      // First user creation
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });

      // Second user creation with same email
      const duplicateUser = {
        ...testUser,
        firstName: 'Different',
        lastName: 'Name'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(duplicateUser)
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });
  });

  describe('User Listing', () => {
    beforeEach(async () => {
      // Create a test user
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });
    });

    it('should retrieve all users (super admin only)', async () => {
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.users).toBeInstanceOf(Array);
      expect(data.users.length).toBeGreaterThan(0);
      
      // Check that passwords are not included
      data.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    it('should deny access to non-super admin users', async () => {
      // Login as admin
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

      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Super admin role required');
    });
  });

  describe('User Updates', () => {
    let userId;

    beforeEach(async () => {
      // Create a test user
      const createResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });

      const createData = await createResponse.json();
      userId = createData.user._id;
    });

    it('should update user information', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        department: 'Marketing',
        phone: '+1-555-999-8888'
      };

      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('User updated successfully');
      expect(data.user.firstName).toBe(updateData.firstName);
      expect(data.user.lastName).toBe(updateData.lastName);
      expect(data.user.department).toBe(updateData.department);
      expect(data.user.phone).toBe(updateData.phone);
    });

    it('should update user role and permissions', async () => {
      const updateData = {
        role: 'billing_specialist',
        permissions: ['service-commissions', 'concierge-commissions', 'analytics']
      };

      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.role).toBe(updateData.role);
      expect(data.user.permissions).toEqual(updateData.permissions);
    });

    it('should toggle user active status', async () => {
      // Deactivate user
      const deactivateResponse = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ isActive: false })
      });

      expect(deactivateResponse.status).toBe(200);
      const deactivateData = await deactivateResponse.json();
      expect(deactivateData.user.isActive).toBe(false);

      // Reactivate user
      const reactivateResponse = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ isActive: true })
      });

      expect(reactivateResponse.status).toBe(200);
      const reactivateData = await reactivateResponse.json();
      expect(reactivateData.user.isActive).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const response = await fetch(`/api/auth/users/${fakeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ firstName: 'Updated' })
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });
  });

  describe('User Deletion', () => {
    let userId;

    beforeEach(async () => {
      // Create a test user
      const createResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });

      const createData = await createResponse.json();
      userId = createData.user._id;
    });

    it('should delete a user', async () => {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('User deleted successfully');

      // Verify user is deleted
      const getResponse = await fetch(`/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      expect(getResponse.status).toBe(404);
    });

    it('should prevent super admin from deleting themselves', async () => {
      // Get super admin user ID
      const usersResponse = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      const usersData = await usersResponse.json();
      const superAdminUser = usersData.users.find(u => u.email === 'superadmin@trufle.com');
      const superAdminId = superAdminUser._id;

      const response = await fetch(`/api/auth/users/${superAdminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Cannot delete your own account');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const response = await fetch(`/api/auth/users/${fakeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });
  });

  describe('User Activation/Deactivation', () => {
    let userId;

    beforeEach(async () => {
      // Create a test user
      const createResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(testUser)
      });

      const createData = await createResponse.json();
      userId = createData.user._id;
    });

    it('should prevent deactivated users from logging in', async () => {
      // Deactivate user
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ isActive: false })
      });

      // Try to login with deactivated user
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('deactivated');
    });

    it('should allow reactivated users to login', async () => {
      // Deactivate user
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ isActive: false })
      });

      // Reactivate user
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ isActive: true })
      });

      // Try to login with reactivated user
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Login successful');
    });
  });
});

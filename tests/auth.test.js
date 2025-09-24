// Authentication Tests
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Authentication System', () => {
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      permissions: ['inventory', 'vendors']
    };
  });

  afterEach(() => {
    // Clean up test data
  });

  describe('User Registration', () => {
    it('should register a new user with valid data', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(testUser)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe('User created successfully');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.firstName).toBe(testUser.firstName);
      expect(data.user.lastName).toBe(testUser.lastName);
      expect(data.user.role).toBe(testUser.role);
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com',
        password: 'TestPassword123!'
        // Missing firstName and lastName
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(incompleteUser)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject weak passwords', async () => {
      const weakPasswordUser = {
        ...testUser,
        password: '123'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(weakPasswordUser)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('8 characters');
    });

    it('should reject duplicate email addresses', async () => {
      // First registration
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(testUser)
      });

      // Second registration with same email
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(testUser)
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user first
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify(testUser)
      });
    });

    it('should login with valid credentials', async () => {
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
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(testUser.email);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    it('should reject login for deactivated users', async () => {
      // Deactivate the user
      await fetch('/api/auth/users/user-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-super-admin-token'
        },
        body: JSON.stringify({ isActive: false })
      });

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
  });

  describe('Token Verification', () => {
    it('should verify valid tokens', async () => {
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
      const token = loginData.token;

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.email).toBe('superadmin@trufle.com');
    });

    it('should reject invalid tokens', async () => {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid token');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow super admin to access all modules', async () => {
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
      const token = loginData.token;

      // Test access to user registration (super admin only)
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
    });

    it('should restrict admin access to user registration', async () => {
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
      const token = loginData.token;

      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Super admin role required');
    });
  });
});

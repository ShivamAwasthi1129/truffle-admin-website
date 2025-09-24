# Trufle Admin Dashboard - Testing Guide

## Overview

This document provides comprehensive testing instructions for the Trufle Admin Dashboard, including all the enhanced features and functionality.

## 🧪 Test Suite Structure

```
tests/
├── auth.test.js              # Authentication system tests
├── inventory.test.js         # Inventory management tests
├── user-management.test.js   # User management tests
├── setup.js                  # Test environment setup
└── package.test.json         # Test dependencies
```

## 🚀 Running Tests

### Prerequisites

1. **Install Test Dependencies**
   ```bash
   npm install --save-dev jest @jest/globals jest-environment-node
   ```

2. **Set Up Test Environment**
   ```bash
   cp package.test.json package.json
   npm install
   ```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:auth        # Authentication tests
npm run test:inventory   # Inventory tests
npm run test:users       # User management tests
```

## 📋 Test Coverage

### 1. Authentication System Tests (`auth.test.js`)

#### User Registration Tests
- ✅ Register new user with valid data
- ✅ Reject registration with missing required fields
- ✅ Reject weak passwords (< 8 characters)
- ✅ Reject duplicate email addresses
- ✅ Validate custom role creation

#### User Login Tests
- ✅ Login with valid credentials
- ✅ Reject invalid credentials
- ✅ Reject login for deactivated users
- ✅ Return proper user data and JWT token

#### Token Verification Tests
- ✅ Verify valid JWT tokens
- ✅ Reject invalid/expired tokens
- ✅ Return user data from valid tokens

#### Role-Based Access Control Tests
- ✅ Super admin access to all modules
- ✅ Admin access restrictions
- ✅ Billing specialist access restrictions
- ✅ Permission-based module access

### 2. Inventory Management Tests (`inventory.test.js`)

#### CRUD Operations Tests
- ✅ Create new inventory items
- ✅ Retrieve all inventory items
- ✅ Update inventory items
- ✅ Delete inventory items
- ✅ Handle missing required fields
- ✅ Return 404 for non-existent items

#### Search and Filtering Tests
- ✅ Search by item name/description
- ✅ Filter by category
- ✅ Filter by status
- ✅ Combine multiple filters

#### Pagination Tests
- ✅ Support page and limit parameters
- ✅ Return correct pagination metadata
- ✅ Handle edge cases (empty results, etc.)

#### Access Control Tests
- ✅ Allow users with inventory permission
- ✅ Deny users without inventory permission
- ✅ Require authentication token

#### Data Initialization Tests
- ✅ Initialize dummy inventory data
- ✅ Prevent duplicate initialization
- ✅ Create realistic test data

### 3. User Management Tests (`user-management.test.js`)

#### User Registration (Super Admin Only)
- ✅ Create users with all required fields
- ✅ Create users with custom roles
- ✅ Validate required field presence
- ✅ Validate password strength
- ✅ Prevent duplicate emails

#### User Listing
- ✅ Retrieve all users (super admin only)
- ✅ Exclude password fields from response
- ✅ Deny access to non-super admin users

#### User Updates
- ✅ Update user information
- ✅ Update user roles and permissions
- ✅ Toggle user active/inactive status
- ✅ Handle non-existent users

#### User Deletion
- ✅ Delete users
- ✅ Prevent self-deletion by super admin
- ✅ Handle non-existent users

#### User Activation/Deactivation
- ✅ Prevent deactivated users from logging in
- ✅ Allow reactivated users to login
- ✅ Update user status in database

## 🔧 Test Environment Setup

### Environment Variables

```bash
# Test environment variables
NODE_ENV=test
JWT_SECRET=test-jwt-secret
MONGODB_URI=mongodb://localhost:27017/trufle-admin-test
```

### Mock Data

The test suite includes comprehensive mock data for:
- **Users**: Multiple roles with different permissions
- **Inventory**: 10+ luxury items across various categories
- **Authentication**: Valid and invalid tokens
- **API Responses**: Success and error scenarios

## 📊 Test Data

### Dummy Users
```javascript
// Super Admin
email: 'superadmin@trufle.com'
password: 'SuperAdmin123!'
role: 'super_admin'
permissions: ['all modules']

// Admin
email: 'admin@trufle.com'
password: 'Admin123!'
role: 'admin'
permissions: ['inventory', 'vendors', 'clients', 'concierges', 'bookings', 'analytics']

// Billing Specialist
email: 'billing@trufle.com'
password: 'Billing123!'
role: 'billing_specialist'
permissions: ['service-commissions', 'concierge-commissions', 'analytics']
```

### Dummy Inventory Items
```javascript
// Sample inventory items
- Private Jet - Gulfstream G650 ($65M)
- Luxury Yacht - Ocean Majesty ($25M)
- Helicopter - Bell 407 ($3.5M)
- Luxury Villa - Aspen Chalet ($12M)
- Private Island - Paradise Cove ($45M)
- Supercar Collection ($15M)
- Art Collection - Contemporary ($5M)
- Wine Collection - Bordeaux ($250K)
- Luxury Watch Collection ($1.2M)
- Luxury Limousine - Rolls-Royce Phantom ($450K)
```

## 🎯 Testing Scenarios

### 1. Complete User Registration Flow
```bash
# Test the enhanced user registration form
1. Login as super admin
2. Navigate to User Registration module
3. Fill all required fields:
   - First Name, Last Name
   - Email, Password, Confirm Password
   - Phone, Department
   - Role selection
   - Custom role creation (if applicable)
   - Permissions selection
   - Active/Inactive status
4. Submit form
5. Verify user creation
6. Test user login with new credentials
```

### 2. User Activation/Deactivation Flow
```bash
# Test user status management
1. Create a new user
2. Verify user can login
3. Deactivate user via User Registration module
4. Verify user cannot login
5. Reactivate user
6. Verify user can login again
```

### 3. Inventory Management Flow
```bash
# Test complete inventory CRUD
1. Login as admin (has inventory permission)
2. Navigate to Inventory Management
3. Verify dummy data is loaded
4. Create new inventory item
5. Search and filter items
6. Update existing item
7. Delete item
8. Verify all operations work correctly
```

### 4. Role-Based Access Control Flow
```bash
# Test permission-based access
1. Login as different user roles
2. Verify sidebar shows only authorized modules
3. Try to access unauthorized modules
4. Verify proper error messages
5. Test API endpoint access restrictions
```

## 🐛 Common Test Issues & Solutions

### Issue: Tests failing due to database connection
**Solution**: Ensure MongoDB is running and test database is accessible

### Issue: Authentication tokens expiring during tests
**Solution**: Use longer token expiration for tests or refresh tokens

### Issue: Tests interfering with each other
**Solution**: Proper cleanup in `afterEach` hooks and unique test data

### Issue: Mock data not matching API responses
**Solution**: Update mock data to match actual API response structure

## 📈 Coverage Goals

- **Authentication**: 95%+ coverage
- **User Management**: 90%+ coverage
- **Inventory Management**: 90%+ coverage
- **API Routes**: 85%+ coverage
- **Overall**: 90%+ coverage

## 🔍 Manual Testing Checklist

### User Registration Module
- [ ] All required fields validation
- [ ] Password confirmation matching
- [ ] Custom role creation
- [ ] Permission selection
- [ ] Active/inactive status toggle
- [ ] Form submission and success feedback
- [ ] Error handling and display

### Inventory Management Module
- [ ] Dummy data initialization
- [ ] Item creation with all fields
- [ ] Search functionality
- [ ] Filter by category/status
- [ ] Item editing
- [ ] Item deletion
- [ ] Loading states
- [ ] Error handling

### Authentication System
- [ ] Login with valid credentials
- [ ] Login redirect to dashboard
- [ ] Invalid credential handling
- [ ] Deactivated user login prevention
- [ ] Token verification
- [ ] Logout functionality

### Role-Based Access Control
- [ ] Super admin sees all modules
- [ ] Admin sees operational modules
- [ ] Billing specialist sees financial modules
- [ ] Unauthorized access prevention
- [ ] Proper error messages

## 🚀 Running the Complete Application

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - URL: `http://localhost:3001`
   - Login with demo credentials

3. **Test all features**
   - User registration (super admin only)
   - User activation/deactivation
   - Inventory management
   - Role-based access control

4. **Run automated tests**
   ```bash
   npm test
   ```

## 📝 Test Results Interpretation

### Successful Test Run
```
✓ Authentication System (15 tests)
✓ Inventory Management (20 tests)
✓ User Management (18 tests)
✓ Total: 53 tests passed
✓ Coverage: 92%
```

### Failed Test Example
```
✗ User Registration - should reject weak passwords
  Expected: 400
  Received: 201
  Error: Password validation not working
```

## 🔧 Debugging Tests

### Enable Debug Logging
```javascript
// In test files
console.log('Debug info:', response.status, await response.json());
```

### Test Individual Functions
```bash
# Run specific test
npm test -- --testNamePattern="should create a new user"
```

### Coverage Analysis
```bash
# Generate coverage report
npm run test:coverage
# Open coverage/lcov-report/index.html
```

This comprehensive testing suite ensures all features work correctly and provides confidence in the application's reliability and security.

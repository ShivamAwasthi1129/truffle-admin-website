// User schema and authentication types
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  BILLING_SPECIALIST: 'billing_specialist',
  VENDOR: 'vendor'
}

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'inventory', 'vendors', 'clients', 'concierges', 'bookings', 
    'service-commissions', 'concierge-commissions', 'user-registration', 'users', 'analytics'
  ],
  [USER_ROLES.ADMIN]: [
    'inventory', 'vendors', 'clients', 'concierges', 'bookings', 'analytics'
  ],
  [USER_ROLES.BILLING_SPECIALIST]: [
    'service-commissions', 'concierge-commissions', 'analytics'
  ],
  [USER_ROLES.VENDOR]: [
    'inventory'
  ]
}

export const createUserSchema = {
  id: String,
  username: String,
  email: String,
  password: String, // Will be hashed
  role: String,
  firstName: String,
  lastName: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

export const loginSchema = {
  email: String,
  password: String
}

export const registerSchema = {
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String
}

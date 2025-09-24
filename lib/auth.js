import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getCollection } from './mongodb.js'
import { USER_ROLES, ROLE_PERMISSIONS } from './schemas/user.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

// Hash password
export async function hashPassword(password) {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Password hashing failed')
  }
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

// Compare password (alias for verifyPassword)
export const comparePassword = verifyPassword

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id.toString(),
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Check if user has permission for a module
export function hasPermission(userRole, moduleName) {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(moduleName)
}

// Get user by email
export async function getUserByEmail(email) {
  const collection = await getCollection('users')
  return await collection.findOne({ email })
}

// Get user by ID
export async function getUserById(userId) {
  const collection = await getCollection('users')
  return await collection.findOne({ _id: userId })
}

// Create new user
export async function createUser(userData) {
  const collection = await getCollection('users')
  
  // Check if user already exists
  const existingUser = await collection.findOne({ 
    $or: [
      { email: userData.email },
      { username: userData.username }
    ]
  })
  
  if (existingUser) {
    throw new Error('User with this email or username already exists')
  }
  
  // Hash password
  const hashedPassword = await hashPassword(userData.password)
  
  const newUser = {
    ...userData,
    password: hashedPassword,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await collection.insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

// Update user last login
export async function updateUserLastLogin(userId) {
  const collection = await getCollection('users')
  await collection.updateOne(
    { _id: userId },
    { $set: { lastLogin: new Date(), updatedAt: new Date() } }
  )
}

// Initialize dummy users
export async function initializeDummyUsers() {
  const collection = await getCollection('users')
  
  // Check if users already exist
  const existingUsers = await collection.countDocuments()
  if (existingUsers > 0) {
    console.log('Users already initialized')
    return
  }
  
  const dummyUsers = [
    {
      username: 'superadmin',
      email: 'superadmin@trufle.com',
      password: 'SuperAdmin123!',
      role: USER_ROLES.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin'
    },
    {
      username: 'admin',
      email: 'admin@trufle.com', 
      password: 'Admin123!',
      role: USER_ROLES.ADMIN,
      firstName: 'System',
      lastName: 'Admin'
    },
    {
      username: 'billing',
      email: 'billing@trufle.com',
      password: 'Billing123!',
      role: USER_ROLES.BILLING_SPECIALIST,
      firstName: 'Billing',
      lastName: 'Specialist'
    }
  ]
  
  for (const user of dummyUsers) {
    try {
      await createUser(user)
      console.log(`Created user: ${user.username}`)
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error.message)
    }
  }
  
  console.log('Dummy users initialized successfully')
}

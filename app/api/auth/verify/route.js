import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth.js'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Get user data - check both admin_users and vendors collections
    let user = null
    let userType = null
    
    // First try admin_users collection
    const adminCollection = await getCollection('admin_users')
    const adminUser = await adminCollection.findOne({ _id: new ObjectId(decoded.id) })
    
    if (adminUser) {
      user = adminUser
      userType = 'admin'
    } else {
      // Try vendors collection
      const vendorsCollection = await getCollection('vendors')
      const vendor = await vendorsCollection.findOne({ _id: new ObjectId(decoded.id) })
      
      if (vendor) {
        user = vendor
        userType = 'vendor'
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }
    
    // Check if user is active (different field names for different user types)
    const isActive = userType === 'admin' ? user.isActive : user.accountStatus === 'active'
    if (!isActive) {
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 }
      )
    }
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    
    // Prepare user data based on user type
    const userData = {
      ...userWithoutPassword,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      userType: userType,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
    
    // Add type-specific fields
    if (userType === 'admin') {
      userData.lastLogin = user.lastLogin?.toISOString()
      userData.department = user.department
      userData.phone = user.phone
      userData.role = user.role
      userData.permissions = user.permissions || []
      userData.isActive = user.isActive
    } else if (userType === 'vendor') {
      userData.lastLoginAt = user.lastLoginAt?.toISOString()
      userData.businessName = user.businessName
      userData.verificationStatus = user.verificationStatus
      userData.serviceCategories = user.serviceCategories
      userData.role = 'vendor'
      userData.permissions = ['inventory']
      userData.isActive = user.accountStatus === 'active'
    }
    
    return NextResponse.json({
      success: true,
      user: userData
    })
    
  } catch (error) {
    console.error('Token verification error:', error)
    
    // Handle MongoDB connection errors gracefully
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

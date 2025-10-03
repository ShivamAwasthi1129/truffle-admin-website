import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// POST /api/vendors/login - Vendor login
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const collection = await getCollection('vendors')
    
    // Find vendor by email
    const vendor = await collection.findOne({ email: body.email })
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(body.password, vendor.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (vendor.accountStatus !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Update last login
    await collection.updateOne(
      { _id: vendor._id },
      { $set: { lastLoginAt: new Date() } }
    )

    // Create JWT token
    const token = jwt.sign(
      { 
        vendorId: vendor._id.toString(),
        email: vendor.email,
        businessName: vendor.businessName,
        verificationStatus: vendor.verificationStatus,
        adminPanelAccess: vendor.adminPanelAccess
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password, ...vendorWithoutPassword } = vendor

    return NextResponse.json({
      message: 'Login successful',
      token,
      vendor: {
        ...vendorWithoutPassword,
        _id: vendor._id?.toString(),
        createdAt: vendor.createdAt?.toISOString(),
        updatedAt: vendor.updatedAt?.toISOString(),
        verifiedAt: vendor.verifiedAt?.toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error during vendor login:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

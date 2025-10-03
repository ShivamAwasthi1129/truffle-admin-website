import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

// GET /api/vendors - Get all vendors with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationStatus = searchParams.get('verificationStatus')
    const accountStatus = searchParams.get('accountStatus')
    const country = searchParams.get('country')
    const serviceCategory = searchParams.get('serviceCategory')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const collection = await getCollection('vendors')
    
    // Build filter object
    const filter = {}
    
    if (verificationStatus && verificationStatus !== 'all') {
      filter.verificationStatus = verificationStatus
    }
    
    if (accountStatus && accountStatus !== 'all') {
      filter.accountStatus = accountStatus
    }
    
    if (country && country !== 'all') {
      filter['address.country'] = country
    }
    
    if (serviceCategory && serviceCategory !== 'all') {
      filter['serviceCategories.category'] = serviceCategory
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter)
    
    // Get vendors with pagination
    const vendors = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Convert ObjectId to string for JSON serialization and remove password
    const serializedVendors = vendors.map(vendor => {
      const { password, ...vendorWithoutPassword } = vendor
      return {
        ...vendorWithoutPassword,
        _id: vendor._id?.toString(),
        createdAt: vendor.createdAt?.toISOString(),
        updatedAt: vendor.updatedAt?.toISOString(),
        verifiedAt: vendor.verifiedAt?.toISOString(),
        lastLoginAt: vendor.lastLoginAt?.toISOString()
      }
    })

    return NextResponse.json({
      vendors: serializedVendors,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.businessName) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, phone, businessName' },
        { status: 400 }
      )
    }

    // Check if vendor with same email already exists
    const collection = await getCollection('vendors')
    const existingVendor = await collection.findOne({ email: body.email })
    
    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor with this email already exists' },
        { status: 409 }
      )
    }

    // Generate a temporary password (will be replaced when vendor is approved)
    const tempPassword = await bcrypt.hash('temp-password-' + Date.now(), 10)

    const newVendor = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: tempPassword,
      phone: body.phone,
      businessName: body.businessName,
      businessType: body.businessType || 'company',
      businessRegistrationNumber: body.businessRegistrationNumber || '',
      taxId: body.taxId || '',
      address: {
        street: body.address?.street || '',
        city: body.address?.city || '',
        state: body.address?.state || '',
        country: body.address?.country || '',
        zipCode: body.address?.zipCode || ''
      },
      serviceCategories: body.serviceCategories || [],
      verificationStatus: 'pending',
      verificationNotes: '',
      verifiedAt: null,
      verifiedBy: null,
      accountStatus: 'active',
      adminPanelAccess: false,
      receiveUpdates: true,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      },
      stats: {
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0
      },
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newVendor)
    
    if (result.insertedId) {
      const createdVendor = await collection.findOne({ _id: result.insertedId })
      const { password, ...vendorWithoutPassword } = createdVendor
      return NextResponse.json({
        ...vendorWithoutPassword,
        _id: createdVendor?._id?.toString(),
        createdAt: createdVendor?.createdAt?.toISOString(),
        updatedAt: createdVendor?.updatedAt?.toISOString(),
        verifiedAt: createdVendor?.verifiedAt?.toISOString(),
        lastLoginAt: createdVendor?.lastLoginAt?.toISOString()
      }, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}

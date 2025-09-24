import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'

// GET /api/vendors - Get all vendors with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const country = searchParams.get('country')
    const serviceType = searchParams.get('serviceType')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const collection = await getCollection('vendors')
    
    // Build filter object
    const filter = {}
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (country && country !== 'all') {
      filter.country = country
    }
    
    if (serviceType && serviceType !== 'all') {
      filter.serviceTypes = { $in: [serviceType] }
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyAddress: { $regex: search, $options: 'i' } }
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

    // Convert ObjectId to string for JSON serialization
    const serializedVendors = vendors.map(vendor => ({
      ...vendor,
      _id: vendor._id?.toString(),
      createdAt: vendor.createdAt?.toISOString(),
      updatedAt: vendor.updatedAt?.toISOString()
    }))

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
    if (!body.name || !body.email || !body.country || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, country, phone' },
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

    // Generate unique ID
    const vendorCount = await collection.countDocuments()
    const vendorId = `VEN${String(vendorCount + 1).padStart(3, '0')}`

    const newVendor = {
      id: vendorId,
      name: body.name,
      contactName: body.contactName,
      companyAddress: body.companyAddress,
      country: body.country,
      email: body.email,
      phone: body.phone,
      status: 'pending',
      docsUploaded: false,
      serviceTypes: body.serviceTypes || [],
      yearsInBusiness: body.yearsInBusiness || 0,
      certifications: body.certifications || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newVendor)
    
    if (result.insertedId) {
      const createdVendor = await collection.findOne({ _id: result.insertedId })
      return NextResponse.json({
        ...createdVendor,
        _id: createdVendor?._id?.toString(),
        createdAt: createdVendor?.createdAt?.toISOString(),
        updatedAt: createdVendor?.updatedAt?.toISOString()
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

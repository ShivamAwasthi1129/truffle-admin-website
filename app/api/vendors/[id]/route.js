import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'

// GET /api/vendors/[id] - Get a specific vendor
export async function GET(request, { params }) {
  try {
    const { id } = params
    const collection = await getCollection('vendors')
    
    const vendor = await collection.findOne({ id })
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...vendor,
      _id: vendor._id?.toString(),
      createdAt: vendor.createdAt?.toISOString(),
      updatedAt: vendor.updatedAt?.toISOString()
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Update a specific vendor
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const collection = await getCollection('vendors')
    
    // Check if vendor exists
    const existingVendor = await collection.findOne({ id })
    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Update vendor
    const updateData = {
      ...body,
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { id },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made to vendor' },
        { status: 400 }
      )
    }

    // Return updated vendor
    const updatedVendor = await collection.findOne({ id })
    return NextResponse.json({
      ...updatedVendor,
      _id: updatedVendor._id?.toString(),
      createdAt: updatedVendor.createdAt?.toISOString(),
      updatedAt: updatedVendor.updatedAt?.toISOString()
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete a specific vendor
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const collection = await getCollection('vendors')
    
    // Check if vendor exists
    const existingVendor = await collection.findOne({ id })
    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const result = await collection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete vendor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Vendor deleted successfully',
      deletedId: id
    })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}

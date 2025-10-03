import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '@/lib/email-service.js'
import { generateVendorPassword } from '@/lib/password-generator.js'

// GET /api/vendors/[id] - Get a specific vendor
export async function GET(request, { params }) {
  try {
    const { id } = params
    const collection = await getCollection('vendors')
    
    // Try to find by ObjectId first, then by _id string
    let vendor
    if (ObjectId.isValid(id)) {
      vendor = await collection.findOne({ _id: new ObjectId(id) })
    } else {
      vendor = await collection.findOne({ _id: id })
    }
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...vendorWithoutPassword } = vendor
    return NextResponse.json({
      ...vendorWithoutPassword,
      _id: vendor._id?.toString(),
      createdAt: vendor.createdAt?.toISOString(),
      updatedAt: vendor.updatedAt?.toISOString(),
      verifiedAt: vendor.verifiedAt?.toISOString(),
      lastLoginAt: vendor.lastLoginAt?.toISOString()
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
    
    // Try to find by ObjectId first, then by _id string
    let existingVendor
    if (ObjectId.isValid(id)) {
      existingVendor = await collection.findOne({ _id: new ObjectId(id) })
    } else {
      existingVendor = await collection.findOne({ _id: id })
    }
    
    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    }

    // Hash password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    // Handle verification status changes
    if (body.verificationStatus && body.verificationStatus !== existingVendor.verificationStatus) {
      if (body.verificationStatus === 'verified') {
        // Generate a new password for the vendor
        const generatedPassword = generateVendorPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        updateData.verifiedAt = new Date()
        updateData.verifiedBy = body.verifiedBy || 'admin'
        updateData.adminPanelAccess = true // Grant admin panel access
        updateData.password = hashedPassword // Set the new password
        
        // Send approval email with generated password
        try {
          const emailResult = await sendVendorApprovalEmail(existingVendor, generatedPassword)
          if (emailResult.success) {
            console.log('Approval email sent successfully to:', existingVendor.email)
            console.log('Generated password for vendor:', generatedPassword)
          } else {
            console.error('Failed to send approval email:', emailResult.error)
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError)
        }
      } else if (body.verificationStatus === 'rejected') {
        updateData.verifiedAt = null
        updateData.verifiedBy = null
        updateData.adminPanelAccess = false
        
        // Send rejection email
        try {
          const rejectionReason = body.verificationNotes || 'Additional documentation required'
          const emailResult = await sendVendorRejectionEmail(existingVendor, rejectionReason)
          if (emailResult.success) {
            console.log('Rejection email sent successfully to:', existingVendor.email)
          } else {
            console.error('Failed to send rejection email:', emailResult.error)
          }
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError)
        }
      } else if (body.verificationStatus === 'pending') {
        updateData.verifiedAt = null
        updateData.verifiedBy = null
        updateData.adminPanelAccess = false
      }
    }

    // Update vendor
    const result = await collection.updateOne(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : id },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made to vendor' },
        { status: 400 }
      )
    }

    // Return updated vendor
    const updatedVendor = await collection.findOne({ 
      _id: ObjectId.isValid(id) ? new ObjectId(id) : id 
    })
    
    const { password, ...vendorWithoutPassword } = updatedVendor
    return NextResponse.json({
      ...vendorWithoutPassword,
      _id: updatedVendor._id?.toString(),
      createdAt: updatedVendor.createdAt?.toISOString(),
      updatedAt: updatedVendor.updatedAt?.toISOString(),
      verifiedAt: updatedVendor.verifiedAt?.toISOString(),
      lastLoginAt: updatedVendor.lastLoginAt?.toISOString()
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
    
    // Try to find by ObjectId first, then by _id string
    let existingVendor
    if (ObjectId.isValid(id)) {
      existingVendor = await collection.findOne({ _id: new ObjectId(id) })
    } else {
      existingVendor = await collection.findOne({ _id: id })
    }
    
    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const result = await collection.deleteOne({ 
      _id: ObjectId.isValid(id) ? new ObjectId(id) : id 
    })

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

import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { initializeDummyUsers } from '@/lib/auth.js'

export async function POST() {
  try {
    const collection = await getCollection('vendors')
    
    // Check if vendors already exist
    const existingVendors = await collection.countDocuments()
    if (existingVendors > 0) {
      return NextResponse.json({ 
        message: 'Vendors already initialized',
        count: existingVendors 
      })
    }

    // Initialize dummy vendors
    const dummyVendors = [
      {
        id: 'VEN001',
        name: 'Elite Aviation Services',
        contactName: 'John Smith',
        companyAddress: '123 Aviation Way, New York, NY 10001',
        country: 'United States',
        email: 'contact@eliteaviation.com',
        phone: '+1-555-0123',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Private Jet Charter', 'Helicopter Tours'],
        yearsInBusiness: 15,
        certifications: ['FAA Certified', 'International Aviation License'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN002',
        name: 'Luxury Yacht Rentals',
        contactName: 'Maria Garcia',
        companyAddress: '456 Marina Drive, Miami, FL 33101',
        country: 'United States',
        email: 'info@luxuryyachts.com',
        phone: '+1-555-0456',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Luxury Yacht Rental', 'Concierge Services'],
        yearsInBusiness: 12,
        certifications: ['Maritime License', 'Safety Certification'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN003',
        name: 'Alpine Retreat Properties',
        contactName: 'Hans Mueller',
        companyAddress: '789 Mountain View, Aspen, CO 81611',
        country: 'United States',
        email: 'bookings@alpineretreat.com',
        phone: '+1-555-0789',
        status: 'pending',
        docsUploaded: false,
        serviceTypes: ['Ski Chalet Rentals', 'Luxury Villa Rentals'],
        yearsInBusiness: 8,
        certifications: ['Property Management License'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN004',
        name: 'Michelin Dining Experiences',
        contactName: 'Pierre Dubois',
        companyAddress: '321 Culinary Street, Paris, France 75001',
        country: 'France',
        email: 'chef@michelindining.com',
        phone: '+33-1-555-0123',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Private Dining Experiences', 'Wine Tasting Tours'],
        yearsInBusiness: 20,
        certifications: ['Michelin Star Chef', 'Sommelier Certification'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN005',
        name: 'Art Gallery Tours London',
        contactName: 'Emma Thompson',
        companyAddress: '654 Gallery Lane, London, UK SW1A 1AA',
        country: 'United Kingdom',
        email: 'tours@artgallerylondon.com',
        phone: '+44-20-555-0123',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Art Gallery Tours', 'Private Art Viewings'],
        yearsInBusiness: 10,
        certifications: ['Art History Degree', 'Tour Guide License'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN006',
        name: 'Mediterranean Villa Rentals',
        contactName: 'Sophia Papadopoulos',
        companyAddress: '987 Seaside Avenue, Mykonos, Greece 84600',
        country: 'Greece',
        email: 'rentals@medvillas.com',
        phone: '+30-228-555-0123',
        status: 'pending',
        docsUploaded: false,
        serviceTypes: ['Luxury Villa Rentals', 'Spa Services'],
        yearsInBusiness: 6,
        certifications: ['Hospitality Management'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN007',
        name: 'Swiss Alpine Adventures',
        contactName: 'Klaus Weber',
        companyAddress: '147 Alpine Road, Zermatt, Switzerland 3920',
        country: 'Switzerland',
        email: 'adventures@swissalpine.com',
        phone: '+41-27-555-0123',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Ski Chalet Rentals', 'Helicopter Tours'],
        yearsInBusiness: 18,
        certifications: ['Mountain Guide License', 'Safety Certification'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'VEN008',
        name: 'Dubai Luxury Services',
        contactName: 'Ahmed Al-Rashid',
        companyAddress: '258 Sheikh Zayed Road, Dubai, UAE',
        country: 'UAE',
        email: 'luxury@dubaiservices.com',
        phone: '+971-4-555-0123',
        status: 'approved',
        docsUploaded: true,
        serviceTypes: ['Concierge Services', 'Private Dining Experiences'],
        yearsInBusiness: 14,
        certifications: ['Luxury Hospitality Certification'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert dummy vendors
    const result = await collection.insertMany(dummyVendors)
    
    // Also initialize dummy users
    try {
      await initializeDummyUsers()
    } catch (userError) {
      console.error('Error initializing users:', userError)
    }

    return NextResponse.json({
      message: 'Test data initialized successfully',
      vendorsCreated: result.insertedCount,
      vendors: dummyVendors.map(v => v.id)
    })

  } catch (error) {
    console.error('Error initializing test data:', error)
    return NextResponse.json(
      { error: 'Failed to initialize test data' },
      { status: 500 }
    )
  }
}

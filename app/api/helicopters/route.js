import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has inventory permission
    if (!decoded.permissions?.includes('inventory') && decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Inventory permission required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const collection = await getCollection('helicopters');
    
    let query = {};
    
    // Filter by vendor_id for vendor users
    if (decoded.userType === 'vendor') {
      query.vendor_id = decoded.id;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      if (status === 'available') {
        query.$or = [
          { availability: 'available' },
          { available: true }
        ];
      } else if (status === 'unavailable') {
        query.$or = [
          { availability: 'unavailable' },
          { available: false }
        ];
      } else {
        query.availability = status;
      }
    }

    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(query);
    const items = await collection.find(query).skip(skip).limit(limit).toArray();

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching helicopters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has inventory permission
    if (!decoded.permissions?.includes('inventory') && decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Inventory permission required.' }, { status: 403 });
    }

    const itemData = await request.json();

    if (!itemData.name || !itemData.description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const collection = await getCollection('helicopters');
    
    // Generate unique ID using MongoDB ObjectId
    const id = new ObjectId();

    // Only allow schema-defined fields for creation
    const allowedFields = [
      'name', 'description', 'category', 'location', 'currency',
      'tags', 'images', 'features', 'capacity', 'availability', 'rating',
      'reviews', 'model', 'seats', 'range_km', 'base_location', 'price_per_hour', 'available',
      'max_speed_knots', 'range', 'last_maintenance', 'insurance_expiry', 'cabin_height', 'engine_type', 'registration_no', 'vendor_id'
    ]
    
    // Filter itemData to only include allowed fields
    const filteredItemData = {}
    allowedFields.forEach(field => {
      if (itemData[field] !== undefined) {
        filteredItemData[field] = itemData[field]
      }
    })

    const newItem = {
      _id: id,
      name: filteredItemData.name,
      description: filteredItemData.description,
      category: 'helicopters',
      location: filteredItemData.location || {
        address: '',
        place_id: '',
        lat: 0,
        lng: 0,
        coord: {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      currency: filteredItemData.currency || 'USD',
      tags: filteredItemData.tags || [],
      images: filteredItemData.images || [],
      features: filteredItemData.features || [],
      capacity: parseInt(filteredItemData.capacity) || 0,
      availability: filteredItemData.availability || 'available',
      rating: parseFloat(filteredItemData.rating) || 0,
      reviews: filteredItemData.reviews || [],
      // Additional fields
      model: filteredItemData.model || '',
      seats: parseInt(filteredItemData.seats) || 0,
      range_km: parseInt(filteredItemData.range_km) || 0,
      base_location: filteredItemData.base_location || {
        address: '',
        place_id: '',
        lat: 0,
        lng: 0
      },
      price_per_hour: parseFloat(filteredItemData.price_per_hour) || 0,
      available: filteredItemData.available !== undefined ? filteredItemData.available : true,
      // New fields as per requirements
      max_speed_knots: parseFloat(filteredItemData.max_speed_knots) || 0,
      range: parseFloat(filteredItemData.range) || 0,
      last_maintenance: filteredItemData.last_maintenance || '',
      insurance_expiry: filteredItemData.insurance_expiry || '',
      cabin_height: parseFloat(filteredItemData.cabin_height) || 0,
      engine_type: filteredItemData.engine_type || '',
      registration_no: filteredItemData.registration_no || '',
      vendor_id: decoded.userType === 'vendor' ? decoded.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure location coordinates are properly formatted
    if (newItem.location) {
      newItem.location.lat = parseFloat(newItem.location.lat) || 0;
      newItem.location.lng = parseFloat(newItem.location.lng) || 0;
      if (newItem.location.coord && newItem.location.coord.coordinates) {
        newItem.location.coord.coordinates = [
          parseFloat(newItem.location.lng || 0),
          parseFloat(newItem.location.lat || 0)
        ];
      }
    }

    const result = await collection.insertOne(newItem);

    if (result.insertedId) {
      return NextResponse.json({ 
        message: 'Helicopter created successfully', 
        item: newItem 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create helicopter' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating helicopter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

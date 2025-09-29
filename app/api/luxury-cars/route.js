import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

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

    const collection = await getCollection('luxury_cars');
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.available = status === 'available';
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
    console.error('Error fetching luxury cars:', error);
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

    if (!itemData.name || !itemData.make || !itemData.model) {
      return NextResponse.json({ error: 'Name, make, and model are required' }, { status: 400 });
    }

    const collection = await getCollection('luxury_cars');
    
    // Generate unique ID
    const lastItem = await collection.findOne({}).sort({ createdAt: -1 });
    const lastIdNum = lastItem ? parseInt(lastItem._id.replace('LC', '')) : 0;
    const id = `LC${String(lastIdNum + 1).padStart(3, '0')}`;

    const newItem = {
      _id: id,
      name: itemData.name,
      make: itemData.make,
      model: itemData.model,
      seats: itemData.seats || 0,
      transmission: itemData.transmission || 'Automatic',
      price_per_day: itemData.price_per_day || 0,
      tags: itemData.tags || [],
      description: itemData.description || '',
      available: itemData.available !== undefined ? itemData.available : true,
      location: itemData.location || {},
      availability_windows: itemData.availability_windows || [],
      images: itemData.images || [],
      category: 'luxury_cars',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newItem);

    if (result.insertedId) {
      return NextResponse.json({ 
        message: 'Luxury car created successfully', 
        item: newItem 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create luxury car' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating luxury car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

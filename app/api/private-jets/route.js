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

    const collection = await getCollection('private_jets');
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
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
    console.error('Error fetching private jets:', error);
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

    if (!itemData.name || !itemData.model || !itemData.manufacturer) {
      return NextResponse.json({ error: 'Name, model, and manufacturer are required' }, { status: 400 });
    }

    const collection = await getCollection('private_jets');
    
    // Generate unique ID
    const lastItem = await collection.findOne({}).sort({ createdAt: -1 });
    const lastIdNum = lastItem ? parseInt(lastItem._id.replace('PJ', '')) : 0;
    const id = `PJ${String(lastIdNum + 1).padStart(3, '0')}`;

    const newItem = {
      _id: id,
      name: itemData.name,
      model: itemData.model,
      manufacturer: itemData.manufacturer,
      seats: itemData.seats || 0,
      range_km: itemData.range_km || 0,
      base_airport: itemData.base_airport || '',
      price_per_hour: itemData.price_per_hour || 0,
      tags: itemData.tags || [],
      description: itemData.description || '',
      available: itemData.available !== undefined ? itemData.available : true,
      location: itemData.location || {},
      images: itemData.images || [],
      category: 'private_jets',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newItem);

    if (result.insertedId) {
      return NextResponse.json({ 
        message: 'Private jet created successfully', 
        item: newItem 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create private jet' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating private jet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

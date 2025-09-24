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

    const collection = await getCollection('inventory');
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
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
    console.error('Error fetching inventory:', error);
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

    const {
      name,
      category,
      description,
      location,
      value,
      status,
      supplier,
      purchaseDate,
      warrantyExpiry,
      maintenanceSchedule,
      specifications
    } = await request.json();

    if (!name || !category || !location) {
      return NextResponse.json({ error: 'Name, category, and location are required' }, { status: 400 });
    }

    const collection = await getCollection('inventory');
    
    // Generate unique ID
    const count = await collection.countDocuments();
    const id = `INV${String(count + 1).padStart(4, '0')}`;

    const newItem = {
      id,
      name,
      category,
      description: description || '',
      location,
      value: parseFloat(value) || 0,
      status: status || 'available',
      supplier: supplier || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      maintenanceSchedule: maintenanceSchedule || 'monthly',
      specifications: specifications || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newItem);

    if (result.insertedId) {
      return NextResponse.json({ 
        message: 'Inventory item created successfully', 
        item: newItem 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

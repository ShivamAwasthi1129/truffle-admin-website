import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { broadcastInventoryUpdate } from './events/route.js';
import { getCollectionName, CATEGORY_DISPLAY } from '@/lib/schemas/inventory-schemas.js';

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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let allItems = [];
    let totalCount = 0;

    // If category is specified, search only that collection
    if (category && CATEGORY_DISPLAY[category]) {
      const collectionName = getCollectionName(category);
      const collection = await getCollection(collectionName);
      
      let query = {};
      
      // Filter by vendor_id for vendor users
      if (decoded.userType === 'vendor') {
        query.vendor_id = decoded.id;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        query.available = status === 'available';
      }

      const skip = (page - 1) * limit;
      totalCount = await collection.countDocuments(query);
      allItems = await collection.find(query).skip(skip).limit(limit).toArray();
    } else {
      // Search all collections
      const categories = Object.keys(CATEGORY_DISPLAY);
      
      for (const cat of categories) {
        const collectionName = getCollectionName(cat);
        const collection = await getCollection(collectionName);
        
        let query = {};
        
        // Filter by vendor_id for vendor users
        if (decoded.userType === 'vendor') {
          query.vendor_id = decoded.id;
        }
        
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        
        if (status) {
          query.available = status === 'available';
        }

        const items = await collection.find(query).toArray();
        allItems = allItems.concat(items);
      }
      
      totalCount = allItems.length;
      
      // Apply pagination to combined results
      const skip = (page - 1) * limit;
      allItems = allItems.slice(skip, skip + limit);
    }

    return NextResponse.json({
      items: allItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
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

    const itemData = await request.json();

    if (!itemData.name || !itemData.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    // Validate category exists
    if (!CATEGORY_DISPLAY[itemData.category]) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const collectionName = getCollectionName(itemData.category);
    const collection = await getCollection(collectionName);
    
    // Generate unique ID based on category
    const categoryPrefix = {
      'charter_flights': 'CF',
      'helicopters': 'HC',
      'luxury_cars': 'LC',
      'private_jets': 'PJ',
      'super_cars': 'SC',
      'yachts': 'YT'
    }[itemData.category] || 'INV';

    const lastItem = await collection.findOne({}).sort({ createdAt: -1 });
    const lastIdNum = lastItem ? parseInt(lastItem._id.replace(categoryPrefix, '')) : 0;
    const id = `${categoryPrefix}${String(lastIdNum + 1).padStart(3, '0')}`;

    // Create item based on category-specific schema
    const newItem = {
      _id: id,
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category,
      available: itemData.available !== undefined ? itemData.available : true,
      tags: itemData.tags || [],
      images: itemData.images || [],
      vendor_id: decoded.userType === 'vendor' ? decoded.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...itemData // Include all other fields specific to the category
    };

    const result = await collection.insertOne(newItem);

        if (result.insertedId) {
          // Broadcast the update to all connected clients
          broadcastInventoryUpdate('created', newItem);
          
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

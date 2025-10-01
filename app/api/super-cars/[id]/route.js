import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Helper function to convert string ID to ObjectId if needed
function parseId(id) {
  try {
    // If it's already an ObjectId, return it
    if (ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    // If it's a string that looks like an ObjectId, convert it
    if (typeof id === 'string' && id.length === 24) {
      return new ObjectId(id);
    }
    // Otherwise, return the string as is (for custom IDs like SC001)
    return id;
  } catch (error) {
    console.error('Error parsing ID:', id, error);
    return id;
  }
}

export async function GET(request, { params }) {
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

    const { id } = params;
    console.log('GET request for ID:', id);
    console.log('ID type:', typeof id);
    
    const parsedId = parseId(id);
    console.log('Parsed ID:', parsedId);
    console.log('Parsed ID type:', typeof parsedId);
    
    const collection = await getCollection('super_cars');
    
    // Debug: Check what's in the database
    const allItems = await collection.find({}).limit(5).toArray();
    console.log('Sample items in database:', allItems.map(item => ({ _id: item._id, name: item.name })));
    
    const item = await collection.findOne({ _id: parsedId });
    console.log('Item found:', item ? 'YES' : 'NO');

    if (!item) {
      return NextResponse.json({ error: 'Super car not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching super car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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

    const { id } = params;
    const updateData = await request.json();

    console.log('Update request for ID:', id);
    console.log('ID type:', typeof id);
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const parsedId = parseId(id);
    console.log('Parsed ID:', parsedId);
    console.log('Parsed ID type:', typeof parsedId);

    // Validate required fields for update
    if (!updateData.name || !updateData.description) {
      return NextResponse.json({ 
        error: 'Name and description are required for update' 
      }, { status: 400 });
    }

    // Only allow schema-defined fields for update
    const allowedFields = [
      'name', 'description', 'category', 'location', 'currency',
      'tags', 'images', 'features', 'capacity', 'availability', 'rating',
      'reviews', 'make', 'model', 'horsepower', 'price_per_day', 'available',
      'max_speed', 'range', 'last_maintenance', 'insurance_expiry', 'transmission'
    ]
    
    // Filter updateData to only include allowed fields
    const filteredUpdateData = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field]
      }
    })

    // Ensure proper data types
    if (filteredUpdateData.price_per_day) filteredUpdateData.price_per_day = parseFloat(filteredUpdateData.price_per_day);
    if (filteredUpdateData.capacity) filteredUpdateData.capacity = parseInt(filteredUpdateData.capacity);
    if (filteredUpdateData.horsepower) filteredUpdateData.horsepower = parseInt(filteredUpdateData.horsepower);
    if (filteredUpdateData.rating) filteredUpdateData.rating = parseFloat(filteredUpdateData.rating);
    // New fields data type conversions
    if (filteredUpdateData.max_speed) filteredUpdateData.max_speed = parseFloat(filteredUpdateData.max_speed);
    if (filteredUpdateData.range) filteredUpdateData.range = parseFloat(filteredUpdateData.range);

    // Ensure location coordinates are properly formatted
    if (filteredUpdateData.location) {
      if (filteredUpdateData.location.lat) filteredUpdateData.location.lat = parseFloat(filteredUpdateData.location.lat);
      if (filteredUpdateData.location.lng) filteredUpdateData.location.lng = parseFloat(filteredUpdateData.location.lng);
      if (filteredUpdateData.location.coord && filteredUpdateData.location.coord.coordinates) {
        filteredUpdateData.location.coord.coordinates = [
          parseFloat(filteredUpdateData.location.lng || 0),
          parseFloat(filteredUpdateData.location.lat || 0)
        ];
      }
    }

    const collection = await getCollection('super_cars');
    
    // Debug: Check what's in the database
    console.log('Checking database for ID:', id);
    const allItems = await collection.find({}).limit(5).toArray();
    console.log('Sample items in database:', allItems.map(item => ({ _id: item._id, name: item.name })));
    
    // Check if the item exists first
    const existingItem = await collection.findOne({ _id: parsedId });
    console.log('Existing item found:', existingItem ? 'YES' : 'NO');
    if (existingItem) {
      console.log('Existing item ID:', existingItem._id);
      console.log('Existing item ID type:', typeof existingItem._id);
    } else {
      console.log('Item not found with ID:', id);
      console.log('Parsed ID:', parsedId);
      console.log('ID type:', typeof id);
      return NextResponse.json({ error: 'Super car not found' }, { status: 404 });
    }

    const result = await collection.updateOne(
      { _id: parsedId },
      { $set: { ...filteredUpdateData, updatedAt: new Date().toISOString() } }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Super car not found' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        message: 'No changes made to super car',
        item: existingItem 
      });
    }

    const updatedItem = await collection.findOne({ _id: parsedId });

    return NextResponse.json({ 
      message: 'Super car updated successfully', 
      item: updatedItem 
    });
  } catch (error) {
    console.error('Error updating super car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;
    const parsedId = parseId(id);
    
    const collection = await getCollection('super_cars');
    const result = await collection.deleteOne({ _id: parsedId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Super car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Super car deleted successfully' });
  } catch (error) {
    console.error('Error deleting super car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

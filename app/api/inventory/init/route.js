import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { allInventoryData } from '@/lib/mock-data.js';

export async function POST(request) {
  try {
    const collection = await getCollection('inventory');
    
    // Check if inventory already exists
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Inventory data already exists',
        count: existingCount 
      });
    }

    // Use comprehensive mock data from lib/mock-data.js
    const result = await collection.insertMany(allInventoryData);

    return NextResponse.json({ 
      message: 'Comprehensive inventory data created successfully',
      insertedCount: result.insertedCount,
      categories: {
        PrivateJet: allInventoryData.filter(item => item.category === 'PrivateJet').length,
        Yacht: allInventoryData.filter(item => item.category === 'Yacht').length,
        Villa: allInventoryData.filter(item => item.category === 'Villa').length,
        LuxuryCar: allInventoryData.filter(item => item.category === 'LuxuryCar').length,
        Limousine: allInventoryData.filter(item => item.category === 'Limousine').length
      },
      totalValue: allInventoryData.reduce((total, item) => total + (item.pricing || 0), 0)
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory dummy data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

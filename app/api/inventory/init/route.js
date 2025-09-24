import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

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

    // Create dummy inventory data
    const dummyInventory = [
      {
        id: 'INV0001',
        name: 'Private Jet - Gulfstream G650',
        category: 'Aircraft',
        description: 'Ultra-long-range business jet with luxury interior',
        location: 'New York',
        value: 65000000,
        status: 'available',
        supplier: 'Gulfstream Aerospace',
        purchaseDate: new Date('2023-01-15'),
        warrantyExpiry: new Date('2028-01-15'),
        maintenanceSchedule: 'monthly',
        specifications: {
          capacity: '14 passengers',
          range: '7500 nm',
          maxSpeed: 'Mach 0.925',
          engine: 'Rolls-Royce BR725'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0002',
        name: 'Luxury Yacht - Ocean Majesty',
        category: 'Marine',
        description: 'Superyacht with helipad and luxury amenities',
        location: 'Monaco',
        value: 25000000,
        status: 'in-use',
        supplier: 'Oceanco',
        purchaseDate: new Date('2022-06-10'),
        warrantyExpiry: new Date('2027-06-10'),
        maintenanceSchedule: 'quarterly',
        specifications: {
          length: '85 meters',
          capacity: '12 guests, 20 crew',
          features: ['Helipad', 'Swimming pool', 'Cinema', 'Gym']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0003',
        name: 'Helicopter - Bell 407',
        category: 'Aircraft',
        description: 'Single-engine helicopter for city tours',
        location: 'London',
        value: 3500000,
        status: 'maintenance',
        supplier: 'Bell Helicopter',
        purchaseDate: new Date('2023-03-20'),
        warrantyExpiry: new Date('2028-03-20'),
        maintenanceSchedule: 'monthly',
        specifications: {
          capacity: '6 passengers',
          range: '350 nm',
          cruiseSpeed: '140 knots',
          engine: 'Rolls-Royce 250-C47B'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0004',
        name: 'Luxury Villa - Aspen Chalet',
        category: 'Property',
        description: 'Mountain retreat with ski-in/ski-out access',
        location: 'Aspen, CO',
        value: 12000000,
        status: 'available',
        supplier: 'Aspen Real Estate',
        purchaseDate: new Date('2022-12-01'),
        warrantyExpiry: null,
        maintenanceSchedule: 'seasonal',
        specifications: {
          bedrooms: 8,
          bathrooms: 10,
          squareFeet: 12000,
          features: ['Ski room', 'Wine cellar', 'Home theater', 'Spa']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0005',
        name: 'Luxury Limousine - Rolls-Royce Phantom',
        category: 'Vehicle',
        description: 'Extended wheelbase luxury sedan',
        location: 'Los Angeles',
        value: 450000,
        status: 'available',
        supplier: 'Rolls-Royce Motor Cars',
        purchaseDate: new Date('2023-05-15'),
        warrantyExpiry: new Date('2028-05-15'),
        maintenanceSchedule: 'monthly',
        specifications: {
          engine: '6.75L V12',
          power: '563 hp',
          features: ['Chauffeur partition', 'Refrigerator', 'Champagne flutes']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0006',
        name: 'Art Collection - Contemporary',
        category: 'Art',
        description: 'Collection of contemporary art pieces',
        location: 'Miami',
        value: 5000000,
        status: 'available',
        supplier: 'Various Galleries',
        purchaseDate: new Date('2023-02-28'),
        warrantyExpiry: null,
        maintenanceSchedule: 'annual',
        specifications: {
          pieces: 25,
          artists: ['Banksy', 'Jeff Koons', 'Damien Hirst'],
          insuranceValue: 5500000
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0007',
        name: 'Wine Collection - Bordeaux',
        category: 'Beverages',
        description: 'Premium Bordeaux wine collection',
        location: 'Napa Valley',
        value: 250000,
        status: 'available',
        supplier: 'Château Margaux',
        purchaseDate: new Date('2022-11-15'),
        warrantyExpiry: null,
        maintenanceSchedule: 'quarterly',
        specifications: {
          bottles: 500,
          vintages: ['2015', '2016', '2017', '2018'],
          storage: 'Climate controlled'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0008',
        name: 'Private Island - Paradise Cove',
        category: 'Property',
        description: 'Private island resort with beachfront villas',
        location: 'Caribbean',
        value: 45000000,
        status: 'available',
        supplier: 'Caribbean Real Estate',
        purchaseDate: new Date('2021-08-20'),
        warrantyExpiry: null,
        maintenanceSchedule: 'monthly',
        specifications: {
          size: '150 acres',
          villas: 12,
          features: ['Private beach', 'Marina', 'Golf course', 'Spa']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0009',
        name: 'Luxury Watch Collection',
        category: 'Accessories',
        description: 'Collection of rare and luxury timepieces',
        location: 'Geneva',
        value: 1200000,
        status: 'available',
        supplier: 'Various Watchmakers',
        purchaseDate: new Date('2023-04-10'),
        warrantyExpiry: null,
        maintenanceSchedule: 'annual',
        specifications: {
          pieces: 15,
          brands: ['Patek Philippe', 'Rolex', 'Audemars Piguet'],
          insuranceValue: 1300000
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'INV0010',
        name: 'Supercar Collection',
        category: 'Vehicle',
        description: 'Collection of exotic supercars',
        location: 'Monaco',
        value: 15000000,
        status: 'in-use',
        supplier: 'Various Manufacturers',
        purchaseDate: new Date('2023-01-05'),
        warrantyExpiry: new Date('2028-01-05'),
        maintenanceSchedule: 'monthly',
        specifications: {
          cars: 8,
          brands: ['Ferrari', 'Lamborghini', 'McLaren', 'Bugatti'],
          totalHorsepower: 6000
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await collection.insertMany(dummyInventory);

    return NextResponse.json({ 
      message: 'Inventory dummy data created successfully',
      insertedCount: result.insertedCount,
      items: dummyInventory.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        value: item.value,
        status: item.status
      }))
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory dummy data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

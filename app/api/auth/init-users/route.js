import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const collection = await getCollection('admin_users');
    
    // Check if users already exist
    const existingUsers = await collection.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({ 
        message: 'Users already exist in database',
        count: existingUsers 
      });
    }

    // Create dummy users
    const dummyUsers = [
      {
        email: 'superadmin@trufle.com',
        password: await hashPassword('SuperAdmin123!'),
        role: 'super_admin',
        permissions: [
          'inventory', 'vendors', 'clients', 'concierges', 'bookings', 
          'service-commissions', 'concierge-commissions', 'user-registration', 'users', 'analytics'
        ],
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin@trufle.com',
        password: await hashPassword('Admin123!'),
        role: 'admin',
        permissions: [
          'inventory', 'vendors', 'clients', 'concierges', 'bookings', 'analytics'
        ],
        firstName: 'System',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'billing@trufle.com',
        password: await hashPassword('Billing123!'),
        role: 'billing_specialist',
        permissions: [
          'service-commissions', 'concierge-commissions', 'analytics'
        ],
        firstName: 'Billing',
        lastName: 'Specialist',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'john.doe@trufle.com',
        password: await hashPassword('Admin123!'),
        role: 'admin',
        permissions: [
          'inventory', 'vendors', 'clients', 'concierges', 'bookings', 'analytics'
        ],
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jane.smith@trufle.com',
        password: await hashPassword('Billing123!'),
        role: 'billing_specialist',
        permissions: [
          'service-commissions', 'concierge-commissions', 'analytics'
        ],
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await collection.insertMany(dummyUsers);

    return NextResponse.json({ 
      message: 'Dummy users created successfully',
      insertedCount: result.insertedCount,
      users: dummyUsers.map(user => ({
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }))
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating dummy users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

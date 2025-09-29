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

    // Only super admin can access user management
    if (decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Super admin role required.' }, { status: 403 });
    }

    const collection = await getCollection('admin_users');
    const users = await collection.find({}, { projection: { password: 0 } }).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
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

    // Only super admin can create users
    if (decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Super admin role required.' }, { status: 403 });
    }

    const { email, password, role, permissions } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const collection = await getCollection('admin_users');
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    const newUser = {
      email,
      password: hashedPassword,
      role: role || 'admin',
      permissions: permissions || [],
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newUser);

    if (result.insertedId) {
      const createdUser = await collection.findOne({ _id: result.insertedId }, { projection: { password: 0 } });
      return NextResponse.json({ message: 'User created successfully', user: createdUser }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

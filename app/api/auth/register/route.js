import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      department, 
      role, 
      permissions, 
      isActive, 
      createCustomRole, 
      customRole 
    } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, password, first name, and last name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (createCustomRole && !customRole) {
      return NextResponse.json({ error: 'Custom role name is required when creating a custom role' }, { status: 400 });
    }

    const collection = await getCollection('users');
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const finalRole = createCustomRole ? customRole : (role || 'admin');

    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      department: department || '',
      role: finalRole,
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newUser);

    if (result.insertedId) {
      const createdUser = await collection.findOne({ _id: result.insertedId }, { projection: { password: 0 } });
      return NextResponse.json({ 
        message: 'User created successfully', 
        user: createdUser 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error during user creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
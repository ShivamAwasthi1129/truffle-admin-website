import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const collection = await getCollection('users');
    const user = await collection.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Please contact administrator.' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });

    // Generate refresh token (valid for 7 days)
    const refreshToken = generateToken({
      id: user._id.toString(),
      email: user.email,
      type: 'refresh'
    }, '7d');

    // Update last login
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return NextResponse.json({ 
      message: 'Login successful', 
      token,
      refreshToken,
      user: { 
        _id: user._id.toString(), 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role, 
        permissions: user.permissions || [],
        isActive: user.isActive,
        department: user.department,
        phone: user.phone
      } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
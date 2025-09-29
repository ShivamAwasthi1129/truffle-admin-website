import { NextResponse } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Get user from database to ensure they still exist and are active
    const collection = await getCollection('admin_users');
    const user = await collection.findOne(
      { _id: new ObjectId(decoded.id), isActive: true },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    // Generate new access token
    const newToken = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });

    // Generate new refresh token
    const newRefreshToken = generateToken({
      id: user._id.toString(),
      email: user.email,
      type: 'refresh'
    }, '7d'); // Refresh token valid for 7 days

    return NextResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions || [],
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

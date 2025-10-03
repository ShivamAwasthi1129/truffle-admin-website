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

    // Get user from database - check both admin_users and vendors collections
    let user = null;
    let userType = null;
    
    // First try admin_users collection
    const adminCollection = await getCollection('admin_users');
    const adminUser = await adminCollection.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    );
    
    if (adminUser && adminUser.isActive) {
      user = adminUser;
      userType = 'admin';
    } else {
      // Try vendors collection
      const vendorsCollection = await getCollection('vendors');
      const vendor = await vendorsCollection.findOne(
        { _id: new ObjectId(decoded.id) },
        { projection: { password: 0 } }
      );
      
      if (vendor && vendor.accountStatus === 'active' && 
          vendor.verificationStatus === 'verified' && vendor.adminPanelAccess) {
        user = vendor;
        userType = 'vendor';
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    // Generate new access token with proper data based on user type
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: userType === 'vendor' ? 'vendor' : user.role,
      permissions: userType === 'vendor' ? ['inventory'] : (user.permissions || []),
      userType: userType
    };
    
    // Add vendor-specific fields to token
    if (userType === 'vendor') {
      tokenPayload.businessName = user.businessName;
      tokenPayload.verificationStatus = user.verificationStatus;
      tokenPayload.serviceCategories = user.serviceCategories;
    }
    
    const newToken = generateToken(tokenPayload);

    // Generate new refresh token
    const newRefreshToken = generateToken({
      id: user._id.toString(),
      email: user.email,
      type: 'refresh'
    }, '7d'); // Refresh token valid for 7 days

    // Prepare user data based on user type
    const userData = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: tokenPayload.role,
      permissions: tokenPayload.permissions,
      userType: userType,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    };
    
    // Add type-specific fields
    if (userType === 'admin') {
      userData.isActive = user.isActive;
      userData.department = user.department;
      userData.phone = user.phone;
    } else if (userType === 'vendor') {
      userData.isActive = user.accountStatus === 'active';
      userData.businessName = user.businessName;
      userData.verificationStatus = user.verificationStatus;
      userData.serviceCategories = user.serviceCategories;
    }

    return NextResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: userData
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

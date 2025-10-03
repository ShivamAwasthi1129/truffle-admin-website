import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, userType = 'admin' } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Based on userType, check the appropriate collection first
    if (userType === 'vendor') {
      // Check vendors collection first for vendor login
      const vendorsCollection = await getCollection('vendors');
      const vendor = await vendorsCollection.findOne({ email });

      if (vendor) {
        // Check password
        const isPasswordValid = await comparePassword(password, vendor.password);
        
        if (!isPasswordValid) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if vendor account is active
        if (vendor.accountStatus !== 'active') {
          return NextResponse.json({ error: 'Account is not active' }, { status: 401 });
        }

        // Check if vendor is verified and has admin panel access
        if (vendor.verificationStatus !== 'verified' || !vendor.adminPanelAccess) {
          return NextResponse.json({ 
            error: 'Account verification pending. Please wait for approval to access admin panel.' 
          }, { status: 403 });
        }

        // Update last login
        await vendorsCollection.updateOne(
          { _id: vendor._id },
          { $set: { lastLoginAt: new Date() } }
        );

        // Create JWT token for vendor with vendor role
        const token = generateToken({
          id: vendor._id.toString(),
          email: vendor.email,
          role: 'vendor', // Vendors get vendor role
          permissions: ['inventory'], // Vendors can only access inventory
          userType: 'vendor',
          businessName: vendor.businessName,
          verificationStatus: vendor.verificationStatus,
          serviceCategories: vendor.serviceCategories // Include permitted categories
        });

        // Generate refresh token (valid for 7 days)
        const refreshToken = generateToken({
          id: vendor._id.toString(),
          email: vendor.email,
          type: 'refresh'
        }, '7d');

        return NextResponse.json({
          message: 'Login successful',
          token,
          refreshToken,
          user: {
            _id: vendor._id.toString(),
            email: vendor.email,
            firstName: vendor.firstName,
            lastName: vendor.lastName,
            role: 'vendor',
            permissions: ['inventory'],
            isActive: vendor.accountStatus === 'active',
            businessName: vendor.businessName,
            verificationStatus: vendor.verificationStatus,
            userType: 'vendor',
            serviceCategories: vendor.serviceCategories
          }
        });
      }
    } else {
      // Check admin_users collection first for admin login
      const adminCollection = await getCollection('admin_users');
      const adminUser = await adminCollection.findOne({ email });

      if (adminUser) {
        // Handle admin user login
        if (!adminUser.isActive) {
          return NextResponse.json({ error: 'Account is deactivated. Please contact administrator.' }, { status: 401 });
        }

        const isMatch = await comparePassword(password, adminUser.password);

        if (!isMatch) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = generateToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions || [],
          userType: 'admin'
        });

        // Generate refresh token (valid for 7 days)
        const refreshToken = generateToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          type: 'refresh'
        }, '7d');

        // Update last login
        await adminCollection.updateOne(
          { _id: adminUser._id },
          { $set: { lastLogin: new Date() } }
        );

        return NextResponse.json({ 
          message: 'Login successful', 
          token,
          refreshToken,
          user: { 
            _id: adminUser._id.toString(), 
            email: adminUser.email, 
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role, 
            permissions: adminUser.permissions || [],
            isActive: adminUser.isActive,
            department: adminUser.department,
            phone: adminUser.phone,
            userType: 'admin'
          } 
        });
      }
    }

    // If not found in the expected collection, return error
    return NextResponse.json({ 
      error: userType === 'vendor' 
        ? 'No vendor account found with this email' 
        : 'No admin account found with this email' 
    }, { status: 401 });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
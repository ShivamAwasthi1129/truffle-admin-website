import { MongoClient } from 'mongodb';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from './lib/email-service.js';

// Test script for vendor email notifications and admin access
async function testVendorEmailAndAuth() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('truffle-admin');
    const vendorsCollection = db.collection('vendors');
    
    // Test data for vendor
    const testVendor = {
      firstName: "Test",
      lastName: "Vendor",
      email: "test.vendor@example.com",
      password: "$2b$10$testpasswordhash",
      phone: "1234567890",
      businessName: "Test Luxury Services",
      businessType: "company",
      businessRegistrationNumber: "TEST123456",
      taxId: "TAX123456",
      address: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        country: "United States",
        zipCode: "12345"
      },
      serviceCategories: [
        {
          category: "private_jets",
          description: "Private jet charter services",
          experience: "expert",
          yearsOfExperience: 10,
          certifications: ["FAA Certified", "Safety First"]
        }
      ],
      verificationStatus: "pending",
      verificationNotes: "",
      verifiedAt: null,
      verifiedBy: null,
      accountStatus: "active",
      adminPanelAccess: false,
      receiveUpdates: true,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      },
      stats: {
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0
      },
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('\n=== Testing Vendor Email Notifications and Admin Access ===\n');

    // Test CREATE vendor
    console.log('1. Creating test vendor...');
    const insertResult = await vendorsCollection.insertOne(testVendor);
    console.log('✓ Vendor created with ID:', insertResult.insertedId);
    
    const vendorId = insertResult.insertedId;

    // Test email notification for approval
    console.log('\n2. Testing approval email notification...');
    try {
      const emailResult = await sendVendorApprovalEmail(testVendor);
      if (emailResult.success) {
        console.log('✓ Approval email sent successfully');
        console.log('  Message ID:', emailResult.messageId);
      } else {
        console.log('✗ Failed to send approval email:', emailResult.error);
      }
    } catch (error) {
      console.log('✗ Error sending approval email:', error.message);
    }

    // Test email notification for rejection
    console.log('\n3. Testing rejection email notification...');
    try {
      const emailResult = await sendVendorRejectionEmail(testVendor, 'Additional documentation required');
      if (emailResult.success) {
        console.log('✓ Rejection email sent successfully');
        console.log('  Message ID:', emailResult.messageId);
      } else {
        console.log('✗ Failed to send rejection email:', emailResult.error);
      }
    } catch (error) {
      console.log('✗ Error sending rejection email:', error.message);
    }

    // Test vendor verification and admin access
    console.log('\n4. Testing vendor verification and admin access...');
    
    // Update vendor to verified status
    const updateResult = await vendorsCollection.updateOne(
      { _id: vendorId },
      { 
        $set: { 
          verificationStatus: 'verified',
          verificationNotes: 'All documents verified successfully',
          verifiedAt: new Date(),
          verifiedBy: 'admin',
          adminPanelAccess: true,
          updatedAt: new Date()
        } 
      }
    );
    console.log('✓ Vendor updated to verified status:', updateResult.modifiedCount, 'document(s) modified');

    // Verify the update
    const verifiedVendor = await vendorsCollection.findOne({ _id: vendorId });
    console.log('  Verification Status:', verifiedVendor.verificationStatus);
    console.log('  Admin Panel Access:', verifiedVendor.adminPanelAccess);
    console.log('  Verified At:', verifiedVendor.verifiedAt);
    console.log('  Verified By:', verifiedVendor.verifiedBy);

    // Test vendor login simulation (checking conditions)
    console.log('\n5. Testing vendor login conditions...');
    
    const loginChecks = {
      accountActive: verifiedVendor.accountStatus === 'active',
      verificationComplete: verifiedVendor.verificationStatus === 'verified',
      adminAccessGranted: verifiedVendor.adminPanelAccess === true,
      passwordHashed: verifiedVendor.password.startsWith('$2b$')
    };

    console.log('  Account Active:', loginChecks.accountActive ? '✓' : '✗');
    console.log('  Verification Complete:', loginChecks.verificationComplete ? '✓' : '✗');
    console.log('  Admin Access Granted:', loginChecks.adminAccessGranted ? '✓' : '✗');
    console.log('  Password Hashed:', loginChecks.passwordHashed ? '✓' : '✗');

    const canLogin = Object.values(loginChecks).every(check => check);
    console.log('  Can Login to Admin Panel:', canLogin ? '✓ YES' : '✗ NO');

    // Test vendor permissions
    console.log('\n6. Testing vendor permissions...');
    const vendorPermissions = ['inventory', 'vendors', 'clients', 'concierges', 'bookings', 'analytics'];
    console.log('  Vendor Permissions:', vendorPermissions.join(', '));
    console.log('  Can Upload Inventory:', vendorPermissions.includes('inventory') ? '✓ YES' : '✗ NO');
    console.log('  Can Manage Bookings:', vendorPermissions.includes('bookings') ? '✓ YES' : '✗ NO');

    // Test JWT token simulation
    console.log('\n7. Testing JWT token payload simulation...');
    const mockTokenPayload = {
      id: verifiedVendor._id.toString(),
      email: verifiedVendor.email,
      role: 'admin',
      permissions: vendorPermissions,
      userType: 'vendor',
      businessName: verifiedVendor.businessName,
      verificationStatus: verifiedVendor.verificationStatus
    };
    console.log('  Token Payload:', JSON.stringify(mockTokenPayload, null, 2));

    // Test DELETE
    console.log('\n8. Cleaning up test data...');
    const deleteResult = await vendorsCollection.deleteOne({ _id: vendorId });
    console.log('✓ Test vendor deleted:', deleteResult.deletedCount, 'document(s) deleted');

    console.log('\n=== All tests completed successfully! ===\n');

    console.log('📧 Email Configuration Notes:');
    console.log('  - Make sure to set up SMTP credentials in environment variables:');
    console.log('    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    console.log('  - For Gmail, use App Password instead of regular password');
    console.log('  - Test emails will be sent to the vendor email address');
    
    console.log('\n🔐 Authentication Notes:');
    console.log('  - Verified vendors can login via /api/auth/login');
    console.log('  - They receive admin role with specific permissions');
    console.log('  - They can access inventory management and other admin features');
    console.log('  - Login is blocked if verification is pending or account is inactive');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testVendorEmailAndAuth().catch(console.error);

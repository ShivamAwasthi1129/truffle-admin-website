import { MongoClient } from 'mongodb';

// Test script for vendor CRUD operations
async function testVendorCRUD() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('truffle-admin');
    const vendorsCollection = db.collection('vendors');
    
    // Test data
    const testVendor = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@test.com",
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

    console.log('\n=== Testing Vendor CRUD Operations ===\n');

    // Test CREATE
    console.log('1. Testing CREATE operation...');
    const insertResult = await vendorsCollection.insertOne(testVendor);
    console.log('✓ Vendor created with ID:', insertResult.insertedId);
    
    const vendorId = insertResult.insertedId;

    // Test READ
    console.log('\n2. Testing READ operation...');
    const foundVendor = await vendorsCollection.findOne({ _id: vendorId });
    if (foundVendor) {
      console.log('✓ Vendor found:', foundVendor.firstName, foundVendor.lastName);
      console.log('  Business:', foundVendor.businessName);
      console.log('  Email:', foundVendor.email);
      console.log('  Verification Status:', foundVendor.verificationStatus);
    } else {
      console.log('✗ Vendor not found');
    }

    // Test UPDATE
    console.log('\n3. Testing UPDATE operation...');
    const updateResult = await vendorsCollection.updateOne(
      { _id: vendorId },
      { 
        $set: { 
          verificationStatus: 'verified',
          verificationNotes: 'All documents verified successfully',
          verifiedAt: new Date(),
          verifiedBy: 'admin',
          updatedAt: new Date()
        } 
      }
    );
    console.log('✓ Vendor updated:', updateResult.modifiedCount, 'document(s) modified');

    // Verify update
    const updatedVendor = await vendorsCollection.findOne({ _id: vendorId });
    console.log('  New verification status:', updatedVendor.verificationStatus);
    console.log('  Verification notes:', updatedVendor.verificationNotes);

    // Test READ ALL with filters
    console.log('\n4. Testing READ ALL with filters...');
    const allVendors = await vendorsCollection.find({}).toArray();
    console.log('✓ Total vendors in database:', allVendors.length);

    const verifiedVendors = await vendorsCollection.find({ verificationStatus: 'verified' }).toArray();
    console.log('✓ Verified vendors:', verifiedVendors.length);

    const activeVendors = await vendorsCollection.find({ accountStatus: 'active' }).toArray();
    console.log('✓ Active vendors:', activeVendors.length);

    // Test search functionality
    console.log('\n5. Testing search functionality...');
    const searchResults = await vendorsCollection.find({
      $or: [
        { firstName: { $regex: 'John', $options: 'i' } },
        { lastName: { $regex: 'Doe', $options: 'i' } },
        { businessName: { $regex: 'Test', $options: 'i' } }
      ]
    }).toArray();
    console.log('✓ Search results for "John/Doe/Test":', searchResults.length);

    // Test service category filtering
    console.log('\n6. Testing service category filtering...');
    const jetVendors = await vendorsCollection.find({
      'serviceCategories.category': 'private_jets'
    }).toArray();
    console.log('✓ Vendors offering private jets:', jetVendors.length);

    // Test DELETE
    console.log('\n7. Testing DELETE operation...');
    const deleteResult = await vendorsCollection.deleteOne({ _id: vendorId });
    console.log('✓ Vendor deleted:', deleteResult.deletedCount, 'document(s) deleted');

    // Verify deletion
    const deletedVendor = await vendorsCollection.findOne({ _id: vendorId });
    if (!deletedVendor) {
      console.log('✓ Vendor successfully removed from database');
    } else {
      console.log('✗ Vendor still exists in database');
    }

    console.log('\n=== All CRUD operations completed successfully! ===\n');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testVendorCRUD().catch(console.error);

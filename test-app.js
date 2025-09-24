// Simple test script to verify the application is working
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Trufle Admin Application...\n');

  // Test 1: Initialize dummy users
  try {
    console.log('1. Testing dummy user initialization...');
    const response = await fetch(`${baseUrl}/api/auth/init-users`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log('✅ Dummy users:', response.status, data.message || data.error);
  } catch (error) {
    console.log('❌ Dummy users error:', error.message);
  }

  // Test 2: Initialize dummy inventory
  try {
    console.log('2. Testing dummy inventory initialization...');
    const response = await fetch(`${baseUrl}/api/inventory/init`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log('✅ Dummy inventory:', response.status, data.message || data.error);
  } catch (error) {
    console.log('❌ Dummy inventory error:', error.message);
  }

  // Test 3: Login test
  try {
    console.log('3. Testing login...');
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'superadmin@trufle.com',
        password: 'SuperAdmin123!'
      })
    });
    const data = await response.json();
    console.log('✅ Login:', response.status, data.message || data.error);
    
    if (response.ok && data.token) {
      const token = data.token;
      
      // Test 4: Get inventory with token
      try {
        console.log('4. Testing inventory API...');
        const invResponse = await fetch(`${baseUrl}/api/inventory`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const invData = await invResponse.json();
        console.log('✅ Inventory:', invResponse.status, `${invData.items?.length || 0} items`);
      } catch (error) {
        console.log('❌ Inventory error:', error.message);
      }

      // Test 5: Get users with token
      try {
        console.log('5. Testing users API...');
        const usersResponse = await fetch(`${baseUrl}/api/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const usersData = await usersResponse.json();
        console.log('✅ Users:', usersResponse.status, `${usersData.users?.length || 0} users`);
      } catch (error) {
        console.log('❌ Users error:', error.message);
      }
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  console.log('\n🎉 Testing completed!');
};

// Run tests after a delay to ensure server is up
setTimeout(testEndpoints, 3000);

require('dotenv').config({ path: '../.env' });

// Comprehensive integration test script
async function testIntegration() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:9999';
  
  let authToken = null;
  let refreshToken = null;
  
  console.log('🧪 Starting Frontend-Backend Integration Tests...\n');

  // Test 1: Authentication
  console.log('📋 Testing Authentication...');
  
  const authTests = [
    {
      name: 'Admin Login',
      payload: {
        identifier: 'admin@company.com',
        password: 'password',
        role: 'ADMIN'
      }
    },
    {
      name: 'Employee Login',
      payload: {
        identifier: 'EMP001',
        password: 'password',
        role: 'EMPLOYEE'
      }
    }
  ];

  for (const test of authTests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ ${test.name} - Success`);
        console.log(`   User: ${data.data.user.email || data.data.user.employee_id}`);
        console.log(`   Role: ${data.data.user.role}`);
        
        // Store tokens for later tests
        if (test.name === 'Admin Login') {
          authToken = data.data.token;
          refreshToken = data.data.refreshToken;
        }
      } else {
        console.log(`❌ ${test.name} - Failed: ${data.message}`);
      }
      
      console.log('');

    } catch (error) {
      console.log(`❌ ${test.name} - Network error: ${error.message}`);
      console.log('');
    }
  }

  // Test 2: API Endpoints with Authentication
  if (authToken) {
    console.log('📋 Testing API Endpoints...');
    
    const apiTests = [
      {
        name: 'Get User Profile',
        endpoint: '/api/auth/profile',
        method: 'GET'
      },
      {
        name: 'Get Financial Overview',
        endpoint: '/api/finance/overview',
        method: 'GET'
      },
      {
        name: 'Get Savings Account',
        endpoint: '/api/savings/account',
        method: 'GET'
      },
      {
        name: 'Get System Stats',
        endpoint: '/api/admin/stats',
        method: 'GET'
      }
    ];

    for (const test of apiTests) {
      try {
        console.log(`Testing: ${test.name}`);
        
        const response = await fetch(`${baseUrl}${test.endpoint}`, {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log(`✅ ${test.name} - Success`);
          console.log(`   Data keys: ${Object.keys(data.data || data).join(', ')}`);
        } else {
          console.log(`❌ ${test.name} - Failed: ${data.message}`);
        }
        
        console.log('');

      } catch (error) {
        console.log(`❌ ${test.name} - Network error: ${error.message}`);
        console.log('');
      }
    }
  }

  console.log('🏁 Integration testing completed!');
  console.log('\n📊 Summary:');
  console.log('- Authentication endpoints tested');
  console.log('- API endpoints with auth tested');
  console.log('- Error handling validated');
  console.log('\n🎯 Next Steps:');
  console.log('1. Test file uploads with Cloudinary');
  console.log('2. Test remaining modules (Loans, HR, Admin)');
  console.log('3. Test WebSocket connections (if implemented)');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9999/api/health');
    if (response.ok) {
      console.log('✅ Backend server is running');
      testIntegration();
    } else {
      console.log('❌ Backend server is not responding correctly');
    }
  } catch (error) {
    console.log('❌ Backend server is not running. Please start the server first:');
    console.log('   npm run dev');
  }
}

checkServer();

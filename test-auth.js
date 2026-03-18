require('dotenv').config({ path: '../.env' });

// Test the new authentication system
async function testAuth() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:9999';
  
  const testCases = [
    {
      name: 'Admin Login',
      payload: {
        identifier: 'admin@company.com',
        password: 'password',
        role: 'ADMIN'
      }
    },
    {
      name: 'HR Login',
      payload: {
        identifier: 'hr@company.com',
        password: 'password',
        role: 'HR'
      }
    },
    {
      name: 'Finance Login',
      payload: {
        identifier: 'finance@company.com',
        password: 'password',
        role: 'FINANCE'
      }
    },
    {
      name: 'Loan Committee Login',
      payload: {
        identifier: 'loan@company.com',
        password: 'password',
        role: 'LOAN_COMMITTEE'
      }
    },
    {
      name: 'Employee Login',
      payload: {
        identifier: 'EMP001',
        password: 'password',
        role: 'EMPLOYEE'
      }
    },
    {
      name: 'Invalid Employee Login',
      payload: {
        identifier: 'EMP001',
        password: 'wrongpassword',
        role: 'EMPLOYEE'
      },
      expectError: true
    },
    {
      name: 'Invalid Admin Login',
      payload: {
        identifier: 'admin@company.com',
        password: 'wrongpassword',
        role: 'ADMIN'
      },
      expectError: true
    },
    {
      name: 'Role Mismatch',
      payload: {
        identifier: 'admin@company.com',
        password: 'password',
        role: 'EMPLOYEE'
      },
      expectError: true
    }
  ];

  console.log('🧪 Testing Authentication System...\n');

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });

      const data = await response.json();

      if (testCase.expectError) {
        if (!response.ok) {
          console.log(`✅ ${testCase.name} - Correctly rejected: ${data.message}`);
        } else {
          console.log(`❌ ${testCase.name} - Should have failed but succeeded`);
        }
      } else {
        if (response.ok && data.success) {
          console.log(`✅ ${testCase.name} - Success`);
          console.log(`   User: ${data.data.user.email || data.data.user.employee_id}`);
          console.log(`   Role: ${data.data.user.role}`);
        } else {
          console.log(`❌ ${testCase.name} - Failed: ${data.message}`);
        }
      }
      
      console.log('');

    } catch (error) {
      console.log(`❌ ${testCase.name} - Network error: ${error.message}`);
      console.log('');
    }
  }

  console.log('🏁 Authentication testing completed!');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9999/api/health');
    if (response.ok) {
      console.log('✅ Server is running');
      testAuth();
    } else {
      console.log('❌ Server is not responding correctly');
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
  }
}

checkServer();

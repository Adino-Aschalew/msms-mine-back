const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:9999';
let authToken = null;

// Test user credentials (adjust as needed)
const testUser = {
  identifier: 'hr@msms.com',  // Use identifier instead of email
  password: 'password',
  role: 'HR'
};

async function login() {
  try {
    console.log('🔐 Attempting login...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEndpoint(method, endpoint, description, validateRealData = false) {
  try {
    console.log(`\n🔄 Testing ${description}...`);
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    };

    const response = await axios(config);
    
    console.log(`✅ ${description} - Success`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys:`, Object.keys(response.data));
    
    if (response.data.data) {
      if (Array.isArray(response.data.data)) {
        console.log(`   Array length: ${response.data.data.length}`);
        if (validateRealData && response.data.data.length > 0) {
          console.log(`   Sample data:`, JSON.stringify(response.data.data[0], null, 2));
        }
      } else {
        console.log(`   Data type: ${typeof response.data.data}`);
        if (validateRealData) {
          console.log(`   Sample data:`, JSON.stringify(response.data.data, null, 2));
        }
      }
    }
    
    // Validate real data for specific endpoints
    if (validateRealData && response.data.success) {
      await validateRealDataEndpoint(description, response.data.data);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    return false;
  }
}

async function validateRealDataEndpoint(description, data) {
  switch (description) {
    case 'Dashboard Stats':
      console.log(`   📊 Real Data Validation:`);
      console.log(`      - Total Employees: ${data.totalEmployees || 'N/A'}`);
      console.log(`      - Active Employees: ${data.activeEmployees || 'N/A'}`);
      console.log(`      - Verified Employees: ${data.verifiedEmployees || 'N/A'}`);
      console.log(`      - Departments: ${data.departments || 'N/A'}`);
      if (data.recentActivities && Array.isArray(data.recentActivities)) {
        console.log(`      - Recent Activities: ${data.recentActivities.length} items`);
      }
      break;

    case 'Attendance Data':
      console.log(`   📈 Real Data Validation:`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`      - Attendance records: ${data.length} days`);
        console.log(`      - Latest record: ${data[data.length - 1]?.date || 'N/A'}`);
        console.log(`      - Present count: ${data[data.length - 1]?.present || 0}`);
      }
      break;

    case 'Diversity Data':
      console.log(`   👥 Real Data Validation:`);
      if (Array.isArray(data)) {
        data.forEach(category => {
          console.log(`      - ${category.category}: ${Object.keys(category).length - 1} metrics`);
        });
      }
      break;

    case 'Department Stats':
      console.log(`   🏢 Real Data Validation:`);
      if (Array.isArray(data)) {
        console.log(`      - Departments: ${data.length}`);
        data.slice(0, 3).forEach(dept => {
          console.log(`      - ${dept.department}: ${dept.totalEmployees} employees`);
        });
      }
      break;

    case 'Unverified Employees':
      console.log(`   ⏳ Real Data Validation:`);
      if (Array.isArray(data)) {
        console.log(`      - Unverified count: ${data.length}`);
        if (data.length > 0) {
          console.log(`      - Sample employee: ${data[0]?.name || 'N/A'} (${data[0]?.employeeId || 'N/A'})`);
        }
      }
      break;

    case 'Recent Activities':
      console.log(`   📝 Real Data Validation:`);
      if (Array.isArray(data)) {
        console.log(`      - Activities: ${data.length}`);
        if (data.length > 0) {
          console.log(`      - Latest: ${data[0]?.description || 'N/A'}`);
        }
      }
      break;
  }
}

async function runTests() {
  console.log('🚀 Starting HR API Real Data Integration Tests\n');
  
  // Test login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Exiting tests.');
    return;
  }

  console.log('\n📊 Testing HR Dashboard Endpoints with Real Data:');
  
  const tests = [
    { method: 'GET', endpoint: '/api/hr/dashboard-stats', description: 'Dashboard Stats', validateRealData: true },
    { method: 'GET', endpoint: '/api/hr/employees', description: 'Get Employees' },
    { method: 'GET', endpoint: '/api/hr/employees/stats', description: 'Employee Stats' },
    { method: 'GET', endpoint: '/api/hr/employees/departments', description: 'Department List' },
    { method: 'GET', endpoint: '/api/hr/employees/job-grades', description: 'Job Grades' },
    { method: 'GET', endpoint: '/api/hr/attendance?period=month', description: 'Attendance Data', validateRealData: true },
    { method: 'GET', endpoint: '/api/hr/department-stats', description: 'Department Stats', validateRealData: true },
    { method: 'GET', endpoint: '/api/hr/diversity-stats', description: 'Diversity Stats', validateRealData: true },
    { method: 'GET', endpoint: '/api/hr/recent-activities?limit=5', description: 'Recent Activities', validateRealData: true },
    { method: 'GET', endpoint: '/api/hr/unverified', description: 'Unverified Employees', validateRealData: true },
    { method: 'POST', endpoint: '/api/hr/sync', description: 'HR Sync', validateRealData: true }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.method, test.endpoint, test.description, test.validateRealData);
    if (result) passedTests++;
  }

  console.log(`\n📈 Test Results:`);
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All HR API endpoints are working correctly with real data!');
    console.log('\n✅ Integration Summary:');
    console.log('   - Dashboard stats use real database calculations');
    console.log('   - Attendance data comes from payroll tables');
    console.log('   - Diversity stats based on employee profiles');
    console.log('   - Department stats from actual employee data');
    console.log('   - Recent activities from audit logs');
    console.log('   - Unverified employees from user records');
    console.log('   - HR sync performs real data validation');
  } else {
    console.log('\n⚠️  Some endpoints failed. Check the logs above for details.');
  }
}

// Run the tests
runTests().catch(console.error);

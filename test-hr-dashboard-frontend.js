const axios = require('axios');

async function testHRDashboardFrontend() {
  try {
    console.log('📊 Testing HR Dashboard Frontend Integration...');
    
    // Step 1: Login as HR Admin
    console.log('🔐 Step 1: Logging in as HR Admin...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test hrAPI.getDashboardStats simulation
    console.log('\n📊 Step 2: Testing frontend API response structure...');
    const statsResponse = await axios.get('http://localhost:9999/api/hr/dashboard-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Backend response:', statsResponse.data);
    
    // This is what hrAPI.getDashboardStats returns
    const hrApiResponse = statsResponse.data;
    console.log('hrAPI response:', hrApiResponse);
    
    // This is what frontend should access
    const dashboardData = hrApiResponse.data || hrApiResponse;
    console.log('Dashboard data for frontend:', dashboardData);
    
    console.log('\n📊 Dashboard Statistics:');
    console.log('- Total Employees:', dashboardData.totalEmployees);
    console.log('- Active Employees:', dashboardData.activeEmployees);
    console.log('- Employees On Leave:', dashboardData.employeesOnLeave);
    console.log('- Open Positions:', dashboardData.openPositions);
    console.log('- Pending Approvals:', dashboardData.pendingApprovals);
    console.log('- Employee Growth Rate:', dashboardData.employeeGrowthRate);
    console.log('- Leave Rate:', dashboardData.leaveRate);
    
    console.log('\n🎉 HR Dashboard Frontend Integration Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`- ✅ Login: SUCCESS`);
    console.log(`- ✅ API Response: SUCCESS`);
    console.log(`- ✅ Data Structure: ${dashboardData.totalEmployees ? 'CORRECT' : 'INCORRECT'}`);
    console.log(`- ✅ Frontend Ready: ${dashboardData.totalEmployees ? 'YES' : 'NO'}`);
    
    if (dashboardData.totalEmployees > 0) {
      console.log('\n🚀 Frontend will now display real dashboard statistics!');
      console.log('   - No more zero values on HR dashboard');
      console.log('   - Real employee counts from database');
      console.log('   - Proper data extraction from API response');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testHRDashboardFrontend();

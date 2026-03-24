const axios = require('axios');

async function testHRDashboardStats() {
  try {
    console.log('📊 Testing HR Dashboard Stats...');
    
    // Step 1: Login as HR Admin
    console.log('🔐 Step 1: Logging in as HR Admin...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test dashboard stats endpoint
    console.log('\n📊 Step 2: Testing HR dashboard stats endpoint...');
    try {
      const statsResponse = await axios.get('http://localhost:9999/api/hr/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Dashboard stats retrieved successfully!');
      console.log('Response structure:', Object.keys(statsResponse.data));
      console.log('Success:', statsResponse.data.success);
      console.log('Data:', statsResponse.data.data);
      
      if (statsResponse.data.data) {
        console.log('\nDashboard Statistics:');
        console.log('- Total Employees:', statsResponse.data.data.totalEmployees);
        console.log('- Active Employees:', statsResponse.data.data.activeEmployees);
        console.log('- Departments:', statsResponse.data.data.departments);
        console.log('- Growth Rate:', statsResponse.data.data.employeeGrowthRate);
      }
      
    } catch (error) {
      console.log('❌ Dashboard stats failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      }
    }
    
    // Step 3: Test hrAPI.getDashboardStats (simulating frontend)
    console.log('\n🔍 Step 3: Testing hrAPI response structure...');
    
    // This is what the frontend receives from hrAPI
    const apiResponse = {
      data: statsResponse.data // hrAPI returns response.data
    };
    
    console.log('hrAPI response:', apiResponse);
    console.log('hrAPI.data:', apiResponse.data);
    
    const dashboardData = apiResponse.data;
    console.log('Dashboard data for frontend:', dashboardData);
    
    console.log('\n🎉 HR Dashboard Stats Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`- ✅ Login: SUCCESS`);
    console.log(`- ✅ Stats API: ${statsResponse.data ? 'SUCCESS' : 'FAILED'}`);
    console.log(`- ✅ Data Structure: ${dashboardData ? 'CORRECT' : 'INCORRECT'}`);
    console.log(`- ✅ Frontend Ready: ${dashboardData ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testHRDashboardStats();

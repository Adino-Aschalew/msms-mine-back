const axios = require('axios');

async function testServerHealth() {
  try {
    console.log('🔍 Testing server health...');
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('http://localhost:9999/api/health');
      console.log('✅ Server is running!');
      console.log('Health:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }
    
    // Test login
    try {
      const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
        identifier: 'hr@msms.com',
        password: 'password',
        role: 'HR'
      });
      
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Test dashboard stats (this was working before)
      try {
        const dashboardResponse = await axios.get('http://localhost:9999/api/hr/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Dashboard stats working!');
        console.log('Dashboard data keys:', Object.keys(dashboardResponse.data.data));
      } catch (dashboardError) {
        console.log('❌ Dashboard stats failed:', dashboardError.response?.data?.message);
      }
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.message);
    }
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
}

testServerHealth();

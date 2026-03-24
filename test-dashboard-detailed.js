const axios = require('axios');

async function testDashboardDetailed() {
  try {
    console.log('🔄 Testing dashboard with detailed response...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Get dashboard data
    const response = await axios.get('http://localhost:9999/api/hr/dashboard-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n📊 Dashboard Response:');
    console.log('Success:', response.data.success);
    console.log('Data keys:', Object.keys(response.data.data || {}));
    console.log('Full data:', JSON.stringify(response.data.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testDashboardDetailed();

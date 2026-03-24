const axios = require('axios');

const API_BASE_URL = 'http://localhost:9999';

async function testDashboardEndpoint() {
  try {
    // First login
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test dashboard endpoint with detailed error handling
    console.log('\n🔄 Testing dashboard endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/api/hr/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(error => {
      console.log('❌ Dashboard Error Details:');
      console.log('   Status:', error.response?.status);
      console.log('   Status Text:', error.response?.statusText);
      console.log('   Error Message:', error.response?.data?.message);
      console.log('   Full Error:', error.response?.data);
      
      if (error.response?.data?.stack) {
        console.log('   Stack Trace:', error.response?.data?.stack);
      }
      
      throw error;
    });
    
    console.log('✅ Dashboard endpoint working!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testDashboardEndpoint();

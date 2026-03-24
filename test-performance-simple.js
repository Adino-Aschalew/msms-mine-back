const axios = require('axios');

async function testPerformanceEndpoints() {
  try {
    console.log('🚀 Testing Performance Endpoints...');
    
    // Test login first
    console.log('🔐 Logging in...');
    try {
      const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
        identifier: 'hr@msms.com',
        password: 'password',
        role: 'HR'
      });
      
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      
      // Test performance stats endpoint
      console.log('\n📊 Testing Performance Stats...');
      const statsResponse = await axios.get('http://localhost:9999/api/hr/performance-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Performance Stats - Success');
      console.log('Data keys:', Object.keys(statsResponse.data.data));
      console.log('Sample data:', JSON.stringify(statsResponse.data.data, null, 2));
      
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testPerformanceEndpoints();

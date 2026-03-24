const axios = require('axios');

async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    
    // Test basic health endpoint
    const response = await axios.get('http://localhost:9999/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Server is running!');
    console.log('Health check response:', response.data);
    
    // Test dashboard endpoint
    try {
      const dashboardResponse = await axios.post('http://localhost:9999/api/auth/login', {
        identifier: 'hr@msms.com',
        password: 'password',
        role: 'HR'
      }, {
        timeout: 5000
      });
      
      console.log('✅ Login successful');
      
      const token = dashboardResponse.data.data.token;
      
      const statsResponse = await axios.get('http://localhost:9999/api/hr/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      
      console.log('✅ Dashboard stats working!');
      console.log('Data keys:', Object.keys(statsResponse.data.data));
      
    } catch (error) {
      console.log('❌ Dashboard endpoint error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('   Error code:', error.code);
    console.log('   Is server running on port 9999?');
  }
}

testServerConnection();

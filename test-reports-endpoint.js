const axios = require('axios');

async function testReportsEndpoint() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    console.log('\n📊 Testing Reports Endpoint...');
    
    try {
      const reportsResponse = await axios.get('http://localhost:9999/api/hr/reports?reportType=payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Reports Success!');
      console.log('Reports data:', reportsResponse.data.data);
      
    } catch (error) {
      console.log('❌ Reports Failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

testReportsEndpoint();

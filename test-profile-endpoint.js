const axios = require('axios');

async function testProfileEndpoint() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    console.log('\n👤 Testing Profile Endpoint...');
    
    try {
      const profileResponse = await axios.get('http://localhost:9999/api/hr/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile Success!');
      console.log('User data:', profileResponse.data.data.user);
      
    } catch (error) {
      console.log('❌ Profile Failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message);
      console.log('Stack:', error.stack);
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

testProfileEndpoint();

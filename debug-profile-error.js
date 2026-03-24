const axios = require('axios');

async function debugProfileError() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('User ID:', loginResponse.data.data.user.id);
    
    console.log('\n👤 Testing Profile Endpoint...');
    
    try {
      const profileResponse = await axios.get('http://localhost:9999/api/hr/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile Success!');
      console.log('User data:', JSON.stringify(profileResponse.data.data, null, 2));
      
    } catch (error) {
      console.log('❌ Profile Failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message);
      console.log('Full error:', error.response?.data);
      
      // Try to get user info directly
      console.log('\n🔍 Testing direct user info...');
      try {
        const userInfoResponse = await axios.get('http://localhost:9999/api/hr/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Employees endpoint works!');
        console.log('Employees data:', userInfoResponse.data.data);
      } catch (empError) {
        console.log('❌ Employees endpoint also failed:', empError.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

debugProfileError();

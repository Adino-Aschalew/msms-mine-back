const axios = require('axios');

async function testReportsAndAccountIntegration() {
  try {
    console.log('🚀 Testing Reports and Account Integration...');
    
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test reports endpoint
    console.log('\n📊 Testing Reports Data...');
    try {
      const reportsResponse = await axios.get('http://localhost:9999/api/hr/reports?reportType=payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Reports Data - Success');
      console.log('Data keys:', Object.keys(reportsResponse.data.data));
      console.log('Sample data:', JSON.stringify(reportsResponse.data.data, null, 2));
    } catch (error) {
      console.log('❌ Reports Data - Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    // Test user profile endpoint
    console.log('\n👤 Testing User Profile...');
    try {
      const profileResponse = await axios.get('http://localhost:9999/api/hr/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ User Profile - Success');
      console.log('Data keys:', Object.keys(profileResponse.data.data));
      console.log('User data:', JSON.stringify(profileResponse.data.data.user, null, 2));
    } catch (error) {
      console.log('❌ User Profile - Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Integration test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testReportsAndAccountIntegration();

const axios = require('axios');

async function testProfileIntegration() {
  try {
    console.log('👤 Testing Profile Page Integration...');
    
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test user profile endpoint
    console.log('\n👤 Testing User Profile...');
    try {
      const profileResponse = await axios.get('http://localhost:9999/api/hr/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ User Profile - Success');
      console.log('Profile data:');
      console.log('  User:', profileResponse.data.data.user);
      console.log('  Login Activity:', profileResponse.data.data.loginActivity);
      
      // Test profile update
      console.log('\n✏️ Testing Profile Update...');
      const updateResponse = await axios.put('http://localhost:9999/api/hr/profile', {
        first_name: 'Updated',
        last_name: 'Name',
        phone: '+1234567890',
        address: 'Updated Address'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile Update - Success');
      console.log('Update response:', updateResponse.data);
      
      // Test reports endpoint
      console.log('\n📊 Testing Reports...');
      const reportsResponse = await axios.get('http://localhost:9999/api/hr/reports?reportType=payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Reports - Success');
      console.log('Reports data keys:', Object.keys(reportsResponse.data.data));
      
    } catch (error) {
      console.log('❌ Profile/Reports Test Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Profile integration test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testProfileIntegration();

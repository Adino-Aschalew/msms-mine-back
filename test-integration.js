const api = require('./frontend/src/services/api');

// Test the backend integration
async function testBackendIntegration() {
  console.log('Testing Backend Integration...\n');
  
  try {
    // Test registration
    console.log('1. Testing Registration...');
    const registerResponse = await api.post('/auth/register', {
      employee_id: 'EMP001',
      username: 'testuser',
      password: 'Password123',
      confirm_password: 'Password123'
    });
    
    console.log('✅ Registration Response:', JSON.stringify(registerResponse.data, null, 2));
    
    // Test login with the registered user
    console.log('\n2. Testing Login...');
    const loginResponse = await api.post('/auth/login', {
      employee_id: 'EMP001',
      password: 'Password123'
    });
    
    console.log('✅ Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.success && loginResponse.data.data.token) {
      console.log('\n🎉 Integration successful! Token received:', loginResponse.data.data.token.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testBackendIntegration().catch(console.error);

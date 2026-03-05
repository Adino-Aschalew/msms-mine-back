const axios = require('axios');

// Test registration with the new flow
async function testRegistration() {
  const baseURL = 'http://localhost:9999/api/auth';
  
  // Test case 1: Register with valid employee ID (EMP001)
  console.log('Testing registration with valid employee ID...');
  try {
    const response = await axios.post(`${baseURL}/register`, {
      employee_id: 'EMP001',
      username: 'johndoe',
      password: 'Password123',
      confirm_password: 'Password123'
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 2: Register with invalid employee ID
  console.log('Testing registration with invalid employee ID...');
  try {
    const response = await axios.post(`${baseURL}/register`, {
      employee_id: 'INVALID123',
      username: 'invaliduser',
      password: 'Password123',
      confirm_password: 'Password123'
    });
    
    console.log('❌ This should have failed!');
  } catch (error) {
    console.log('✅ Correctly rejected invalid employee:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 3: Register with missing fields
  console.log('Testing registration with missing fields...');
  try {
    const response = await axios.post(`${baseURL}/register`, {
      employee_id: 'EMP002',
      username: 'janesmith'
      // Missing password and confirm_password
    });
    
    console.log('❌ This should have failed!');
  } catch (error) {
    console.log('✅ Correctly rejected incomplete data:', error.response?.data || error.message);
  }
}

// Run the test
testRegistration().catch(console.error);

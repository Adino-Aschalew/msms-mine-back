const axios = require('axios');

async function testEmployeeCreation() {
  try {
    console.log('👤 Testing Employee Creation...');
    
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test employee creation
    console.log('\n👤 Creating new employee...');
    const newEmployee = {
      employeeId: `TEST${Date.now()}`,
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe${Date.now()}@test.com`,
      phone: '+1234567890',
      department: 'Engineering',
      role: 'EMPLOYEE',
      type: 'Full-time',
      salary: '60000',
      address: '123 Test Street',
      emergencyContact: 'Jane Doe - +1234567891',
      joinDate: '2026-03-24',
      status: 'Active'
    };
    
    try {
      const response = await axios.post('http://localhost:9999/api/hr/employees', newEmployee, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Employee created successfully!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.log('❌ Employee creation failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message);
      console.log('Details:', error.response?.data);
    }
    
    // Test reports endpoint
    console.log('\n📊 Testing Reports Endpoint...');
    try {
      const reportsResponse = await axios.get('http://localhost:9999/api/hr/reports?reportType=payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Reports working!');
      console.log('Data keys:', Object.keys(reportsResponse.data.data));
      
    } catch (error) {
      console.log('❌ Reports failed:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Employee creation test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testEmployeeCreation();

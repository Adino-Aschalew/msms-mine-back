const UserService = require('./src/modules/users/user.service');

async function debugUserCreation() {
  try {
    console.log('🔍 Debugging user creation...');
    
    const userData = {
      employee_id: 'EMP007',
      username: 'debuguser',
      email: 'debuguser@company.com',
      password: 'password123',
      role: 'EMPLOYEE'
    };
    
    const profileData = {
      first_name: 'Debug',
      last_name: 'User',
      phone: '+1234567890',
      address: '123 Debug St',
      department: 'IT',
      job_grade: 'A1',
      employment_status: 'ACTIVE'
    };
    
    console.log('User data:', userData);
    console.log('Profile data:', profileData);
    
    // Test the service directly
    const result = await UserService.createUser(userData, profileData, '127.0.0.1', 'debug-test');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugUserCreation();

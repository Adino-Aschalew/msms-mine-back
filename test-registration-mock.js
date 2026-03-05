const HrService = require('./src/modules/hr/hr.service');

// Mock the database query function
const mockQuery = async (query, params) => {
  console.log('Mock DB Query:', query);
  console.log('Mock Params:', params);
  
  if (query.includes('INSERT INTO users')) {
    return { insertId: 123 };
  }
  
  if (query.includes('INSERT INTO employee_profiles')) {
    return { insertId: 456 };
  }
  
  if (query.includes('SELECT') && query.includes('employee_id = ?')) {
    // Return empty array for user lookup (user doesn't exist yet)
    return [];
  }
  
  return [];
};

// Test the registration flow with mocked database
async function testRegistrationWithMockDB() {
  console.log('Testing Registration Flow with Mock Database...\n');
  
  // Temporarily replace the query function
  const originalQuery = require('./src/config/database').query;
  require('./src/config/database').query = mockQuery;
  
  const AuthService = require('./src/modules/auth/auth.service');
  
  try {
    console.log('1. Testing registration with valid employee (EMP001):');
    const result = await AuthService.register({
      employee_id: 'EMP001',
      username: 'johndoe',
      password: 'Password123',
      confirm_password: 'Password123'
    }, '127.0.0.1', 'Test-Agent');
    
    console.log('✅ Registration successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
    console.log('Stack:', error.stack);
  }
  
  // Restore original query function
  require('./src/config/database').query = originalQuery;
}

testRegistrationWithMockDB().catch(console.error);

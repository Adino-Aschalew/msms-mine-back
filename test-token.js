const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testToken() {
  try {
    console.log('🔍 Testing JWT token creation and decoding...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
    
    // Create a test token like the auth service does
    const token = jwt.sign(
      { userId: 1, employee_id: 'ADMIN001', role: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('✅ Token created:', token.substring(0, 50) + '...');
    
    // Decode the token like the auth middleware does
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:');
    console.log('User ID:', decoded.userId);
    console.log('Employee ID:', decoded.employee_id);
    console.log('Role:', decoded.role);
    
    // Test role middleware logic
    const allowedRoles = ['ADMIN', 'HR'];
    const hasPermission = allowedRoles.includes(decoded.role);
    console.log('Has ADMIN/HR permission:', hasPermission ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testToken();

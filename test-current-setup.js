const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { query } = require('./src/config/database');

async function testCurrentSetup() {
  try {
    console.log('🔍 Testing current setup...');
    
    // 1. Check current user in database
    const [user] = await query(
      'SELECT id, employee_id, username, role FROM users WHERE employee_id = ?',
      ['ADMIN001']
    );
    
    console.log('Database user:', user[0]);
    
    // 2. Create token with current role
    const token = jwt.sign(
      { userId: user[0].id, employee_id: user[0].employee_id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('Token created with role:', user[0].role);
    
    // 3. Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token role:', decoded.role);
    
    // 4. Test role middleware logic
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR'];
    const hasPermission = allowedRoles.includes(decoded.role);
    console.log('Has permission for users endpoint:', hasPermission ? '✅ YES' : '❌ NO');
    
    // 5. Test what the auth middleware would extract
    console.log('Auth middleware would see:');
    console.log('- userId:', decoded.userId);
    console.log('- employee_id:', decoded.employee_id);
    console.log('- role:', decoded.role);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCurrentSetup();

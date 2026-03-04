const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { query } = require('./src/config/database');

async function testHRAccess() {
  try {
    console.log('🔍 Testing HR access...');
    
    // 1. Get current user from database (like auth middleware does)
    const [user] = await query(
      `SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade 
       FROM users u 
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
       WHERE u.id = ? AND u.is_active = true`,
      [1]
    );
    
    console.log('Auth middleware would load this user:', user[0]);
    console.log('User role from database:', user[0].role);
    
    // 2. Test HR role middleware logic
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR'];
    const hasPermission = allowedRoles.includes(user[0].role);
    console.log('Has HR permission:', hasPermission ? '✅ YES' : '❌ NO');
    
    // 3. Create a fresh token to test
    const token = jwt.sign(
      { userId: user[0].id, employee_id: user[0].employee_id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('Fresh token created:', token.substring(0, 50) + '...');
    console.log('Use this token in Postman for HR endpoints');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHRAccess();

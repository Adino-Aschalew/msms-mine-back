const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { query } = require('./src/config/database');

async function testAuthMiddleware() {
  try {
    console.log('🔍 Testing auth middleware logic...');
    
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
    
    // 2. Test role middleware logic
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR'];
    const hasPermission = allowedRoles.includes(user[0].role);
    console.log('Role middleware check:', hasPermission ? '✅ PASS' : '❌ FAIL');
    
    if (!hasPermission) {
      console.log('❌ This is why you get "Access denied. Insufficient permissions."');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthMiddleware();

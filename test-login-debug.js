const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { query } = require('./src/config/database');

async function testLogin() {
  try {
    console.log('🔍 Testing login process...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
    console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
    console.log('JWT_REFRESH_EXPIRES_IN:', process.env.JWT_REFRESH_EXPIRES_IN);
    
    // Test user lookup
    console.log('\n👤 Testing user lookup...');
    const user = await query(
      'SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id WHERE u.employee_id = ?',
      ['ADMIN001']
    );
    
    if (user.length > 0) {
      console.log('✅ User found:', user[0].employee_id);
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('admin123', user[0].password_hash);
      console.log('Password verification:', isValidPassword ? '✅ PASSED' : '❌ FAILED');
      
      if (isValidPassword) {
        // Test JWT token creation
        console.log('\n🔑 Testing JWT creation...');
        const token = jwt.sign(
          { userId: user[0].id, employee_id: user[0].employee_id, role: user[0].role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        console.log('✅ Token created successfully');
        console.log('Token:', token.substring(0, 50) + '...');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();

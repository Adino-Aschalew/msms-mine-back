const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { query } = require('./src/config/database');

async function testFullLogin() {
  try {
    console.log('🔍 Testing full login process...');
    
    // Test user lookup exactly like auth service
    const user = await query(
      'SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id WHERE u.employee_id = ?',
      ['ADMIN001']
    );
    
    if (user.length > 0) {
      console.log('✅ User found:');
      console.log('ID:', user[0].id);
      console.log('Employee ID:', user[0].employee_id);
      console.log('Username:', user[0].username);
      console.log('Role:', user[0].role);
      console.log('Active:', user[0].is_active);
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('admin123', user[0].password_hash);
      console.log('Password verification:', isValidPassword ? '✅ PASSED' : '❌ FAILED');
      
      if (isValidPassword) {
        // Create token exactly like auth service
        const token = jwt.sign(
          { userId: user[0].id, employee_id: user[0].employee_id, role: user[0].role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        console.log('✅ Token created with role:', user[0].role);
        console.log('Token:', token.substring(0, 50) + '...');
        
        // Test token decoding
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded role:', decoded.role);
        
        // Test permission check
        const allowedRoles = ['ADMIN', 'HR'];
        const hasPermission = allowedRoles.includes(decoded.role);
        console.log('Has permission:', hasPermission ? '✅ YES' : '❌ NO');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullLogin();

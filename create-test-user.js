const { query } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Insert user
    const [userResult] = await query(`
      INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'TEST001',
      'testuser',
      'testuser@company.com',
      passwordHash,
      'EMPLOYEE',
      true,
      true
    ]);
    
    const userId = userResult.insertId;
    console.log(`✅ User created with ID: ${userId}`);
    
    // Insert employee profile
    await query(`
      INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'TEST001',
      'Test',
      'User',
      'IT',
      'Grade 3',
      'ACTIVE',
      new Date().toISOString().split('T')[0]
    ]);
    
    console.log('✅ Employee profile created');
    console.log('✅ Test user TEST001 is ready!');
    console.log('Use userId:', userId, 'for risk assessment');
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  User already exists, getting existing user ID...');
      
      // Get existing user ID
      const [existingUser] = await query('SELECT id FROM users WHERE employee_id = "TEST001" OR username = "testuser"');
      if (existingUser && existingUser.length > 0) {
        console.log('✅ Use userId:', existingUser[0].id, 'for risk assessment');
      } else {
        console.log('❌ Could not find existing user');
      }
    } else {
      console.error('❌ Error creating user:', error);
    }
  }
}

createTestUser();

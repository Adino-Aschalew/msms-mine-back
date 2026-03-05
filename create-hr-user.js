const bcrypt = require('bcryptjs');
const { query } = require('./src/config/database');

async function createHRUser() {
  try {
    // Check if HR user already exists
    const existingUser = await query(`
      SELECT id FROM users WHERE employee_id = 'HR001'
    `);

    if (existingUser.length > 0) {
      console.log('HR user already exists');
      return;
    }

    // Create HR user
    const password = 'Hr123456'; // Updated to meet validation: uppercase, lowercase, and numbers
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'HR001',
      'HR001',
      'hr@company.com',
      hashedPassword,
      'HR',
      true,
      true
    ]);

    const userId = result.insertId;

    // Create employee profile
    await query(`
      INSERT INTO employee_profiles (
        user_id, employee_id, first_name, last_name, department, 
        job_grade, employment_status, hire_date, phone, hr_verified, hr_verification_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'HR001',
      'John',
      'Smith',
      'HR',
      'MANAGER',
      'ACTIVE',
      '2023-01-01',
      '+251911234567',
      true,
      new Date()
    ]);

    console.log('✅ HR user created successfully!');
    console.log('Employee ID: HR001');
    console.log('Password: Hr123456');
    console.log('Email: hr@company.com');
    console.log('Role: HR');
    console.log('Navigate to: http://localhost:3000/login');

  } catch (error) {
    console.error('Error creating HR user:', error);
  }
}

createHRUser();

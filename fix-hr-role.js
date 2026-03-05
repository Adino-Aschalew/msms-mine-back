const { query } = require('./src/config/database');

async function fixHRRole() {
  try {
    console.log('Adding HR and ADMIN to role enum...');
    
    // Add HR and ADMIN to the role enum
    await query('ALTER TABLE users MODIFY COLUMN role ENUM("EMPLOYEE","LOAN_COMMITTEE","FINANCE_ADMIN","SUPER_ADMIN","HR","ADMIN") NOT NULL');
    console.log('✅ Added HR and ADMIN to role enum');
    
    // Update HR001 to have HR role
    await query('UPDATE users SET role = "HR" WHERE employee_id = "HR001"');
    console.log('✅ Updated HR001 role to HR');
    
    // Verify the update
    const result = await query('SELECT employee_id, username, email, role, is_active FROM users WHERE employee_id = "HR001"');
    console.log('Updated HR user:', result[0]);
    
    console.log('✅ HR role setup complete!');
    console.log('Login credentials:');
    console.log('Employee ID: HR001');
    console.log('Password: Hr123456');
    console.log('Role: HR');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixHRRole();

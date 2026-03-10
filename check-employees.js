const db = require('./src/config/database');

async function checkEmployees() {
  try {
    console.log('🔍 Checking employees in database...\n');
    
    // Check users table
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users table: ${users[0].count} records`);
    
    // Check employee_profiles table
    const [profiles] = await db.query('SELECT COUNT(*) as count FROM employee_profiles');
    console.log(`📊 Employee profiles table: ${profiles[0].count} records`);
    
    // Get sample users if any exist
    if (users[0].count > 0) {
      console.log('\n👥 Sample users:');
      const [sampleUsers] = await db.query(`
        SELECT u.id, u.employee_id, u.username, u.email, u.role, u.is_active,
               ep.first_name, ep.last_name, ep.department, ep.hr_verified
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LIMIT 5
      `);
      
      sampleUsers.forEach((user, idx) => {
        console.log(`\n[${idx + 1}] ID: ${user.id}`);
        console.log(`    Employee ID: ${user.employee_id}`);
        console.log(`    Username: ${user.username}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Active: ${user.is_active}`);
        console.log(`    First Name: ${user.first_name || 'N/A'}`);
        console.log(`    Last Name: ${user.last_name || 'N/A'}`);
        console.log(`    Department: ${user.department || 'N/A'}`);
        console.log(`    HR Verified: ${user.hr_verified}`);
      });
    }
    
    // Check employee_profiles structure
    console.log('\n📋 Employee profiles table structure:');
    const [columns] = await db.query('DESCRIBE employee_profiles');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'required'})`);
    });
    
  } catch (error) {
    console.error('Error checking employees:', error);
  } finally {
    process.exit();
  }
}

checkEmployees();

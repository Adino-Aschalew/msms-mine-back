const { query } = require('./src/config/database');

async function checkEmployeeRoles() {
  try {
    console.log('🔄 Checking employee roles in database...');
    
    // Check all users and their roles
    const allUsers = await query(`
      SELECT u.id, u.username, u.email, u.role, u.is_active,
             ep.first_name, ep.last_name, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ORDER BY u.id
    `);
    
    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`  ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Active: ${user.is_active}`);
      console.log(`  Name: ${user.first_name || 'N/A'} ${user.last_name || 'N/A'}`);
      console.log(`  Employment Status: ${user.employment_status || 'N/A'}`);
      console.log('---');
    });
    
    // Check specifically for employees
    const employees = await query(`
      SELECT u.id, u.username, u.role, u.is_active,
             ep.first_name, ep.last_name, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'EMPLOYEE'
    `);
    
    console.log(`\nUsers with role 'EMPLOYEE': ${employees.length}`);
    employees.forEach(emp => {
      console.log(`  ID: ${emp.id}, Username: ${emp.username}, Name: ${emp.first_name} ${emp.last_name}`);
    });
    
    // Test the dashboard query without role filter
    const allEmployees = await query(`
      SELECT 
        COUNT(*) as totalEmployees,
        COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as activeEmployees,
        u.role
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      GROUP BY u.role
    `);
    
    console.log('\nEmployee count by role:');
    allEmployees.forEach(count => {
      console.log(`  Role: ${count.role}, Total: ${count.totalEmployees}, Active: ${count.activeEmployees}`);
    });
    
  } catch (error) {
    console.log('❌ Error checking roles:', error.message);
  }
}

checkEmployeeRoles();

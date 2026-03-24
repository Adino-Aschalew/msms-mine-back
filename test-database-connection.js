// Test basic database connection
const { query } = require('./src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic query
    const result = await query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Database connection successful');
    console.log(`   Users in database: ${result[0].count}`);
    
    // Test employee profiles
    const profiles = await query('SELECT COUNT(*) as count FROM employee_profiles');
    console.log(`   Employee profiles: ${profiles[0].count}`);
    
    // Test the specific query used in dashboard
    const dashboardTest = await query(`
      SELECT 
        COUNT(*) as totalEmployees,
        COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as activeEmployees
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'EMPLOYEE'
      LIMIT 1
    `);
    
    console.log('✅ Dashboard query test successful');
    console.log(`   Total employees: ${dashboardTest[0].totalEmployees}`);
    console.log(`   Active employees: ${dashboardTest[0].activeEmployees}`);
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

testDatabaseConnection();

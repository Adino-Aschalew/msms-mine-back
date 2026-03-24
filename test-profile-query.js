const { query } = require('./src/config/database');

async function testProfileQuery() {
  try {
    console.log('🔍 Testing profile query directly...');
    
    // Test the same query that's failing in the profile service
    const [userProfile] = await query(`
      SELECT 
        u.id,
        u.employee_id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.email_verified,
        u.created_at,
        u.last_login,
        ep.first_name,
        ep.last_name,
        ep.phone,
        ep.address,
        ep.department,
        ep.job_grade,
        ep.employment_status,
        ep.hire_date,
        ep.hr_verified,
        ep.hr_verification_date
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ?
    `, [2]); // HR user ID from the debug output
    
    console.log('✅ Query successful!');
    console.log('User profile data:');
    console.log(JSON.stringify(userProfile, null, 2));
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProfileQuery();

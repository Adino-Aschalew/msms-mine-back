const { query } = require('./src/config/database');

async function testFixedQuery() {
  try {
    console.log('🔄 Testing the fixed SQL query...');
    
    const stats = await query(`
      SELECT 
        COUNT(*) as totalEmployees,
        COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as activeEmployees,
        COUNT(CASE WHEN ep.hr_verified = TRUE THEN 1 END) as verifiedEmployees,
        COUNT(CASE WHEN ep.hr_verified = FALSE OR ep.hr_verified IS NULL THEN 1 END) as pendingVerification,
        COUNT(CASE WHEN ep.employment_status = 'ACTIVE' THEN 1 END) as activeEmployment,
        COUNT(CASE WHEN ep.employment_status = 'ON_LEAVE' THEN 1 END) as employeesOnLeave,
        COUNT(CASE WHEN ep.employment_status = 'TERMINATED' THEN 1 END) as \`terminated\`,
        COUNT(DISTINCT ep.department) as departments,
        COUNT(DISTINCT ep.job_grade) as jobGrades,
        ROUND(COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as employeeGrowthRate,
        ROUND(COUNT(CASE WHEN ep.employment_status = 'ON_LEAVE' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as leaveRate
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'EMPLOYEE'
    `);
    
    console.log('✅ Fixed SQL query works successfully!');
    console.log('Results:', stats[0]);
    
  } catch (error) {
    console.log('❌ Query failed:', error.message);
    console.log('SQL State:', error.sqlState);
    console.log('SQL Code:', error.code);
  }
}

testFixedQuery();

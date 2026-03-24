const { query } = require('./src/config/database');

async function testDashboardQueries() {
  try {
    console.log('🔄 Testing dashboard queries individually...');
    
    // Test 1: Main stats query
    console.log('\n1. Testing main stats query...');
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
    console.log('✅ Main stats query successful');
    
    // Test 2: Recent activities query
    console.log('\n2. Testing recent activities query...');
    try {
      const activities = await query(`
        SELECT 
          al.action,
          al.entity_type,
          al.created_at,
          u.first_name,
          u.last_name,
          al.details
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE al.entity_type IN ('users', 'employee_profiles')
        ORDER BY al.created_at DESC
        LIMIT 10
      `);
      console.log('✅ Recent activities query successful');
      console.log(`   Activities found: ${activities.length}`);
    } catch (error) {
      console.log('❌ Recent activities query failed:', error.message);
    }
    
    // Test 3: Department breakdown query
    console.log('\n3. Testing department breakdown query...');
    try {
      const departmentData = await query(`
        SELECT 
          ep.department,
          COUNT(*) as count,
          COUNT(CASE WHEN ep.employment_status = 'ACTIVE' THEN 1 END) as active
        FROM employee_profiles ep
        WHERE ep.department IS NOT NULL
        GROUP BY ep.department
        ORDER BY count DESC
      `);
      console.log('✅ Department breakdown query successful');
      console.log(`   Departments found: ${departmentData.length}`);
    } catch (error) {
      console.log('❌ Department breakdown query failed:', error.message);
    }
    
    // Test 4: Open positions query
    console.log('\n4. Testing open positions query...');
    try {
      const openPositions = await query(`
        SELECT 
          COUNT(*) as openPositions
        FROM employee_profiles ep
        WHERE ep.employment_status = 'ACTIVE' 
        AND ep.job_grade IN ('MANAGER', 'SENIOR', 'SUPERVISOR')
        AND ep.hire_date <= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      `);
      console.log('✅ Open positions query successful');
    } catch (error) {
      console.log('❌ Open positions query failed:', error.message);
    }
    
    // Test 5: Pending approvals query
    console.log('\n5. Testing pending approvals query...');
    try {
      const pendingApprovals = await query(`
        SELECT 
          COUNT(CASE WHEN ep.hr_verified = FALSE OR ep.hr_verified IS NULL THEN 1 END) as pendingVerifications,
          COUNT(CASE WHEN pd.payment_status = 'PENDING' THEN 1 END) as pendingPayroll
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN payroll_details pd ON u.id = pd.user_id
        WHERE u.role = 'EMPLOYEE'
      `);
      console.log('✅ Pending approvals query successful');
    } catch (error) {
      console.log('❌ Pending approvals query failed:', error.message);
    }
    
    console.log('\n🎉 All dashboard queries tested!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDashboardQueries();

const { query } = require('./src/config/database');

async function testPendingApplicationsQuery() {
  try {
    console.log('Testing pending applications query...');
    
    // Simple test - check if loan_applications table exists and has data
    const tableCheck = await query('SHOW TABLES LIKE "loan_applications"');
    console.log('loan_applications table exists:', tableCheck.length > 0);
    
    if (tableCheck.length > 0) {
      const countQuery = 'SELECT COUNT(*) as total FROM loan_applications WHERE status = "PENDING"';
      const countResult = await query(countQuery);
      console.log('Pending applications count:', countResult[0].total);
      
      // Test the main query with minimal joins
      const simpleQuery = `
        SELECT 
          la.*,
          u.username,
          u.email,
          ep.first_name,
          ep.last_name,
          ep.department
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE la.status = "PENDING"
        ORDER BY la.created_at ASC
        LIMIT 5
      `;
      
      const applications = await query(simpleQuery);
      console.log('Applications found:', applications.length);
      if (applications.length > 0) {
        console.log('First application:', applications[0]);
      }
    }
    
  } catch (error) {
    console.error('Database error:', error);
  }
  process.exit(0);
}

testPendingApplicationsQuery();

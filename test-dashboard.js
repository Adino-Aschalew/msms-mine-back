const { query } = require('./src/config/database');

async function testDashboardQuery() {
  try {
    console.log('Testing dashboard queries...');
    
    // Test stats query
    const stats = await query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_reviews,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_loans,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_loans,
        SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended_requests
      FROM loan_applications
    `);
    console.log('Stats:', stats[0]);
    
    // Test portfolio query
    const portfolio = await query(`
      SELECT COALESCE(SUM(outstanding_balance), 0) as total_portfolio 
      FROM loans WHERE status = 'ACTIVE'
    `);
    console.log('Portfolio:', portfolio[0]);
    
  } catch (error) {
    console.error('Database error:', error);
  }
  process.exit(0);
}

testDashboardQuery();

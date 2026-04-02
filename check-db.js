const { query } = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('=== CHECKING DATABASE ===\n');
    
    // Check loan_applications table
    console.log('1. Loan Applications Table:');
    const [loanApps] = await query('SELECT COUNT(*) as count FROM loan_applications');
    console.log('   Total count:', loanApps[0]?.count || 0);
    
    if (loanApps[0]?.count > 0) {
      const [sample] = await query('SELECT id, status, created_at FROM loan_applications LIMIT 3');
      console.log('   Sample records:', sample);
      
      const [statusCounts] = await query(`
        SELECT status, COUNT(*) as count 
        FROM loan_applications 
        GROUP BY status
      `);
      console.log('   Status breakdown:', statusCounts);
    }
    
    // Check loans table
    console.log('\n2. Loans Table:');
    const [loans] = await query('SELECT COUNT(*) as count FROM loans');
    console.log('   Total count:', loans[0]?.count || 0);
    
    if (loans[0]?.count > 0) {
      const [sample] = await query('SELECT id, status, loan_amount FROM loans LIMIT 3');
      console.log('   Sample records:', sample);
    }
    
    // Check if user has any applications
    console.log('\n3. Checking specific user applications:');
    const [userApps] = await query(`
      SELECT la.id, la.status, u.email, ep.first_name, ep.last_name
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LIMIT 5
    `);
    console.log('   User applications:', userApps);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();

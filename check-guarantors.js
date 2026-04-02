const { query } = require('./src/config/database');

async function checkGuarantors() {
  try {
    console.log('=== CHECKING GUARANTOR DATA ===\n');
    
    // Check all guarantors
    const guarantors = await query(`
      SELECT id, loan_application_id, guarantor_name, contact_phone
      FROM guarantors 
      LIMIT 10
    `);
    
    console.log('Guarantors in database:', guarantors.length);
    guarantors.forEach(g => {
      console.log(`  - ID: ${g.id}, Loan App ID: ${g.loan_application_id}`);
      console.log(`    Name: ${g.guarantor_name}`);
      console.log(`    Phone: ${g.contact_phone}`);
    });
    
    // Check loan applications that should have guarantors
    const loanApps = await query(`
      SELECT id, status FROM loan_applications LIMIT 5
    `);
    
    console.log('\nLoan Applications:');
    for (const app of loanApps) {
      const g = await query(`
        SELECT guarantor_name, contact_phone 
        FROM guarantors 
        WHERE loan_application_id = ? 
        LIMIT 1
      `, [app.id]);
      console.log(`  - Loan App ${app.id}: ${g.length > 0 ? 'Has guarantor: ' + g[0].guarantor_name : 'No guarantor'}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkGuarantors();

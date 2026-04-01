const { query } = require('./src/config/database');

async function checkLoanApplicationsStructure() {
  try {
    console.log('Checking loan_applications table structure...');
    
    const structure = await query('DESCRIBE loan_applications');
    console.log('loan_applications columns:', structure.map(col => `${col.Field} (${col.Type})`));
    
    // Check if there are any records at all
    const count = await query('SELECT COUNT(*) as total FROM loan_applications');
    console.log('Total loan_applications:', count[0].total);
    
    // If there are records, show a sample
    if (count[0].total > 0) {
      const sample = await query('SELECT * FROM loan_applications LIMIT 1');
      console.log('Sample record:', sample[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkLoanApplicationsStructure();

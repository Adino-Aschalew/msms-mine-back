const { query } = require('./src/config/database');

async function checkTableStructure() {
  try {
    console.log('=== CHECKING TABLE STRUCTURE ===\n');
    
    // Check loan_applications columns
    const columns = await query(`SHOW COLUMNS FROM loan_applications`);
    console.log('Loan Applications columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Check guarantors columns
    const guarantorCols = await query(`SHOW COLUMNS FROM guarantors`);
    console.log('\nGuarantors columns:');
    guarantorCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();

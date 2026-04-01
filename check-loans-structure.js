const { query } = require('./src/config/database');

async function checkLoansStructure() {
  try {
    console.log('Checking loans table structure...');
    
    const structure = await query('DESCRIBE loans');
    console.log('loans columns:', structure.map(col => `${col.Field} (${col.Type})`));
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkLoansStructure();

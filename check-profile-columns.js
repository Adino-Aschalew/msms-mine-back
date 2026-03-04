const { query } = require('./src/config/database');

async function checkProfileColumns() {
  try {
    console.log('🔍 Checking employee_profiles table structure...');
    
    const [structure] = await query('DESCRIBE employee_profiles');
    console.log('\nEmployee profiles table columns:');
    structure.forEach(col => console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProfileColumns();

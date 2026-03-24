const { query } = require('./src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if employee_profiles table exists
    const [tables] = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if employee_profiles exists
    const hasEmployeeProfiles = tables.some(t => t.table_name === 'employee_profiles');
    console.log(`\nemployee_profiles table exists: ${hasEmployeeProfiles ? '✅' : '❌'}`);
    
    if (hasEmployeeProfiles) {
      // Check what's in employee_profiles
      const [profiles] = await query('SELECT * FROM employee_profiles LIMIT 5');
      console.log('\nSample employee_profiles data:');
      console.log(JSON.stringify(profiles, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  }
}

checkTables();

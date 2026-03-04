const { query } = require('./src/config/database');

async function checkDbSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check users table structure
    const [usersStructure] = await query('DESCRIBE users');
    console.log('\nUsers table columns:');
    usersStructure.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
    
    // Check employee_profiles table structure
    const [profilesStructure] = await query('DESCRIBE employee_profiles');
    console.log('\nEmployee profiles table columns:');
    profilesStructure.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDbSchema();

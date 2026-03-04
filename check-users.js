const { query } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    // Check all users
    const [users] = await query('SELECT id, employee_id, username, email, role, is_active FROM users');
    console.log('✅ Users found:', users.length);
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Employee ID: ${user.employee_id}, Username: ${user.username}, Role: ${user.role}, Active: ${user.is_active}`);
    });
    
    // Check employee profiles
    const [profiles] = await query('SELECT user_id, employee_id, first_name, last_name, department FROM employee_profiles');
    console.log('✅ Employee profiles found:', profiles.length);
    profiles.forEach(profile => {
      console.log(`  User ID: ${profile.user_id}, Employee ID: ${profile.employee_id}, Name: ${profile.first_name} ${profile.last_name}, Dept: ${profile.department}`);
    });
    
    // Check which users have profiles
    const [usersWithProfiles] = await query(`
      SELECT u.id, u.employee_id, u.username, ep.first_name, ep.last_name 
      FROM users u 
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
    `);
    console.log('✅ Users with profiles:');
    usersWithProfiles.forEach(user => {
      console.log(`  ID: ${user.id}, Employee ID: ${user.employee_id}, Username: ${user.username}, Name: ${user.first_name || 'NO PROFILE'} ${user.last_name || ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers();

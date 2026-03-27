const { query } = require('./src/config/database');

async function checkStatus() {
  try {
    const results = await query('SELECT employment_status, COUNT(*) as count FROM employee_profiles GROUP BY employment_status');
    console.log('Employment Status Counts:', JSON.stringify(results, null, 2));
    
    const allUsers = await query('SELECT u.id, u.username, u.role, ep.employment_status FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id WHERE u.role != "SUPER_ADMIN"');
    console.log('User status sample:', JSON.stringify(allUsers.slice(0, 10), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkStatus();

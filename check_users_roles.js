const { query } = require('./src/config/database');

async function checkUsers() {
  try {
    const results = await query('SELECT id, username, employee_id, role, role = "" as is_empty, role IS NULL as is_null FROM users');
    console.log('User Roles:', JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUsers();

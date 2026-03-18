const { query } = require('./src/config/database');

async function checkUsers() {
  try {
    const users = await query('SELECT id, employee_id, username, email, role FROM users');
    console.log('Current Users in DB:');
    console.table(users);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    process.exit();
  }
}

checkUsers();

const { query } = require('./src/config/database');

async function checkUsers() {
  try {
    const result = await query('SELECT COUNT(*) as count FROM users');
    console.log('COUNT result:', result[0].count);
    console.log('Type of COUNT result:', typeof result[0].count);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    process.exit();
  }
}

checkUsers();

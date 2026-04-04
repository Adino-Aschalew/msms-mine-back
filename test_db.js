const { pool } = require('./src/config/database');
(async () => {
  const [res] = await pool.execute('SELECT id, employee_id, username, email, first_name, last_name, phone_number FROM users ORDER BY id DESC LIMIT 5');
  console.log(res);
  process.exit(0);
})();

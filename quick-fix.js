const mysql = require('mysql2/promise');

async function quickFix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'microfinance_system'
  });
  
  // Check current user
  const [users] = await connection.execute(
    'SELECT id, employee_id, username, role FROM users WHERE employee_id = ?',
    ['ADMIN001']
  );
  
  console.log('Current user:', users[0]);
  
  // Force update role
  await connection.execute(
    'UPDATE users SET role = ? WHERE employee_id = ?',
    ['ADMIN', 'ADMIN001']
  );
  
  // Verify
  const [updated] = await connection.execute(
    'SELECT id, employee_id, username, role FROM users WHERE employee_id = ?',
    ['ADMIN001']
  );
  
  console.log('Updated user:', updated[0]);
  
  await connection.end();
}

quickFix();

const mysql = require('mysql2/promise');

async function fixEnum() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'microfinance_system'
  });
  
  console.log('🔧 Fixing admin role with correct enum value...');
  
  // Use SUPER_ADMIN which is in the enum
  const result = await connection.execute(
    "UPDATE users SET role = 'SUPER_ADMIN' WHERE employee_id = 'ADMIN001'"
  );
  console.log('Update result:', result);
  
  // Verify update
  const [updated] = await connection.execute(
    'SELECT id, employee_id, username, role FROM users WHERE employee_id = ?',
    ['ADMIN001']
  );
  console.log('Updated user:', updated[0]);
  
  await connection.end();
}

fixEnum();

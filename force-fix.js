const mysql = require('mysql2/promise');

async function forceFix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'microfinance_system'
  });
  
  console.log('🔧 Force fixing admin role...');
  
  // Check table structure
  const [structure] = await connection.execute('DESCRIBE users');
  console.log('Users table structure:');
  structure.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
  
  // Check current data
  const [current] = await connection.execute(
    'SELECT * FROM users WHERE employee_id = ?',
    ['ADMIN001']
  );
  console.log('\nCurrent user data:', current[0]);
  
  // Force update with explicit SQL
  const result = await connection.execute(
    "UPDATE users SET role = 'ADMIN' WHERE employee_id = 'ADMIN001'"
  );
  console.log('\nUpdate result:', result);
  
  // Verify update
  const [updated] = await connection.execute(
    'SELECT id, employee_id, username, role FROM users WHERE employee_id = ?',
    ['ADMIN001']
  );
  console.log('Updated user:', updated[0]);
  
  await connection.end();
}

forceFix();

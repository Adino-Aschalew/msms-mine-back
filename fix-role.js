const mysql = require('mysql2/promise');

async function fixRole() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '',
      database: 'microfinance_system'
    });
    
    console.log('🔧 Fixing admin role...');
    
    // Check current role
    const [users] = await connection.execute(
      'SELECT id, employee_id, role FROM users WHERE employee_id = ?',
      ['ADMIN001']
    );
    
    if (users.length > 0) {
      console.log('Current role:', users[0].role);
      
      // Force update role
      await connection.execute(
        'UPDATE users SET role = ? WHERE employee_id = ?',
        ['ADMIN', 'ADMIN001']
      );
      
      console.log('✅ Role updated to ADMIN');
      
      // Verify
      const [updated] = await connection.execute(
        'SELECT id, employee_id, role FROM users WHERE employee_id = ?',
        ['ADMIN001']
      );
      
      console.log('New role:', updated[0].role);
    } else {
      console.log('❌ Admin user not found');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixRole();

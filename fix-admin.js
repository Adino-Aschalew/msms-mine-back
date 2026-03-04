const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '',
      database: 'microfinance_system'
    });
    
    console.log('🔧 Fixing admin user...');
    
    // Hash password with correct rounds
    const saltRounds = 12;
    const password_hash = await bcrypt.hash('admin123', saltRounds);
    
    // Update admin user
    await connection.execute(
      'UPDATE users SET password_hash = ?, role = ? WHERE employee_id = ?',
      [password_hash, 'ADMIN', 'ADMIN001']
    );
    
    console.log('✅ Admin user fixed');
    console.log('New password hash:', password_hash.substring(0, 20) + '...');
    
    // Verify the fix
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE employee_id = ?',
      ['ADMIN001']
    );
    
    if (users.length > 0) {
      const isValid = await bcrypt.compare('admin123', users[0].password_hash);
      console.log('Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdmin();

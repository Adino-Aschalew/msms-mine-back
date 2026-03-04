const mysql = require('mysql2/promise');

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '',
      database: 'microfinance_system'
    });
    
    console.log('🔍 Checking admin user...');
    
    const [users] = await connection.execute(
      'SELECT id, employee_id, username, email, password_hash, role, is_active FROM users WHERE employee_id = ?',
      ['ADMIN001']
    );
    
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Admin user found:');
      console.log('ID:', user.id);
      console.log('Employee ID:', user.employee_id);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.is_active);
      console.log('Password Hash:', user.password_hash.substring(0, 20) + '...');
      
      // Test password verification
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('admin123', user.password_hash);
      console.log('Password verification (admin123):', isValid);
      
    } else {
      console.log('❌ Admin user not found');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmin();

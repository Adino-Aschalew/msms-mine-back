const bcrypt = require('bcryptjs');
const { query } = require('./src/config/database');

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await query(`
      INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, created_at)
      VALUES (?, ?, ?, ?, 'SUPER_ADMIN', TRUE, TRUE, NOW())
    `, ['ADMIN0012', 'admin333', 'admin@micruuofinance.com', hashedPassword]);
    
    console.log('Admin user created successfully');
    console.log('Login with:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();

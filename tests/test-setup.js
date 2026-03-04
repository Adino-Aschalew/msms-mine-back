// testDbSetup.js
const { query, db } = require('../src/config/database');
const bcrypt = require('bcryptjs');

/**
 * Set up test DB with admin and test users
 */
async function setupTestDatabase() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const testPassword = await bcrypt.hash('password123', 12);

    // Admin
    await query(
      `INSERT IGNORE INTO users 
        (employee_id, username, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['ADMIN001', 'admin', 'admin@test.com', adminPassword, 'ADMIN', true]
    );

    // Test Users
    await query(
      `INSERT IGNORE INTO users 
        (employee_id, username, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['TEST001', 'testuser', 'test@example.com', testPassword, 'EMPLOYEE', true]
    );

    await query(
      `INSERT IGNORE INTO users 
        (employee_id, username, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['TEST002', 'testuser2', 'test2@example.com', testPassword, 'EMPLOYEE', true]
    );

    console.log('✅ Test DB setup completed');
  } catch (err) {
    console.error('❌ Test DB setup failed:', err);
    throw err;
  }
}

/**
 * Cleanup test DB after tests
 */
async function cleanupTestDatabase() {
  try {
    await query(`
      DELETE FROM loans WHERE user_id IN (
        SELECT id FROM users WHERE employee_id LIKE "TEST%" OR employee_id="ADMIN001"
      )
    `);

    await query(`
      DELETE FROM savings_accounts WHERE user_id IN (
        SELECT id FROM users WHERE employee_id LIKE "TEST%" OR employee_id="ADMIN001"
      )
    `);

    await query(`
      DELETE FROM users WHERE employee_id LIKE "TEST%" OR employee_id="ADMIN001"
    `);

    console.log('✅ Test DB cleanup completed');
  } catch (err) {
    console.error('❌ Test DB cleanup failed:', err);
    throw err;
  }
}

module.exports = { setupTestDatabase, cleanupTestDatabase };

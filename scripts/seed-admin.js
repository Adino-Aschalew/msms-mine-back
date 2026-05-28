/**
 * One-time seed script: insert a regular ADMIN user
 * Usage: node scripts/seed-admin.js
 */
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/database');

async function seedAdmin() {
  const email    = 'kidanu@gmail.com';
  const password = 'Password@1234';
  const role     = 'ADMIN';
  const username = 'kidanu';

  // Hash password (same rounds used everywhere in the project)
  const password_hash = await bcrypt.hash(password, 12);

  // Generate a simple employee ID
  const employee_id = 'EMP-' + Date.now().toString().slice(-6);

  try {
    // Check if the email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log(`⚠️  User with email "${email}" already exists (id=${existing[0].id}).`);
      process.exit(0);
    }

    const [result] = await pool.execute(
      `INSERT INTO users
         (employee_id, username, email, password_hash, role, is_active, email_verified, created_at)
       VALUES (?, ?, ?, ?, ?, 1, 1, NOW())`,
      [employee_id, username, email, password_hash, role]
    );

    console.log(`✅  Admin user created successfully!`);
    console.log(`    id          : ${result.insertId}`);
    console.log(`    employee_id : ${employee_id}`);
    console.log(`    email       : ${email}`);
    console.log(`    role        : ${role}`);
  } catch (err) {
    console.error('❌  Error inserting user:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();

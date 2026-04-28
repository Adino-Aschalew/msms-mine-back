const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'microfinance_system',
  port: process.env.DB_PORT || 3307
};

const adminData = {
  employee_id: 'ADMIN002',
  username: 'ade',
  email: 'ade@gmail.com',
  password: 'Ade@1234',
  first_name: 'Bula',
  last_name: 'mula',
  role: 'ADMIN'
};

async function insertAdmin() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully\n');

    // Hash password
    console.log('Hashing password...');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
    console.log('Password hashed\n');

    // Insert user
    console.log('Inserting admin user...');
    const [userResult] = await connection.execute(
      `INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, first_name, last_name) 
       VALUES (?, ?, ?, ?, ?, TRUE, TRUE, ?, ?)`,
      [adminData.employee_id, adminData.username, adminData.email, passwordHash, adminData.role, adminData.first_name, adminData.last_name]
    );
    console.log('User inserted with ID:', userResult.insertId);

    // Insert employee profile
    console.log('Inserting employee profile...');
    await connection.execute(
      `INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date) 
       VALUES (?, ?, ?, ?, 'IT', 'A1', 'ACTIVE', CURDATE())`,
      [userResult.insertId, adminData.employee_id, adminData.first_name, adminData.last_name]
    );
    console.log('Profile inserted\n');

    console.log('✅ Admin user created successfully!');
    console.log('Username:', adminData.username);
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry: Username or email already exists');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

insertAdmin();

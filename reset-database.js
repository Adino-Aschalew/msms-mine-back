const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function resetDatabase() {
  let connection;
  
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3307
    });

    console.log('Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'microfinance_system';
    
    // Drop database if exists
    console.log(`Dropping database ${dbName} if exists...`);
    await connection.execute(`DROP DATABASE IF EXISTS ${dbName}`);
    
    // Create database
    console.log(`Creating database ${dbName}...`);
    await connection.execute(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Use database
    await connection.query(`USE ${dbName}`);
    
    // Read and execute schema
    console.log('Executing schema.sql...');
    const schemaSQL = fs.readFileSync('./schema.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          console.error('Error executing statement:', statement.substring(0, 100));
          console.error(err.message);
        }
      }
    }

    console.log('✅ Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

resetDatabase();

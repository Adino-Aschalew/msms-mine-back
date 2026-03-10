const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'microfinance_system',
      port: process.env.DB_PORT || 3307
    });

    console.log('Connected to database successfully');

    // Read and execute migration
    const fs = require('fs');
    const migrationSQL = fs.readFileSync('./migrations/add_profile_picture.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('Executing migration...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement);
        await connection.execute(statement);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('Added reset_token and reset_token_expiry columns to users table');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Columns may already exist - this is normal');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

runMigration();

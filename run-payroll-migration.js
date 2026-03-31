const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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
      port: parseInt(process.env.DB_PORT) || 3307
    });

    console.log('Connected to database successfully');

    // Read and execute migration
    const migrationFilePath = path.join(__dirname, 'migrations', '20240322_payroll_savings_updates.sql');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('Executing migration...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement);
        try {
          await connection.execute(statement);
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_CANT_DROP_FIELD_OR_KEY' || err.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  Warning (expected if already run): ${err.message}`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

runMigration();

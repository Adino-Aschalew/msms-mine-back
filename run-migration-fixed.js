const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'microfinance_system',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    console.log('Host:', dbConfig.host);
    console.log('Database:', dbConfig.database);
    console.log('User:', dbConfig.user);
    
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\nReading migration file...');
    const migrationFile = path.join(__dirname, 'migrations', 'create_performance_reviews.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Migration SQL loaded');
    console.log('SQL length:', sql.length, 'characters');
    console.log('\nExecuting migration...\n');
    
    // Split SQL by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await connection.execute(stmt);
      }
    }
    
    console.log('\nMigration completed successfully!');
    console.log('Table "performance_reviews" has been created.');
    
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nAccess denied. Please check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nCannot connect to MySQL server. Make sure MySQL is running.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

const { pool } = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration: add_security_columns...');
    
    // Add columns to users table
    await pool.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_failed_login DATETIME NULL,
      ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL
    `);
    
    console.log('Migration completed successfully!');
    console.log('Added columns: failed_login_attempts, last_failed_login, password_changed_at');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    
    // If columns already exist, that's okay
    if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
      console.log('Columns already exist, skipping...');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

runMigration();

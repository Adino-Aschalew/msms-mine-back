const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationFile = process.argv[2] || 'migrations/create_performance_reviews.sql';

console.log(`Running migration: ${migrationFile}`);

try {
  const sql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf8');
  console.log('Migration SQL loaded successfully');
  console.log('SQL content preview:', sql.substring(0, 200) + '...');
  
  // Write SQL to a temp file and execute
  const tempFile = path.join(__dirname, 'temp_migration.sql');
  fs.writeFileSync(tempFile, sql);
  
  console.log('\nTo execute this migration, run one of these commands:');
  console.log('\nOption 1 - Using MySQL CLI:');
  console.log('  mysql -u root -p microfinance_system < temp_migration.sql');
  console.log('\nOption 2 - If MySQL is in PATH:');
  console.log('  Get-Content temp_migration.sql | mysql -u root -p microfinance_system');
  console.log('\nOption 3 - Using MySQL Workbench or phpMyAdmin:');
  console.log('  Open temp_migration.sql and execute it manually');
  
} catch (error) {
  console.error('Error reading migration file:', error.message);
  process.exit(1);
}

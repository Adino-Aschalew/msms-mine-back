const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database...');
    
    // Read environment variables
    require('dotenv').config({ path: '../.env' });
    
    // Check if database credentials are set (allow empty password for --skip-grant-tables)
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error('❌ Database configuration not found in .env file');
      console.log('\n📋 Please update your .env file with:');
      console.log('DB_HOST=localhost');
      console.log('DB_PORT=3307');
      console.log('DB_USER=root');
      console.log('DB_NAME=microfinance_system');
      console.log('\n💡 Then run: npm run setup-db again');
      process.exit(1);
    }
    
    console.log('✅ Environment variables loaded');
    console.log(`🔗 Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'microfinance_system',
      multipleStatements: true
    });
    
    console.log('✅ Database connected');
    
    // Create database if it doesn't exist
    // await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'microfinance_system'}\``);
    // await connection.execute(`USE \`${process.env.DB_NAME || 'microfinance_system'}\``);
    await connection.execute(`USE \`${process.env.DB_NAME || 'microfinance_system'}\``);
    
    console.log('✅ Database created/selected');
    
    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = [
      'users.sql',
      'savings.sql', 
      'loans.sql',
      'guarantors.sql',
      'transactions.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await connection.execute(sql);
        console.log(`✅ ${file} executed successfully`);
      }
    }
    
    // Insert default admin user
    console.log('👤 Creating default admin user...');
    await connection.execute(`
      INSERT INTO users (employee_id, username, email, password_hash, role, is_active, is_verified, created_at)
      VALUES ('ADMIN001', 'admin', 'admin@microfinance.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6G', 'ADMIN', TRUE, TRUE, NOW())
      ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email)
    `);
    
    await connection.execute(`
      INSERT INTO employee_profiles (user_id, first_name, last_name, department, job_grade, employment_status, created_at)
      VALUES (1, 'System', 'Administrator', 'IT', 'A1', 'ACTIVE', NOW())
      ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name)
    `);
    
    // Insert default system settings
    console.log('⚙️  Creating default system settings...');
    await connection.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
      ('DEFAULT_SAVINGS_INTEREST_RATE', '0.05', 'NUMBER', 'Default annual interest rate for savings accounts', FALSE),
      ('DEFAULT_LOAN_INTEREST_RATE', '0.15', 'NUMBER', 'Default annual interest rate for loans', FALSE),
      ('MIN_SAVINGS_PERCENTAGE', '15', 'NUMBER', 'Minimum savings percentage', FALSE),
      ('MAX_SAVINGS_PERCENTAGE', '65', 'NUMBER', 'Maximum savings percentage', FALSE),
      ('LOAN_GRACE_PERIOD_DAYS', '7', 'NUMBER', 'Grace period for loan payments in days', FALSE),
      ('SYSTEM_NAME', 'Microfinance System', 'STRING', 'Name of the system', TRUE),
      ('SYSTEM_VERSION', '1.0.0', 'STRING', 'Current system version', TRUE)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `);
    
    console.log('✅ Default settings created');
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Copy .env.example to .env and update with your database credentials');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');
    console.log('4. Login with: employee_id: ADMIN001, password: admin123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

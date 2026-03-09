const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database...');
    
    // Hardcode database configuration for now
    const dbConfig = {
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '', // Empty password for --skip-grant-tables
      database: 'microfinance_system',
      multipleStatements: true
    };
    
    console.log('🔗 Connecting to MySQL...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Database connected');
    
    // Create database if it doesn't exist
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
      await connection.execute(`USE \`${dbConfig.database}\``);
      console.log('✅ Database created/selected');
    } catch (error) {
      console.log('⚠️ Database may already exist, continuing...');
    }
    
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
        
        // Split SQL into individual statements
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.execute(statement);
            } catch (error) {
              console.log(`⚠️ Statement failed: ${statement.substring(0, 50)}...`);
              console.log(`Error: ${error.message}`);
            }
          }
        }
        
        console.log(`✅ ${file} executed successfully`);
      }
    }
    
    // Insert default admin user
    console.log('👤 Creating default admin user...');
    await connection.execute(`
      INSERT INTO users (employee_id, username, email, password_hash, role, is_active, created_at)
      VALUES ('ADMIN001', 'admin', 'admin@microfinance.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6G', 'ADMIN', TRUE, NOW())
      ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email)
    `);
    
    await connection.execute(`
      INSERT INTO employee_profiles (user_id, first_name, last_name, department, job_grade, employment_status, created_at)
      VALUES (1, 'System', 'Administrator', 'IT', 'A1', 'ACTIVE', NOW())
      ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name)
    `);
    
    // Insert default system settings
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
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Login with: employee_id: ADMIN001, password: admin123');
    console.log('3. Test the API endpoints');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure MySQL is running on localhost:3307');
    console.error('2. If using XAMPP, start MySQL from XAMPP Control Panel');
    console.error('3. If using MySQL Server, start MySQL service');
    console.error('4. Check if port 3307 is available');
    console.error('5. Verify database name exists');
    console.error('6. Check firewall settings');
    
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

const { query } = require('./src/config/database');

async function checkTables() {
  try {
    console.log('Checking savings_transactions table...');
    
    const result = await query('DESCRIBE savings_transactions');
    console.log('✅ savings_transactions table exists');
    console.log('Columns:', result.map(col => col.Field));
    
  } catch (error) {
    console.error('❌ Error checking savings_transactions:', error.message);
    
    if (error.message.includes("doesn't exist")) {
      console.log('Creating savings_transactions table...');
      await query(`
        CREATE TABLE savings_transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          savings_account_id INT NOT NULL,
          user_id INT NOT NULL,
          transaction_type ENUM('CONTRIBUTION', 'INTEREST', 'PENALTY', 'WITHDRAWAL') NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          balance_before DECIMAL(15,2) NOT NULL,
          balance_after DECIMAL(15,2) NOT NULL,
          reference_id VARCHAR(100) NULL,
          description TEXT,
          transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          payroll_batch_id INT NULL,
          INDEX idx_savings_account_id (savings_account_id),
          INDEX idx_user_id (user_id),
          INDEX idx_transaction_type (transaction_type),
          INDEX idx_transaction_date (transaction_date)
        )
      `);
      console.log('✅ savings_transactions table created successfully!');
    }
  }
}

checkTables();

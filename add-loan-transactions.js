const { query } = require('./src/config/database');

async function addLoanTransactionsTable() {
  try {
    console.log('Creating loan_transactions table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS loan_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        user_id INT NOT NULL,
        transaction_type ENUM('PAYMENT', 'INTEREST', 'PENALTY', 'DISBURSEMENT') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        balance_before DECIMAL(15,2) NOT NULL,
        balance_after DECIMAL(15,2) NOT NULL,
        reference_id VARCHAR(100) NULL,
        description TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_loan_id (loan_id),
        INDEX idx_user_id (user_id),
        INDEX idx_transaction_type (transaction_type),
        INDEX idx_transaction_date (transaction_date)
      )
    `);
    
    console.log('✅ loan_transactions table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating loan_transactions table:', error);
  }
}

addLoanTransactionsTable();

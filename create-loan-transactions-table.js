const { query } = require('./src/config/database');

async function createLoanTransactionsTable() {
  try {
    console.log('Creating loan_transactions table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS loan_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        user_id INT NOT NULL,
        transaction_type ENUM('PAYMENT', 'REPAYMENT', 'PENALTY', 'FEE', 'DISBURSEMENT') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        principal_amount DECIMAL(15,2) DEFAULT 0.00,
        interest_amount DECIMAL(15,2) DEFAULT 0.00,
        penalty_amount DECIMAL(15,2) DEFAULT 0.00,
        balance_after_transaction DECIMAL(15,2) NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50) NULL,
        reference_number VARCHAR(100) NULL,
        description TEXT NULL,
        status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'COMPLETED',
        processed_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_loan_id (loan_id),
        INDEX idx_user_id (user_id),
        INDEX idx_transaction_type (transaction_type),
        INDEX idx_transaction_date (transaction_date),
        INDEX idx_status (status),
        INDEX idx_reference_number (reference_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await query(createTableSQL);
    console.log('✅ loan_transactions table created successfully!');
    
    // Verify table exists
    const [result] = await query('SHOW TABLES LIKE "loan_transactions"');
    if (result.length > 0) {
      console.log('✅ Table verification successful!');
    } else {
      console.log('❌ Table was not created');
    }
    
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    process.exit(0);
  }
}

createLoanTransactionsTable();

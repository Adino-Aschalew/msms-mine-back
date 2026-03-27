const { query } = require('./src/config/database');
const sql = `
  CREATE TABLE IF NOT EXISTS loan_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    user_id INT,
    transaction_type ENUM('DISBURSEMENT', 'PAYMENT', 'INTEREST', 'PENALTY', 'REPAYMENT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_id VARCHAR(100),
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

query(sql)
  .then(() => console.log('TABLE loan_transactions CREATED SUCCESSFULLY'))
  .catch(e => console.error(e))
  .finally(() => process.exit());

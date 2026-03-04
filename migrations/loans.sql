-- Loans Tables Migration
-- This migration creates the loan_applications, loans, and loan_transactions tables

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  loan_purpose TEXT NOT NULL,
  loan_term_months INT NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  collateral_description TEXT NULL,
  guarantor_details JSON NULL,
  status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'COMPLETED', 'DEFAULTED') DEFAULT 'PENDING',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  approved_amount DECIMAL(15, 2) NULL,
  approved_term_months INT NULL,
  approved_interest_rate DECIMAL(5, 2) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  loan_term_months INT NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  outstanding_balance DECIMAL(15, 2) NOT NULL,
  amount_due DECIMAL(15, 2) DEFAULT 0.00,
  next_payment_date DATE NOT NULL,
  last_payment_date DATETIME NULL,
  status ENUM('ACTIVE', 'OVERDUE', 'PAID', 'DEFAULTED', 'RESTRUCTURED', 'COMPLETED') DEFAULT 'ACTIVE',
  auto_deduct BOOLEAN DEFAULT TRUE,
  disbursement_date DATETIME NULL,
  completion_date DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_user_id (user_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_next_payment_date (next_payment_date),
  INDEX idx_outstanding_balance (outstanding_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create loan_transactions table
CREATE TABLE IF NOT EXISTS loan_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  user_id INT NOT NULL,
  transaction_type ENUM('DISBURSEMENT', 'PAYMENT', 'INTEREST', 'PENALTY', 'PENALTY_WAIVER', 'FEES') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  reference_id VARCHAR(100) NULL,
  description TEXT NULL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_loan_id (loan_id),
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_reference_id (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

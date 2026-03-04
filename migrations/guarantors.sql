-- Guarantors Tables Migration
-- This migration creates the guarantors table

-- Create guarantors table
CREATE TABLE IF NOT EXISTS guarantors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_application_id INT NOT NULL,
  loan_id INT NULL,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  guarantor_name VARCHAR(255) NOT NULL,
  guarantor_email VARCHAR(255) NOT NULL,
  guarantor_phone VARCHAR(20) NOT NULL,
  guarantor_address TEXT NOT NULL,
  guarantor_relationship VARCHAR(100) NOT NULL,
  guarantee_amount DECIMAL(15, 2) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'RELEASED') DEFAULT 'PENDING',
  signed_date DATETIME NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  documents JSON NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_loan_application_id (loan_application_id),
  INDEX idx_loan_id (loan_id),
  INDEX idx_user_id (user_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

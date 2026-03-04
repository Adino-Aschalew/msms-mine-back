-- Additional Transactions Tables Migration
-- This migration creates supporting tables for transactions and system operations

-- Create payroll_batches table
CREATE TABLE IF NOT EXISTS payroll_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('UPLOADED', 'VALIDATED', 'PROCESSING', 'PROCESSED', 'FAILED', 'PARTIALLY_PROCESSED') DEFAULT 'UPLOADED',
  total_records INT NOT NULL DEFAULT 0,
  processed_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  uploaded_by INT NOT NULL,
  file_path VARCHAR(500) NULL,
  processing_started_at DATETIME NULL,
  processed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payroll_records table
CREATE TABLE IF NOT EXISTS payroll_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  gross_salary DECIMAL(15, 2) NOT NULL,
  net_salary DECIMAL(15, 2) NOT NULL,
  deductions JSON NULL,
  allowances JSON NULL,
  pay_period VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES payroll_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_batch_id (batch_id),
  INDEX idx_user_id (user_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_pay_period (pay_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payroll_errors table
CREATE TABLE IF NOT EXISTS payroll_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  employee_id VARCHAR(50) NULL,
  error_message TEXT NOT NULL,
  record_data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES payroll_batches(id) ON DELETE CASCADE,
  INDEX idx_batch_id (batch_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  loan_id INT NULL,
  employee_id VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  penalty_type ENUM('LOAN_OVERDUE', 'SAVINGS_MISSED', 'OTHER') NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('ACTIVE', 'PAID', 'WAIVED') DEFAULT 'ACTIVE',
  due_date DATE NULL,
  paid_date DATETIME NULL,
  waived_date DATETIME NULL,
  waived_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL,
  FOREIGN KEY (waived_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_loan_id (loan_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_penalty_type (penalty_type),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM') DEFAULT 'INFO',
  data JSON NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_type ENUM('EMAIL', 'SMS', 'PUSH', 'SYSTEM') NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('SENT', 'FAILED', 'PENDING') NOT NULL,
  error_message TEXT NULL,
  data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notification_type (notification_type),
  INDEX idx_status (status),
  INDEX idx_recipient (recipient),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NULL,
  record_id INT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_table_name (table_name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  description TEXT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key),
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('DEFAULT_SAVINGS_INTEREST_RATE', '0.05', 'NUMBER', 'Default annual interest rate for savings accounts', FALSE),
('DEFAULT_LOAN_INTEREST_RATE', '0.15', 'NUMBER', 'Default annual interest rate for loans', FALSE),
('MIN_SAVINGS_PERCENTAGE', '15', 'NUMBER', 'Minimum savings percentage', FALSE),
('MAX_SAVINGS_PERCENTAGE', '65', 'NUMBER', 'Maximum savings percentage', FALSE),
('LOAN_GRACE_PERIOD_DAYS', '7', 'NUMBER', 'Grace period for loan payments in days', FALSE),
('SYSTEM_NAME', 'Microfinance System', 'STRING', 'Name of the system', TRUE),
('SYSTEM_VERSION', '1.0.0', 'STRING', 'Current system version', TRUE)
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

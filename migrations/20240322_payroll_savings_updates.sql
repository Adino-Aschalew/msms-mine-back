-- Migration: Update Payroll and Savings Change Workflow

-- Update payroll_batches status to include REVERSED
ALTER TABLE payroll_batches MODIFY COLUMN status ENUM('UPLOADED','VALIDATED','CONFIRMED','PROCESSED','REVERSED') DEFAULT 'UPLOADED';

-- Add columns for month and year to facilitate duplicate prevention
-- Run separately to avoid dependencies in single statement if one exists
ALTER TABLE payroll_batches ADD COLUMN IF NOT EXISTS payroll_month INT;
ALTER TABLE payroll_batches ADD COLUMN IF NOT EXISTS payroll_year INT;

-- Update existing records to populate month and year
UPDATE payroll_batches SET 
    payroll_month = MONTH(payroll_date),
    payroll_year = YEAR(payroll_date)
WHERE payroll_month IS NULL;

-- Create record for savings change requests
CREATE TABLE IF NOT EXISTS savings_update_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    old_percentage DECIMAL(5,2) NOT NULL,
    new_percentage DECIMAL(5,2) NOT NULL,
    reason TEXT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reviewed_by INT NULL,
    review_date TIMESTAMP NULL,
    review_comments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

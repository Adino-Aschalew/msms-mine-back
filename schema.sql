-- Microfinance & Savings Management System Database Schema
-- Created for Node.js, Express.js, MySQL Implementation

-- Create Database
CREATE DATABASE IF NOT EXISTS microfinance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE microfinance_system;

-- Users Table (System Authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'LOAN_COMMITTEE', 'FINANCE_ADMIN', 'SUPER_ADMIN', 'HR', 'ADMIN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_reset_token (reset_token),
    INDEX idx_reset_token_expiry (reset_token_expiry)
);

-- Employee Profiles (Sync with HR Database)
CREATE TABLE employee_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_grade VARCHAR(50) NOT NULL,
    job_title VARCHAR(100),
    employment_status ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    hire_date DATE NOT NULL,
    phone VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    committee_level INT DEFAULT 1,
    max_loan_amount DECIMAL(15,2) DEFAULT 100000.00,
    hr_verified BOOLEAN DEFAULT FALSE,
    hr_verification_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_employment_status (employment_status),
    INDEX idx_hr_verified (hr_verified)
);

-- Savings Accounts
CREATE TABLE savings_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    saving_percentage DECIMAL(5,2) NOT NULL CHECK (saving_percentage >= 15 AND saving_percentage <= 65),
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    total_contributions DECIMAL(15,2) DEFAULT 0.00,
    interest_earned DECIMAL(15,2) DEFAULT 0.00,
    account_status ENUM('ACTIVE', 'FROZEN', 'CLOSED') DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    lock_period_end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_account_status (account_status)
);

-- Savings Transactions
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
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_savings_account_id (savings_account_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_transaction_date (transaction_date)
);

-- Loan Applications
CREATE TABLE loan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    purpose TEXT NOT NULL,
    repayment_duration_months INT NOT NULL CHECK (repayment_duration_months >= 6 AND repayment_duration_months <= 60),
    monthly_income DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'COMPLETED') DEFAULT 'PENDING',
    reviewed_by INT NULL,
    review_date TIMESTAMP NULL,
    review_comments TEXT,
    approval_document_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Loans
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_application_id INT UNIQUE NOT NULL,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 11.00,
    total_interest DECIMAL(15,2) NOT NULL,
    total_repayment DECIMAL(15,2) NOT NULL,
    monthly_repayment DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    interest_paid DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('ACTIVE', 'COMPLETED', 'DEFAULTED') DEFAULT 'ACTIVE',
    disbursement_date TIMESTAMP NULL,
    maturity_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_application_id (loan_application_id),
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status)
);

-- Loan Repayments
CREATE TABLE loan_repayments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    repayment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(100) NULL,
    payroll_batch_id INT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_id (loan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_repayment_date (repayment_date)
);

-- Guarantors
CREATE TABLE guarantors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_application_id INT NOT NULL,
    user_id INT NOT NULL,
    guarantor_type ENUM('INTERNAL', 'EXTERNAL') NOT NULL,
    guarantor_name VARCHAR(200) NOT NULL,
    guarantor_id VARCHAR(100) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    monthly_income DECIMAL(15,2) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(150) NULL,
    address TEXT,
    id_document_path VARCHAR(500) NULL,
    income_proof_path VARCHAR(500) NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT NULL,
    approval_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_loan_application_id (loan_application_id),
    INDEX idx_user_id (user_id),
    INDEX idx_guarantor_id (guarantor_id)
);

-- Payroll Batches
CREATE TABLE payroll_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(200) NOT NULL,
    upload_user_id INT NOT NULL,
    total_employees INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payroll_date DATE NOT NULL,
    status ENUM('UPLOADED', 'VALIDATED', 'CONFIRMED', 'PROCESSED') DEFAULT 'UPLOADED',
    file_path VARCHAR(500) NOT NULL,
    validation_errors TEXT NULL,
    confirmed_by INT NULL,
    confirmed_date TIMESTAMP NULL,
    processed_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_upload_user_id (upload_user_id),
    INDEX idx_payroll_date (payroll_date),
    INDEX idx_status (status)
);

-- Payroll Details
CREATE TABLE payroll_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_batch_id INT NOT NULL,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    gross_salary DECIMAL(15,2) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    savings_deduction DECIMAL(15,2) DEFAULT 0.00,
    loan_repayment_deduction DECIMAL(15,2) DEFAULT 0.00,
    total_deductions DECIMAL(15,2) DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PENDING',
    payment_date TIMESTAMP NULL,
    payment_reference VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_batch_id) REFERENCES payroll_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payroll_batch_id (payroll_batch_id),
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_payment_status (payment_status)
);

-- Penalties
CREATE TABLE penalties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    penalty_type ENUM('MISSED_SAVINGS', 'LOAN_DEFAULT', 'LATE_PAYMENT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    reference_id VARCHAR(100) NULL,
    status ENUM('ACTIVE', 'PAID', 'WAIVED') DEFAULT 'ACTIVE',
    due_date DATE NOT NULL,
    paid_date TIMESTAMP NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_penalty_type (penalty_type),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- System Configuration
CREATE TABLE system_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_is_active (is_active)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NULL,
    record_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- AI Forecasts
CREATE TABLE ai_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    forecast_type ENUM('USER_REGISTRATION', 'LOAN_DEMAND', 'LIQUIDITY', 'RISK_INDICATORS') NOT NULL,
    forecast_period ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    target_date DATE NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    model_version VARCHAR(50) NOT NULL,
    training_data_period_start DATE NOT NULL,
    training_data_period_end DATE NOT NULL,
    actual_value DECIMAL(15,2) NULL,
    accuracy_score DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_forecast_type (forecast_type),
    INDEX idx_target_date (target_date),
    INDEX idx_created_at (created_at)
);

-- Generated Reports
CREATE TABLE generated_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type ENUM('OPERATIONAL', 'FINANCIAL', 'AUDIT', 'FORECAST_COMPARISON') NOT NULL,
    generated_by INT NOT NULL,
    filters JSON NULL,
    file_path VARCHAR(500) NOT NULL,
    file_format ENUM('PDF', 'CSV', 'EXCEL') NOT NULL,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSON NULL,
    record_count INT DEFAULT 0,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_generated_by (generated_by),
    INDEX idx_report_type (report_type),
    INDEX idx_generation_date (generation_date)
);

-- Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    reference_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert Default System Configuration
INSERT INTO system_configuration (config_key, config_value, config_type, description) VALUES
('savings_interest_rate', '7.00', 'NUMBER', 'Annual savings interest rate'),
('loan_interest_rate', '11.00', 'NUMBER', 'Annual loan interest rate'),
('min_saving_percentage', '15.00', 'NUMBER', 'Minimum saving percentage'),
('max_saving_percentage', '65.00', 'NUMBER', 'Maximum saving percentage'),
('savings_lock_period_months', '6', 'NUMBER', 'Savings lock period in months'),
('min_loan_eligibility_months', '6', 'NUMBER', 'Minimum months of savings for loan eligibility'),
('max_loan_multiplier', '6', 'NUMBER', 'Maximum loan amount as multiplier of total savings'),
('min_loan_duration_months', '6', 'NUMBER', 'Minimum loan repayment duration'),
('max_loan_duration_months', '60', 'NUMBER', 'Maximum loan repayment duration'),
('penalty_days_threshold', '10', 'NUMBER', 'Days before penalty is applied for missed savings'),
('system_maintenance_mode', 'false', 'BOOLEAN', 'System maintenance mode flag'),
('max_guarantors_per_loan', '2', 'NUMBER', 'Maximum number of guarantors per loan'),
('min_guarantor_income_ratio', '0.5', 'NUMBER', 'Minimum guarantor income as ratio of loan amount');

-- Create Default Super Admin User (Password: admin123)
INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified) VALUES
('ADMIN001', 'superadmin', 'admin@microfinance.com', '$2a$12$VHvgDKLjx6yBccrp3QYf0edDR6GbF55mVFsz.FG.43ywsNcNI84XC', 'SUPER_ADMIN', TRUE, TRUE);

-- Create Default HR User (Password: Hr123456)
INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified) VALUES
('HR001', 'hr001', 'hr@company.com', '$2a$12$PO9tZ107f7sFiaH1TbPf/O6U7Jl2XD6DajVmOxIZinvkperzQ0pju', 'HR', TRUE, TRUE);

-- Insert Employee Profile for Super Admin
INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, hr_verified, hr_verification_date) VALUES
(1, 'ADMIN001', 'System', 'Administrator', 'IT', 'ADMIN', 'ACTIVE', '2024-01-01', TRUE, NOW());

-- Insert Employee Profile for HR User
INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, hr_verified, hr_verification_date) VALUES
(2, 'HR001', 'John', 'Smith', 'HR', 'MANAGER', 'ACTIVE', '2024-01-01', TRUE, NOW());

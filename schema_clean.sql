CREATE DATABASE IF NOT EXISTS microfinance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE microfinance_system;
SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE','LOAN_COMMITTEE','FINANCE_ADMIN','HR','ADMIN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_change_required BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone_number VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token),
    INDEX idx_reset_token_expiry (reset_token_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS employee_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grandfather_name VARCHAR(100) NULL,
    department VARCHAR(100) NOT NULL,
    job_grade VARCHAR(50) NOT NULL,
    job_title VARCHAR(100) NULL,
    job_role VARCHAR(100) NULL,
    salary DECIMAL(15,2) NOT NULL,
    employment_status ENUM('ACTIVE','INACTIVE','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    status ENUM('active','inactive') DEFAULT 'active',
    hire_date DATE NOT NULL,
    phone VARCHAR(20) NULL,
    phone_number VARCHAR(20) NULL,
    address TEXT NULL,
    profile_picture VARCHAR(500) NULL,
    committee_level INT DEFAULT 1,
    max_loan_amount DECIMAL(15,2) DEFAULT 100000.00,
    hr_verified BOOLEAN DEFAULT FALSE,
    hr_verification_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_employment_status (employment_status),
    INDEX idx_hr_verified (hr_verified),
    INDEX idx_department (department),
    INDEX idx_profile_picture (profile_picture),
    INDEX idx_salary (salary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS savings_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') DEFAULT 'PERCENTAGE',
    saving_percentage DECIMAL(5,2) DEFAULT 15.00 CHECK (saving_percentage >= 15 AND saving_percentage <= 65),
    fixed_amount DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    total_contributions DECIMAL(15,2) DEFAULT 0.00,
    interest_earned DECIMAL(15,2) DEFAULT 0.00,
    account_status ENUM('ACTIVE','FROZEN','CLOSED') DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    is_paused BOOLEAN DEFAULT FALSE,
    current_version_id INT NULL,
    lock_period_end_date DATE NULL,
    last_contribution_date TIMESTAMP NULL,
    last_request_date DATE NULL,
    total_requests_count INT DEFAULT 0,
    approved_requests_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_account_status (account_status),
    INDEX idx_last_contribution_date (last_contribution_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS savings_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    version_number INT NOT NULL,
    savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    savings_value DECIMAL(15,2) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'REPLACED') DEFAULT 'PENDING',
    effective_date DATE NOT NULL,
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP NULL,
    replaced_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS savings_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    old_value DECIMAL(15,2) NOT NULL,
    new_value DECIMAL(15,2) NOT NULL,
    savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    effective_date DATE NOT NULL,
    requested_effective_date DATE NOT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'APPLIED') DEFAULT 'PENDING',
    workflow_stage VARCHAR(50) DEFAULT 'SUBMITTED',
    salary_snapshot DECIMAL(15,2) NULL,
    loan_deductions_snapshot DECIMAL(15,2) NULL,
    current_deduction_ratio DECIMAL(5,2) NULL,
    projected_deduction_ratio DECIMAL(5,2) NULL,
    simulation_result JSON NULL,
    reason TEXT NULL,
    urgency_level ENUM('NORMAL', 'URGENT', 'CRITICAL') DEFAULT 'NORMAL',
    submitted_by INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    final_approved_by INT NULL,
    final_approved_at TIMESTAMP NULL,
    final_approval_comments TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (final_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS savings_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSON NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS savings_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    savings_account_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('CONTRIBUTION','INTEREST','PENALTY','WITHDRAWAL') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_id VARCHAR(100) NULL,
    description TEXT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payroll_batch_id INT NULL,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_savings_account_id (savings_account_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_payroll_batch_id (payroll_batch_id),
    INDEX idx_reference_id (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS loan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    purpose TEXT NOT NULL,
    repayment_duration_months INT NOT NULL CHECK (repayment_duration_months >= 6 AND repayment_duration_months <= 60),
    monthly_income DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED','COMPLETED') DEFAULT 'PENDING',
    reviewed_by INT NULL,
    review_date TIMESTAMP NULL,
    review_comments TEXT NULL,
    approved_amount DECIMAL(15,2) NULL,
    approved_term_months INT NULL,
    approval_document_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_reviewed_by (reviewed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_application_id INT UNIQUE NOT NULL,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 11.00,
    total_interest DECIMAL(15,2) NOT NULL,
    total_repayment DECIMAL(15,2) NOT NULL,
    monthly_repayment DECIMAL(15,2) NOT NULL,
    monthly_deduction DECIMAL(15,2) NOT NULL,
    duration_months INT NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    interest_paid DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('ACTIVE','COMPLETED','DEFAULTED','SUSPENDED') DEFAULT 'ACTIVE',
    start_date DATE NULL,
    disbursement_date TIMESTAMP NULL,
    maturity_date DATE NULL,
    application_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_application_id (loan_application_id),
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_disbursement_date (disbursement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS loan_repayments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    due_date DATE NULL,
    status ENUM('PENDING','PAID','OVERDUE') DEFAULT 'PENDING',
    repayment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(100) NULL,
    payroll_batch_id INT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_id (loan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_repayment_date (repayment_date),
    INDEX idx_payroll_batch_id (payroll_batch_id),
    INDEX idx_reference_id (reference_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS guarantors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_application_id INT NOT NULL,
    user_id INT NOT NULL,
    guarantor_type ENUM('INTERNAL','EXTERNAL') NOT NULL,
    guarantor_name VARCHAR(200) NOT NULL,
    guarantor_id VARCHAR(100) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    monthly_income DECIMAL(15,2) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(150) NULL,
    address TEXT NULL,
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
    INDEX idx_guarantor_id (guarantor_id),
    INDEX idx_is_approved (is_approved),
    INDEX idx_approved_by (approved_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS payroll_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(200) NOT NULL,
    upload_user_id INT NOT NULL,
    total_employees INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payroll_date DATE NOT NULL,
    status ENUM('UPLOADED','VALIDATED','CONFIRMED','PROCESSED','REVERSED') DEFAULT 'UPLOADED',
    file_path VARCHAR(500) NOT NULL,
    cloudinary_url VARCHAR(500) NULL,
    public_id VARCHAR(255) NULL,
    validation_errors TEXT NULL,
    payroll_month INT NULL,
    payroll_year INT NULL,
    confirmed_by INT NULL,
    confirmed_date TIMESTAMP NULL,
    processed_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_upload_user_id (upload_user_id),
    INDEX idx_payroll_date (payroll_date),
    INDEX idx_status (status),
    INDEX idx_confirmed_by (confirmed_by),
    INDEX idx_cloudinary_url (cloudinary_url),
    INDEX idx_payroll_month (payroll_month),
    INDEX idx_payroll_year (payroll_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS payroll_details (
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
    payment_status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
    payment_date TIMESTAMP NULL,
    payment_reference VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_batch_id) REFERENCES payroll_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payroll_batch_id (payroll_batch_id),
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS system_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('STRING','NUMBER','BOOLEAN','JSON') DEFAULT 'STRING',
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_is_active (is_active),
    INDEX idx_config_type (config_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    INDEX idx_record_id (record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS penalties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    penalty_type ENUM('MISSED_SAVINGS','LOAN_DEFAULT','LATE_PAYMENT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    reference_id VARCHAR(100) NULL,
    status ENUM('ACTIVE','PAID','WAIVED') DEFAULT 'ACTIVE',
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
    INDEX idx_due_date (due_date),
    INDEX idx_reference_id (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS ai_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    forecast_type ENUM('USER_REGISTRATION','LOAN_DEMAND','LIQUIDITY','RISK_INDICATORS') NOT NULL,
    forecast_period ENUM('MONTHLY','QUARTERLY','YEARLY') NOT NULL,
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
    INDEX idx_created_at (created_at),
    INDEX idx_model_version (model_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS generated_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type ENUM('OPERATIONAL','FINANCIAL','AUDIT','FORECAST_COMPARISON') NOT NULL,
    generated_by INT NOT NULL,
    filters JSON NULL,
    file_path VARCHAR(500) NOT NULL,
    file_format ENUM('PDF','CSV','EXCEL') NOT NULL,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSON NULL,
    record_count INT DEFAULT 0,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_generated_by (generated_by),
    INDEX idx_report_type (report_type),
    INDEX idx_generation_date (generation_date),
    INDEX idx_report_name (report_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('INFO','SUCCESS','WARNING','ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    reference_id VARCHAR(100) NULL,
    link VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    

-- Migration: Update Payroll and Savings Change Workflow
-- Note: The following ALTER TABLE statements are now included in the main schema above
-- They are kept here for reference and for existing databases that need updating

-- Update existing records to populate month and year (for existing databases)
UPDATE payroll_batches SET 
    payroll_month = MONTH(payroll_date),
    payroll_year = YEAR(payroll_date)
WHERE payroll_month IS NULL;

-- Update existing users to not require password change (except employees)
UPDATE users 
SET password_change_required = FALSE 
WHERE role IN ('SUPER_ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE', 'ADMIN');

-- Ensure all new employees will require password change
UPDATE users 
SET password_change_required = TRUE 
WHERE role = 'EMPLOYEE';

-- Initial Seed Data
INSERT INTO users
    (employee_id, username, email, password_hash, role, is_active, email_verified, first_name, last_name)
VALUES
    ('ADMIN001', 'admin@msms.com', 'admin@msms.com', '$2a$12$3vrgkj5a6NA8J44HJ5H1AeG5JzQKUlaAEdGxSK2pVXPTfB32AghWm', 'ADMIN', TRUE, TRUE, 'System', 'Administrator'),
    ('HR001', 'hr@msms.com', 'hr@msms.com', '$2a$12$A233dQjDh42aflzqUNiOZ.7oGI3Iw0h0jLav891EVw1qey8JPRWoW', 'HR', TRUE, TRUE, 'Abebe', 'HR'),
    ('FIN001', 'finance@msms.com', 'finance@msms.com', '$2a$12$A233dQjDh42aflzqUNiOZ.7oGI3Iw0h0jLav891EVw1qey8JPRWoW', 'FINANCE_ADMIN', TRUE, TRUE, 'Kalkidan', 'Finance'),
    ('LOAN001', 'loancommittee@msms.com', 'loancommittee@msms.com', '$2a$12$A233dQjDh42aflzqUNiOZ.7oGI3Iw0h0jLav891EVw1qey8JPRWoW', 'LOAN_COMMITTEE', TRUE, TRUE, 'Mikael', 'LoanCommittee'),
    ('EMP001', 'EMP001', 'john.doe@msms.com', '$2a$12$A233dQjDh42aflzqUNiOZ.7oGI3Iw0h0jLav891EVw1qey8JPRWoW', 'EMPLOYEE', TRUE, TRUE, 'John', 'Doe');

INSERT INTO employee_profiles
    (user_id, employee_id, first_name, last_name, grandfather_name, department, job_grade, job_title, employment_status, status, hire_date, phone, phone_number, address, committee_level, salary, job_role, hr_verified, hr_verification_date)
VALUES
    (1, 'ADMIN001', 'System', 'Administrator', 'Girma', 'IT', 'ADMIN', 'System Administrator', 'ACTIVE', 'active', '2024-01-01', '+251910000001', '+251910000001', 'Somewhere, Addis Ababa', 1, 80000.00, 'Superuser', TRUE, NOW()),
    (2, 'HR001', 'Abebe', 'HR', 'Tesfaye', 'Human Resources', 'MANAGER', 'HR Manager', 'ACTIVE', 'active', '2024-01-01', '+251910000002', '+251910000002', 'Somewhere, Addis Ababa', 1, 60000.00, 'HR Operations', TRUE, NOW()),
    (3, 'FIN001', 'Kalkidan', 'Finance', 'Teshome', 'Finance', 'MANAGER', 'Finance Manager', 'ACTIVE', 'active', '2024-01-01', '+251910000003', '+251910000003', 'Somewhere, Addis Ababa', 1, 65000.00, 'Financial Oversight', TRUE, NOW()),
    (4, 'LOAN001', 'Mikael', 'LoanCommittee', 'Bekele', 'Loans', 'CHAIR', 'Loan Committee Chair', 'ACTIVE', 'active', '2024-01-01', '+251910000004', '+251910000004', 'Somewhere, Addis Ababa', 3, 55000.00, 'Credit Approval', TRUE, NOW()),
    (5, 'EMP001', 'John', 'Doe', 'Robert', 'Engineering', 'SENIOR_DEVELOPER', 'Software Developer', 'ACTIVE', 'active', '2024-01-15', '+251910000005', '+251910000005', '123 Main St', 1, 45000.00, 'Backend Developer', TRUE, NOW());

INSERT INTO savings_accounts 
    (user_id, employee_id, savings_type, saving_percentage, current_balance, total_contributions, account_status)
VALUES
    (5, 'EMP001', 'PERCENTAGE', 15.00, 5000.00, 5000.00, 'ACTIVE');

INSERT INTO savings_versions
    (user_id, version_number, savings_type, savings_value, status, effective_date, activated_at)
VALUES
    (5, 1, 'PERCENTAGE', 15.00, 'ACTIVE', '2024-01-15', NOW());

UPDATE savings_accounts SET current_version_id = 1 WHERE user_id = 5;

INSERT INTO savings_transactions
    (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, description)
VALUES
    (1, 5, 'CONTRIBUTION', 5000.00, 0.00, 5000.00, 'Initial savings contribution');

INSERT INTO savings_configuration (config_key, config_value, description)
VALUES 
    ('min_savings_percentage', '{"value": 15}', 'Minimum percentage allowed for payroll deduction'),
    ('max_savings_percentage', '{"value": 65}', 'Maximum percentage allowed for payroll deduction'),
    ('max_total_deduction_ratio', '{"value": 50}', 'Maximum total deduction ratio (loans + savings) allowed'),
    ('min_net_salary_threshold', '{"value": 2000}', 'Minimum net salary threshold that must be maintained after all deductions');




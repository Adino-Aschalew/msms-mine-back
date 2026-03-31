-- Enterprise Savings System Migration
-- This migration creates tables for the advanced savings request and approval workflow

-- 1. Enhanced Savings Requests Table (replace/upgrade existing)
CREATE TABLE IF NOT EXISTS savings_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    
    -- Request Details
    request_type ENUM('PERCENTAGE_CHANGE', 'FIXED_AMOUNT_CHANGE', 'PAUSE', 'RESUME') DEFAULT 'PERCENTAGE_CHANGE',
    old_value DECIMAL(15, 2) NOT NULL,
    new_value DECIMAL(15, 2) NOT NULL,
    savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') DEFAULT 'PERCENTAGE',
    
    -- Effective Date Management
    effective_date DATE NOT NULL,
    requested_effective_date DATE NOT NULL,
    
    -- Status and Workflow
    status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'APPLIED', 'CANCELLED') DEFAULT 'PENDING',
    workflow_stage ENUM('SUBMITTED', 'FINANCE_OFFICER_REVIEW', 'FINANCE_MANAGER_APPROVAL', 'FINAL_APPROVAL', 'COMPLETED') DEFAULT 'SUBMITTED',
    
    -- Financial Context (Snapshot at time of request)
    salary_snapshot DECIMAL(15, 2) NOT NULL,
    loan_deductions_snapshot DECIMAL(15, 2) DEFAULT 0.00,
    current_deduction_ratio DECIMAL(5, 2) DEFAULT 0.00,
    projected_deduction_ratio DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Simulation Results (JSON)
    simulation_result JSON,
    
    -- Request Metadata
    reason TEXT NULL,
    urgency_level ENUM('NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    
    -- Approval Workflow
    submitted_by INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finance_officer_reviewed_by INT NULL,
    finance_officer_reviewed_at TIMESTAMP NULL,
    finance_officer_comments TEXT NULL,
    finance_manager_approved_by INT NULL,
    finance_manager_approved_at TIMESTAMP NULL,
    finance_manager_comments TEXT NULL,
    final_approved_by INT NULL,
    final_approved_at TIMESTAMP NULL,
    final_approval_comments TEXT NULL,
    
    -- Applied Information
    applied_by INT NULL,
    applied_at TIMESTAMP NULL,
    applied_payroll_period VARCHAR(50) NULL,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (finance_officer_reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (finance_manager_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (final_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (applied_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_workflow_stage (workflow_stage),
    INDEX idx_effective_date (effective_date),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_urgency_level (urgency_level),
    
    -- Constraints
    UNIQUE KEY unique_pending_request (user_id, status) 
    -- Ensures only one pending request per user
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Savings Version Control Table
CREATE TABLE IF NOT EXISTS savings_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    
    -- Version Details
    version_number INT NOT NULL,
    savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') DEFAULT 'PERCENTAGE',
    savings_value DECIMAL(15, 2) NOT NULL,
    
    -- Status and Dates
    status ENUM('ACTIVE', 'PENDING', 'REPLACED', 'CANCELLED') DEFAULT 'PENDING',
    effective_date DATE NOT NULL,
    expiry_date DATE NULL,
    
    -- Context
    created_via ENUM('ACCOUNT_CREATION', 'REQUEST_APPROVAL', 'ADMIN_CHANGE', 'PAYROLL_INTEGRATION') DEFAULT 'REQUEST_APPROVAL',
    request_id INT NULL,
    
    -- Financial Context
    salary_at_time DECIMAL(15, 2) DEFAULT 0.00,
    monthly_deduction_amount DECIMAL(15, 2) DEFAULT 0.00,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    activated_at TIMESTAMP NULL,
    activated_by INT NULL,
    replaced_at TIMESTAMP NULL,
    replaced_by INT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES savings_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (replaced_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_effective_date (effective_date),
    INDEX idx_version_number (version_number),
    
    -- Constraints
    UNIQUE KEY unique_active_version (user_id, status)
    -- Ensures only one active version per user
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Savings Audit Log Table
CREATE TABLE IF NOT EXISTS savings_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Action Details
    action_type ENUM('REQUEST_CREATED', 'REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 
                     'REQUEST_MODIFIED', 'REQUEST_CANCELLED', 'VERSION_ACTIVATED', 'VERSION_REPLACED',
                     'SAVINGS_PAUSED', 'SAVINGS_RESUMED', 'ADMIN_OVERRIDE', 'POLICY_VIOLATION') NOT NULL,
    
    -- Entity References
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    request_id INT NULL,
    version_id INT NULL,
    
    -- Action Context
    performed_by INT NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Data Changes
    old_value JSON NULL,
    new_value JSON NULL,
    changed_fields JSON NULL,
    
    -- Additional Context
    comments TEXT NULL,
    metadata JSON NULL,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES savings_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (version_id) REFERENCES savings_versions(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_action_type (action_type),
    INDEX idx_performed_at (performed_at),
    INDEX idx_performed_by (performed_by),
    INDEX idx_request_id (request_id),
    INDEX idx_version_id (version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Savings Configuration Table (System-wide settings)
CREATE TABLE IF NOT EXISTS savings_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Configuration Keys
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSON NOT NULL,
    
    -- Metadata
    description TEXT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_config_key (config_key),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert Default Configuration Values
INSERT INTO savings_configuration (config_key, config_value, description, category) VALUES
('min_savings_percentage', '{"value": 15, "enabled": true}', 'Minimum percentage allowed for savings', 'VALIDATION'),
('max_savings_percentage', '{"value": 65, "enabled": true}', 'Maximum percentage allowed for savings', 'VALIDATION'),
('max_total_deduction_ratio', '{"value": 50, "enabled": true}', 'Maximum total deduction ratio allowed', 'VALIDATION'),
('min_net_salary_threshold', '{"value": 2000, "enabled": true}', 'Minimum net salary after deductions', 'VALIDATION'),
('approval_workflow_stages', '{"stages": ["SUBMITTED", "FINANCE_OFFICER_REVIEW", "FINANCE_MANAGER_APPROVAL", "FINAL_APPROVAL"], "enabled": true}', 'Required approval workflow stages', 'WORKFLOW'),
('auto_approval_threshold', '{"percentage": 30, "enabled": false}', 'Auto-approve requests below this percentage', 'WORKFLOW'),
('notification_settings', '{"email_enabled": true, "system_enabled": true, "sms_enabled": false}', 'Notification preferences', 'NOTIFICATIONS'),
('payroll_integration', '{"effective_immediately": false, "next_payroll_only": true, "cutoff_days": 5}', 'Payroll integration settings', 'PAYROLL')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- 6. Update existing savings_accounts table to support new features
ALTER TABLE savings_accounts 
ADD COLUMN IF NOT EXISTS savings_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') DEFAULT 'PERCENTAGE' AFTER saving_percentage,
ADD COLUMN IF NOT EXISTS fixed_amount DECIMAL(15, 2) DEFAULT 0.00 AFTER savings_type,
ADD COLUMN IF NOT EXISTS current_version_id INT NULL AFTER fixed_amount,
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE AFTER current_version_id,
ADD COLUMN IF NOT EXISTS pause_reason TEXT NULL AFTER is_paused,
ADD COLUMN IF NOT EXISTS pause_start_date DATE NULL AFTER pause_reason,
ADD COLUMN IF NOT EXISTS pause_end_date DATE NULL AFTER pause_start_date,
ADD COLUMN IF NOT EXISTS last_request_date DATE NULL AFTER pause_end_date,
ADD COLUMN IF NOT EXISTS total_requests_count INT DEFAULT 0 AFTER last_request_date,
ADD COLUMN IF NOT EXISTS approved_requests_count INT DEFAULT 0 AFTER total_requests_count;

-- Add foreign key for version reference
ALTER TABLE savings_accounts 
ADD CONSTRAINT fk_savings_accounts_current_version 
FOREIGN KEY (current_version_id) REFERENCES savings_versions(id) ON DELETE SET NULL;

-- 7. Create indexes for new columns
ALTER TABLE savings_accounts
ADD INDEX IF NOT EXISTS idx_savings_type (savings_type),
ADD INDEX IF NOT EXISTS idx_current_version_id (current_version_id),
ADD INDEX IF NOT EXISTS idx_is_paused (is_paused),
ADD INDEX IF NOT EXISTS idx_last_request_date (last_request_date);

-- 8. Create view for active savings configurations
CREATE OR REPLACE VIEW active_savings_configurations AS
SELECT 
    sa.user_id,
    sa.employee_id,
    sa.savings_type,
    CASE 
        WHEN sa.savings_type = 'PERCENTAGE' THEN sa.saving_percentage
        ELSE sa.fixed_amount
    END as current_value,
    sa.current_balance,
    sa.account_status,
    sa.is_paused,
    sv.version_number,
    sv.effective_date,
    sv.status as version_status,
    sa.updated_at
FROM savings_accounts sa
LEFT JOIN savings_versions sv ON sa.current_version_id = sv.id
WHERE sa.account_status = 'ACTIVE';

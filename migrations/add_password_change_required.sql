-- Add password change required field to users table
ALTER TABLE users 
ADD COLUMN password_change_required BOOLEAN DEFAULT TRUE AFTER email_verified,
ADD INDEX idx_password_change_required (password_change_required);

-- Update existing users to not require password change (except employees)
UPDATE users 
SET password_change_required = FALSE 
WHERE role IN ('SUPER_ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE', 'ADMIN');

-- Ensure all new employees will require password change
UPDATE users 
SET password_change_required = TRUE 
WHERE role = 'EMPLOYEE';

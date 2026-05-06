-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verification_code VARCHAR(6) NULL,
ADD COLUMN email_verification_expires TIMESTAMP NULL,
ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE AFTER email_verified;

-- Add indexes for performance
CREATE INDEX idx_users_email_verification_code ON users(email_verification_code);
CREATE INDEX idx_users_email_verification_expires ON users(email_verification_expires);
CREATE INDEX idx_users_is_first_login ON users(is_first_login);

-- Update existing users to set is_first_login based on whether they've ever changed password
UPDATE users 
SET is_first_login = CASE 
  WHEN password_changed_at IS NULL THEN TRUE 
  ELSE FALSE 
END;

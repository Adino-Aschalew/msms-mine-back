-- Add security columns to users table for login attempt tracking and password management
ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN last_failed_login DATETIME NULL,
ADD COLUMN password_changed_at DATETIME NULL;

-- Create index for faster lookups on failed login attempts
CREATE INDEX idx_failed_login_attempts ON users(failed_login_attempts);

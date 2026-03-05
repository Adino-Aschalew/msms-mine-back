-- Add password reset columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME NULL;

-- Add index for faster lookup of reset tokens
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Add index for reset token expiry
CREATE INDEX IF NOT EXISTS idx_users_reset_token_expiry ON users(reset_token_expiry);

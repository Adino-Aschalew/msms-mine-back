-- Create OTP records table for secure email verification
CREATE TABLE IF NOT EXISTS otp_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  hashed_code VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_created_at (created_at),
  
  -- Ensure one active OTP per user
  UNIQUE KEY unique_active_otp (email, expires_at)
);

-- Add foreign key constraint if users table exists
ALTER TABLE otp_records 
ADD CONSTRAINT fk_otp_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create cleanup trigger for expired OTPs (optional)
DELIMITER //
CREATE TRIGGER IF NOT EXISTS cleanup_expired_otps
AFTER INSERT ON otp_records
FOR EACH ROW
BEGIN
    DELETE FROM otp_records 
    WHERE expires_at < NOW() 
    AND id != NEW.id;
END//
DELIMITER ;

-- Add comment for documentation
ALTER TABLE otp_records COMMENT = 'Stores OTP codes for email verification with security features';

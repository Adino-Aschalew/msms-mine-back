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

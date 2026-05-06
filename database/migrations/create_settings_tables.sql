-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  settings JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category),
  INDEX idx_user_preferences_user_id (user_id),
  INDEX idx_user_preferences_category (category)
);

-- Create system settings table (admin only)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  settings JSON NOT NULL,
  updated_by INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_category (category),
  INDEX idx_system_settings_category (category)
);

-- Initialize default system settings
INSERT IGNORE INTO system_settings (category, settings, updated_by) 
VALUES 
  ('system', JSON_OBJECT(
    'sessionTimeout', 30,
    'maxFileSize', 10
  ), 1);

-- Create index on audit_logs for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);

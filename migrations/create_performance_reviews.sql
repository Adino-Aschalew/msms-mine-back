-- Create performance_reviews table for performance tracking

CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  reviewer_id INT,
  review_type ENUM('monthly', 'quarterly', 'annual') NOT NULL DEFAULT 'monthly',
  review_date DATE NOT NULL,
  next_review_date DATE,
  status ENUM('pending', 'in_progress', 'completed', 'overdue') NOT NULL DEFAULT 'pending',
  score DECIMAL(5,2),
  ratings JSON,
  goals TEXT,
  achievements TEXT,
  feedback TEXT,
  manager_comments TEXT,
  employee_comments TEXT,
  action_items TEXT,
  overall_rating ENUM('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employee_profiles(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_reviews_date ON performance_reviews(review_date);
CREATE INDEX idx_performance_reviews_type ON performance_reviews(review_type);

-- Insert sample data for testing
INSERT INTO performance_reviews (employee_id, reviewer_id, review_type, review_date, next_review_date, status, score, overall_rating, feedback) 
SELECT 
  ep.employee_id,
  1 as reviewer_id,
  'quarterly' as review_type,
  DATE_SUB(CURDATE(), INTERVAL 1 MONTH) as review_date,
  DATE_ADD(CURDATE(), INTERVAL 2 MONTH) as next_review_date,
  'completed' as status,
  85.5 as score,
  'good' as overall_rating,
  'Employee shows consistent performance and meets expectations.' as feedback
FROM employee_profiles ep
LIMIT 5;

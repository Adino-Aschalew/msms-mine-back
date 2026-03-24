const { query } = require('./src/config/database');

async function createPerformanceTables() {
  try {
    console.log('🔄 Creating performance tables...');
    
    // Create performance_reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        employee_id         INT NOT NULL,
        reviewer_id         INT NOT NULL,
        review_type         ENUM('ANNUAL', 'QUARTERLY', 'PROBATION', 'PROJECT', 'ADHOC') NOT NULL,
        review_period_start DATE NOT NULL,
        review_period_end   DATE NOT NULL,
        overall_score       DECIMAL(3,1) NULL CHECK (overall_score >= 0 AND overall_score <= 5),
        status              ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
        comments            TEXT NULL,
        goals_met           BOOLEAN DEFAULT FALSE,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_reviewer_id (reviewer_id),
        INDEX idx_review_type (review_type),
        INDEX idx_status (status),
        INDEX idx_review_period (review_period_start, review_period_end)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ performance_reviews table created');
    
    // Create performance_criteria table
    await query(`
      CREATE TABLE IF NOT EXISTS performance_criteria (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        description TEXT NULL,
        category    VARCHAR(50) NOT NULL,
        weight      DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
        is_active   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_category (category),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ performance_criteria table created');
    
    // Create performance_scores table
    await query(`
      CREATE TABLE IF NOT EXISTS performance_scores (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        review_id           INT NOT NULL,
        criteria_id         INT NOT NULL,
        score               DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 5),
        comments            TEXT NULL,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (criteria_id) REFERENCES performance_criteria(id) ON DELETE CASCADE,
        INDEX idx_review_id (review_id),
        INDEX idx_criteria_id (criteria_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ performance_scores table created');
    
    // Create performance_goals table
    await query(`
      CREATE TABLE IF NOT EXISTS performance_goals (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        employee_id         INT NOT NULL,
        title               VARCHAR(200) NOT NULL,
        description         TEXT NULL,
        category            VARCHAR(50) NOT NULL,
        target_value        VARCHAR(100) NULL,
        current_value       VARCHAR(100) NULL,
        unit                VARCHAR(50) NULL,
        due_date            DATE NULL,
        status              ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') DEFAULT 'NOT_STARTED',
        priority            ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ performance_goals table created');
    
    // Insert default performance criteria
    await query(`
      INSERT INTO performance_criteria (name, description, category, weight) VALUES
      ('Communication Skills', 'Effectiveness in verbal and written communication', 'Core Skills', 0.20),
      ('Team Collaboration', 'Ability to work effectively with team members', 'Core Skills', 0.15),
      ('Problem Solving', 'Analytical thinking and solution development', 'Core Skills', 0.20),
      ('Technical Knowledge', 'Expertise in relevant technical areas', 'Technical Skills', 0.15),
      ('Time Management', 'Ability to prioritize and meet deadlines', 'Productivity', 0.10),
      ('Leadership', 'Ability to lead and motivate others', 'Leadership', 0.10),
      ('Innovation', 'Creativity and improvement initiatives', 'Innovation', 0.10)
    `);
    console.log('✅ Default performance criteria inserted');
    
    console.log('\n🎉 Performance schema creation completed!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying created tables...');
    const tables = await query('SHOW TABLES LIKE "performance_%"');
    const tableNames = tables.map(t => t[`Tables_in_${process.env.DB_NAME || 'msms'} || 'Tables_in_test'`]);
    console.log('Created tables:', tableNames);
    
    // Verify criteria were inserted
    const criteria = await query('SELECT COUNT(*) as count FROM performance_criteria');
    console.log(`Performance criteria inserted: ${criteria[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creating performance tables:', error.message);
    console.error('Stack:', error.stack);
  }
}

createPerformanceTables();

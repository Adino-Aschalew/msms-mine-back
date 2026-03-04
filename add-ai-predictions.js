const { query } = require('./src/config/database');

async function addAiPredictionsTable() {
  try {
    console.log('Creating ai_predictions table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS ai_predictions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prediction_type ENUM('loan_default', 'savings_growth', 'employee_turnover', 'cash_flow') NOT NULL,
        user_id INT NOT NULL,
        parameters JSON NULL,
        predictions JSON NOT NULL,
        confidence DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prediction_type (prediction_type),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✅ ai_predictions table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating ai_predictions table:', error);
  }
}

addAiPredictionsTable();

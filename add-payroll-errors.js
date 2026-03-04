const { query } = require('./src/config/database');

async function addPayrollErrorsTable() {
  try {
    console.log('Creating payroll_errors table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS payroll_errors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id INT NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        error_message TEXT NOT NULL,
        record_data JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_batch_id (batch_id),
        INDEX idx_employee_id (employee_id)
      )
    `);
    
    console.log('✅ payroll_errors table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating payroll_errors table:', error);
  }
}

addPayrollErrorsTable();

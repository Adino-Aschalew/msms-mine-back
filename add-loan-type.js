const { query } = require('./src/config/database');

async function addLoanTypeColumn() {
  try {
    console.log('=== ADDING loan_type COLUMN ===\n');
    
    // Add loan_type column to loan_applications
    await query(`
      ALTER TABLE loan_applications 
      ADD COLUMN loan_type VARCHAR(50) DEFAULT 'Personal' 
      AFTER purpose
    `);
    
    console.log('✓ Added loan_type column');
    
    // Update existing records to have a default type based on purpose
    await query(`
      UPDATE loan_applications 
      SET loan_type = CASE
        WHEN purpose LIKE '%emergency%' OR purpose LIKE '%urgent%' THEN 'Emergency'
        WHEN purpose LIKE '%business%' OR purpose LIKE '%investment%' THEN 'Business'
        WHEN purpose LIKE '%education%' OR purpose LIKE '%school%' OR purpose LIKE '%tuition%' THEN 'Education'
        WHEN purpose LIKE '%medical%' OR purpose LIKE '%health%' THEN 'Medical'
        WHEN purpose LIKE '%housing%' OR purpose LIKE '%rent%' OR purpose LIKE '%home%' THEN 'Housing'
        ELSE 'Personal'
      END
      WHERE loan_type IS NULL OR loan_type = 'Personal'
    `);
    
    console.log('✓ Updated existing records');
    console.log('\nColumn added successfully!');
    
  } catch (error) {
    if (error.message && error.message.includes('Duplicate column')) {
      console.log('Column already exists, no changes needed.');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

addLoanTypeColumn();

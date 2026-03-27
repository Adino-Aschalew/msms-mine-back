const { query } = require('./src/config/database');

async function seedLoan() {
  try {
    const userId = 17;
    const employeeId = 'EMP777';
    
    // Cleanup previous failed attempts to avoid duplicate app errors
    await query('DELETE FROM loan_applications WHERE user_id = ?', [userId]);
    await query('DELETE FROM loans WHERE user_id = ?', [userId]);

    // 1. Create a sample loan application
    const appResult = await query(`
      INSERT INTO loan_applications (
        user_id, employee_id, requested_amount, repayment_duration_months, 
        purpose, status, monthly_income, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, employeeId, 50000.00, 12, 'Personal Development', 'APPROVED', 3456456.00]);
    
    const appId = appResult.insertId;
    console.log('Sample loan application created for userId 17, ID:', appId);
    
    // 2. Create an active loan linked to this application
    const loanResult = await query(`
      INSERT INTO loans (
        loan_application_id, user_id, employee_id, loan_amount, principal_amount,
        outstanding_balance, remaining_balance, interest_rate, duration_months, 
        monthly_repayment, monthly_deduction, total_interest, total_repayment,
        status, created_at, updated_at, start_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), CURDATE())
    `, [
      appId, userId, employeeId, 50000.00, 50000.00, 
      48000.00, 48000.00, 11.0, 12, 
      4500.00, 4500.00, 4000.00, 54000.00,
      'ACTIVE'
    ]);
    
    console.log('Active loan created for userId 17, ID:', loanResult.insertId);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding loan:', err);
    process.exit(1);
  }
}

seedLoan();

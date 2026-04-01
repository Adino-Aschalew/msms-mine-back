const { query } = require('../src/config/database');

async function createSimplePayrollData() {
  try {
    console.log('Creating simple payroll data...');

    // Get existing users
    const usersResult = await query('SELECT id, employee_id FROM users WHERE employee_id IN ("EMP001", "EMP002", "EMP003") LIMIT 3');
    const users = Array.isArray(usersResult) ? usersResult : [usersResult].filter(Boolean);
    
    console.log('Found users:', users);
    console.log('Users type:', typeof users);
    console.log('Users length:', users.length);
    console.log('Is array?', Array.isArray(users));

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Create employee profiles if they don't exist
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`Processing user ${i}:`, user);
      
      await query(`
        INSERT INTO employee_profiles (user_id, first_name, last_name, job_role, department, salary, employment_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE first_name = VALUES(first_name)
      `, [
        user.id,
        user.employee_id === 'EMP001' ? 'John' : user.employee_id === 'EMP002' ? 'Jane' : 'Bob',
        user.employee_id === 'EMP001' ? 'Doe' : user.employee_id === 'EMP002' ? 'Smith' : 'Wilson',
        user.employee_id === 'EMP001' ? 'Software Engineer' : user.employee_id === 'EMP002' ? 'HR Manager' : 'Accountant',
        user.employee_id === 'EMP001' ? 'IT' : user.employee_id === 'EMP002' ? 'HR' : 'Finance',
        user.employee_id === 'EMP001' ? 75000.00 : user.employee_id === 'EMP002' ? 65000.00 : 55000.00,
        'ACTIVE'
      ]);
      
      console.log(`Created profile for ${user.employee_id}`);
    }

    // Create a payroll batch
    const totalAmount = users.length * 50000;
    console.log('Total amount:', totalAmount);
    console.log('About to create batch...');
    
    try {
      const batchResult = await query(`
        INSERT INTO payroll_batches (batch_name, upload_user_id, total_employees, total_amount, payroll_date, status, file_path, created_at)
        VALUES ('Sample_Payroll_2024_01_15', ?, ?, ?, '2024-01-15', 'PROCESSED', 'sample_upload', NOW())
      `, [1, users.length, totalAmount]);

      const batchId = batchResult.insertId;
      console.log('Created payroll batch:', batchId);

      // Create payroll details for each user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const grossSalary = 45000 + Math.random() * 30000; // Random between 45k-75k
        const savingsDeduction = grossSalary * 0.15; // 15% savings
        const loanDeduction = Math.random() > 0.5 ? 2000 : 0; // 50% chance of loan deduction
        const netSalary = grossSalary - savingsDeduction - loanDeduction;

        await query(`
          INSERT INTO payroll_details (
            payroll_batch_id, user_id, employee_id, gross_salary, net_salary,
            savings_deduction, loan_repayment_deduction, total_deductions,
            final_amount, payment_status, payment_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          batchId,
          user.id,
          user.employee_id,
          grossSalary.toFixed(2),
          netSalary.toFixed(2),
          savingsDeduction.toFixed(2),
          loanDeduction.toFixed(2),
          (savingsDeduction + loanDeduction).toFixed(2),
          netSalary.toFixed(2),
          'PAID',
          new Date(),
          new Date()
        ]);

        console.log(`Created payroll record for ${user.employee_id}: Gross: $${grossSalary.toFixed(2)}, Net: $${netSalary.toFixed(2)}`);
      }

      console.log('Sample payroll data created successfully!');
      console.log(`Created ${users.length} payroll records for batch ${batchId}`);
    } catch (batchError) {
      console.error('Error creating payroll batch:', batchError);
    }

  } catch (error) {
    console.error('Error creating sample payroll data:', error);
  } finally {
    process.exit(0);
  }
}

createSimplePayrollData();

const { query } = require('../src/config/database');

async function createSamplePayrollData() {
  try {
    console.log('Creating sample payroll data...');

    // First, let's check if we have users
    const [usersResult] = await query('SELECT id, employee_id FROM users LIMIT 5');
    const users = usersResult || [];
    
    if (users.length === 0) {
      console.log('No users found. Creating sample users first...');
      
      // Create sample users
      await query(`
        INSERT INTO users (username, email, password, role, employee_id, created_at) VALUES
        ('john_doe', 'john.doe@company.com', 'password123', 'EMPLOYEE', 'EMP001', NOW()),
        ('jane_smith', 'jane.smith@company.com', 'password123', 'EMPLOYEE', 'EMP002', NOW()),
        ('bob_wilson', 'bob.wilson@company.com', 'password123', 'EMPLOYEE', 'EMP003', NOW())
      `);

      // Create employee profiles
      await query(`
        INSERT INTO employee_profiles (user_id, first_name, last_name, job_role, department, salary, employment_status) VALUES
        (1, 'John', 'Doe', 'Software Engineer', 'IT', 75000.00, 'ACTIVE'),
        (2, 'Jane', 'Smith', 'HR Manager', 'HR', 65000.00, 'ACTIVE'),
        (3, 'Bob', 'Wilson', 'Accountant', 'Finance', 55000.00, 'ACTIVE')
      `);

      // Get the users again
      const [newUsersResult] = await query('SELECT id, employee_id FROM users LIMIT 5');
      users.push(...(newUsersResult || []));
    }

    console.log('Found users:', users);
    console.log('Users length:', users.length);
    console.log('Users length * 50000:', users.length * 50000);

    // Create a payroll batch
    const batchParams = [users.length, users.length * 50000, new Date()];
    console.log('Batch params:', batchParams);
    
    const [batchResult] = await query(`
      INSERT INTO payroll_batches (batch_name, upload_user_id, total_employees, total_amount, payroll_date, status, file_path, created_at)
      VALUES ('Sample_Payroll_2024_01_15', 1, ?, ?, '2024-01-15', 'PROCESSED', 'sample_upload', ?)
    `, batchParams);

    const batchId = batchResult.insertId;
    console.log('Created payroll batch:', batchId);

    // Create payroll details
    for (const user of users) {
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
    }

    console.log('Sample payroll data created successfully!');
    console.log(`Created ${users.length} payroll records for batch ${batchId}`);

  } catch (error) {
    console.error('Error creating sample payroll data:', error);
  } finally {
    process.exit(0);
  }
}

createSamplePayrollData();

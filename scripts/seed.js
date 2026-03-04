const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Read environment variables
    require('dotenv').config({ path: '../.env' });

    // Allow empty password for --skip-grant-tables
    const dbPassword = process.env.DB_PASSWORD || '';
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '', // Empty password for --skip-grant-tables
      database: 'microfinance_system'
    });
    
    console.log('✅ Database connected');
    
    // Sample employees
    const employees = [
      {
        employee_id: 'EMP001',
        username: 'johndoe',
        email: 'john.doe@company.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        address: '123 Main St, City',
        department: 'IT',
        job_grade: 'A1',
        employment_status: 'ACTIVE',
        hire_date: '2023-01-15',
        salary_grade: 5,
        role: 'EMPLOYEE'
      },
      {
        employee_id: 'EMP002',
        username: 'janesmith',
        email: 'jane.smith@company.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567891',
        address: '456 Oak Ave, City',
        department: 'HR',
        job_grade: 'B1',
        employment_status: 'ACTIVE',
        hire_date: '2023-02-20',
        salary_grade: 4,
        role: 'EMPLOYEE'
      },
      {
        employee_id: 'EMP003',
        username: 'bobwilson',
        email: 'bob.wilson@company.com',
        password: 'password123',
        first_name: 'Bob',
        last_name: 'Wilson',
        phone: '+1234567892',
        address: '789 Pine Rd, City',
        department: 'Finance',
        job_grade: 'A2',
        employment_status: 'ACTIVE',
        hire_date: '2023-03-10',
        salary_grade: 6,
        role: 'EMPLOYEE'
      },
      {
        employee_id: 'HR001',
        username: 'hrmanager',
        email: 'hr@company.com',
        password: 'password123',
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '+1234567893',
        address: '321 Elm St, City',
        department: 'HR',
        job_grade: 'C1',
        employment_status: 'ACTIVE',
        hire_date: '2022-06-01',
        salary_grade: 7,
        role: 'HR'
      },
      {
        employee_id: 'FIN001',
        username: 'financemanager',
        email: 'finance@company.com',
        password: 'password123',
        first_name: 'Michael',
        last_name: 'Brown',
        phone: '+1234567894',
        address: '654 Maple Dr, City',
        department: 'Finance',
        job_grade: 'C2',
        employment_status: 'ACTIVE',
        hire_date: '2022-05-15',
        salary_grade: 8,
        role: 'FINANCE'
      }
    ];
    
    // Insert employees
    for (const emp of employees) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(emp.password, saltRounds);
      
      // Insert user
      const [userResult] = await connection.execute(`
        INSERT INTO users (employee_id, username, email, password_hash, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, NOW())
      `, [emp.employee_id, emp.username, emp.email, password_hash, emp.role]);
      
      const userId = userResult.insertId;
      
      // Insert employee profile
      await connection.execute(`
        INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, department, job_grade, employment_status, hire_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, emp.first_name, emp.last_name, emp.phone, emp.address, emp.department, emp.job_grade, emp.employment_status, emp.hire_date]);
      
      // Create savings account
      await connection.execute(`
        INSERT INTO savings_accounts (user_id, employee_id, saving_percentage, current_balance, account_status, created_at)
        VALUES (?, ?, 20.00, 0.00, 'ACTIVE', NOW())
      `, [userId, emp.employee_id]);
      
      console.log(`✅ Created employee: ${emp.first_name} ${emp.last_name} (${emp.employee_id})`);
    }
    
    // Sample loan applications
    const loanApplications = [
      {
        user_id: 2, // John Doe
        employee_id: 'EMP001',
        loan_amount: 5000,
        loan_purpose: 'Home renovation',
        loan_term_months: 12,
        interest_rate: 0.15,
        monthly_payment: 450,
        collateral_description: 'Car and property',
        guarantor_details: []
      },
      {
        user_id: 3, // Jane Smith
        employee_id: 'EMP002',
        loan_amount: 3000,
        loan_purpose: 'Emergency expenses',
        loan_term_months: 6,
        interest_rate: 0.12,
        monthly_payment: 520,
        collateral_description: 'Personal items',
        guarantor_details: []
      }
    ];
    
    // Insert loan applications
    for (const loan of loanApplications) {
      const [appResult] = await connection.execute(`
        INSERT INTO loan_applications (user_id, employee_id, loan_amount, loan_purpose, loan_term_months, interest_rate, monthly_payment, collateral_description, guarantor_details, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())
      `, [loan.user_id, loan.employee_id, loan.loan_amount, loan.loan_purpose, loan.loan_term_months, loan.interest_rate, loan.monthly_payment, loan.collateral_description, JSON.stringify(loan.guarantor_details)]);
      
      console.log(`✅ Created loan application for ${loan.employee_id}`);
    }
    
    // Sample payroll records
    const payrollRecords = [
      {
        user_id: 2,
        employee_id: 'EMP001',
        gross_salary: 5000,
        net_salary: 4200,
        pay_period: '2024-01'
      },
      {
        user_id: 3,
        employee_id: 'EMP002',
        gross_salary: 4500,
        net_salary: 3800,
        pay_period: '2024-01'
      },
      {
        user_id: 4,
        employee_id: 'EMP003',
        gross_salary: 5500,
        net_salary: 4700,
        pay_period: '2024-01'
      }
    ];
    
    // Create payroll batch
    const [batchResult] = await connection.execute(`
      INSERT INTO payroll_batches (status, total_records, processed_count, error_count, uploaded_by, created_at)
      VALUES ('PROCESSED', ?, 0, 0, 0, 1, NOW())
    `, [payrollRecords.length]);
    
    const batchId = batchResult.insertId;
    
    // Insert payroll records
    for (const record of payrollRecords) {
      await connection.execute(`
        INSERT INTO payroll_records (batch_id, user_id, employee_id, gross_salary, net_salary, pay_period, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [batchId, record.user_id, record.employee_id, record.gross_salary, record.net_salary, record.pay_period]);
    }
    
    console.log(`✅ Created payroll batch with ${payrollRecords.length} records`);
    
    await connection.end();
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('👤 Sample users created:');
    console.log('  - Admin: ADMIN001 / admin123');
    console.log('  - Employee: EMP001 / password123 (John Doe)');
    console.log('  - Employee: EMP002 / password123 (Jane Smith)');
    console.log('  - Employee: EMP003 / password123 (Bob Wilson)');
    console.log('  - HR: HR001 / password123 (Sarah Johnson)');
    console.log('  - Finance: FIN001 / password123 (Michael Brown)');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

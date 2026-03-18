require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function seedAdminUsers() {
  try {
    console.log('Seeding admin users...');

    const adminUsers = [
      {
        employee_id: 'ADMIN001',
        username: 'admin@company.com',
        email: 'admin@company.com',
        password: 'password',
        role: 'SUPER_ADMIN',
        first_name: 'System',
        last_name: 'Administrator',
        department: 'IT',
        job_grade: 'ADMIN',
        employment_status: 'ACTIVE',
        hire_date: new Date('2020-01-01')
      },
      {
        employee_id: 'HR001',
        username: 'hr@company.com',
        email: 'hr@company.com',
        password: 'password',
        role: 'HR',
        first_name: 'HR',
        last_name: 'Manager',
        department: 'Human Resources',
        job_grade: 'MANAGER',
        employment_status: 'ACTIVE',
        hire_date: new Date('2020-01-01')
      },
      {
        employee_id: 'FIN001',
        username: 'finance@company.com',
        email: 'finance@company.com',
        password: 'password',
        role: 'FINANCE_ADMIN',
        first_name: 'Finance',
        last_name: 'Manager',
        department: 'Finance',
        job_grade: 'MANAGER',
        employment_status: 'ACTIVE',
        hire_date: new Date('2020-01-01')
      },
      {
        employee_id: 'LOAN001',
        username: 'loan@company.com',
        email: 'loan@company.com',
        password: 'password',
        role: 'LOAN_COMMITTEE',
        first_name: 'Loan Committee',
        last_name: 'Chair',
        department: 'Loans',
        job_grade: 'CHAIR',
        employment_status: 'ACTIVE',
        hire_date: new Date('2020-01-01')
      }
    ];

    for (const adminUser of adminUsers) {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? OR employee_id = ?',
        [adminUser.email, adminUser.employee_id]
      );

      if (existingUser.length === 0) {
        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const password_hash = await bcrypt.hash(adminUser.password, saltRounds);

        // Insert user
        const userResult = await query(
          `INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, first_name, last_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            adminUser.employee_id,
            adminUser.username,
            adminUser.email,
            password_hash,
            adminUser.role,
            true,
            true,
            adminUser.first_name,
            adminUser.last_name
          ]
        );

        const userId = userResult.insertId;

        // Insert employee profile
        await query(
          `INSERT INTO employee_profiles 
           (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, hr_verified, hr_verification_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            adminUser.employee_id,
            adminUser.first_name,
            adminUser.last_name,
            adminUser.department,
            adminUser.job_grade,
            adminUser.employment_status,
            adminUser.hire_date,
            true,
            new Date()
          ]
        );

        console.log(`✅ Created admin user: ${adminUser.email} (${adminUser.role})`);
      } else {
        console.log(`⚠️  Admin user already exists: ${adminUser.email}`);
      }
    }

    // Create sample employee
    const existingEmployee = await query('SELECT id FROM users WHERE employee_id = ?', ['EMP001']);
    
    if (existingEmployee.length === 0) {
      const employeePassword = await bcrypt.hash('password', 12);
      
      const employeeResult = await query(
        `INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['EMP001', 'EMP001', 'john.doe@company.com', employeePassword, 'EMPLOYEE', true, true, 'John', 'Doe']
      );

      const employeeId = employeeResult.insertId;

      await query(
        `INSERT INTO employee_profiles 
         (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, hr_verified, hr_verification_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          'EMP001',
          'John',
          'Doe',
          'Engineering',
          'Senior Developer',
          'ACTIVE',
          new Date('2022-01-15'),
          true,
          new Date()
        ]
      );

      console.log(`✅ Created sample employee: EMP001`);
    } else {
      console.log(`⚠️  Sample employee already exists: EMP001`);
    }

    console.log('\n🎉 Admin users seeding completed!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@company.com / password');
    console.log('HR: hr@company.com / password');
    console.log('Finance: finance@company.com / password');
    console.log('Loan Committee: loan@company.com / password');
    console.log('Employee: EMP001 / password');

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
  } finally {
    process.exit(0);
  }
}

seedAdminUsers();

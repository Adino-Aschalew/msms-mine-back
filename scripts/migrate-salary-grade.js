const db = require('../src/config/database');

async function migrateSalaryGrade() {
  try {
    console.log('Adding salary_grade column to employee_profiles...');
    
    // Check if column exists first
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employee_profiles' 
      AND COLUMN_NAME = 'salary_grade'
    `);
    
    if (columns && columns.length > 0) {
      console.log('salary_grade column already exists.');
    } else {
      await db.query(`
        ALTER TABLE employee_profiles 
        ADD COLUMN salary_grade INT(11) DEFAULT 1 AFTER job_grade
      `);
      console.log('Successfully added salary_grade column.');
    }

    console.log('Mapping existing job_grades to salary_grades...');
    
    const gradesMap = {
      'EXECUTIVE': 6,
      'MANAGER': 5,
      'SENIOR': 4,
      'MID': 3,
      'JUNIOR': 2,
      'ENTRY': 1,
      'SPECIALIST': 4,
      'SUPERVISOR': 4,
      'OFFICER': 2,
      'CLERK': 1
    };

    for (const [jobGrade, salaryGrade] of Object.entries(gradesMap)) {
      await db.query(
        'UPDATE employee_profiles SET salary_grade = ? WHERE UPPER(job_grade) = ?',
        [salaryGrade, jobGrade]
      );
    }
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSalaryGrade();

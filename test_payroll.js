const { query } = require('./src/config/database');
const Payroll = require('./src/models/Payroll');

// Test payroll processing with sample data
async function testPayroll() {
  try {
    console.log('Testing payroll processing...');
    
    // Sample data that matches your format
    const sampleData = [
      {
        employee_id: 'EMP001',
        gross_salary: 5000,
        saving: 500,
        deduction: 500,
        net_salary: 4000,
        payroll_date: '2024-03-31'
      }
    ];
    
    console.log('Sample data:', sampleData);
    
    // Test validation
    const validationResults = await Payroll.validatePayrollData(sampleData);
    console.log('Validation results:', validationResults);
    
    if (validationResults.errors.length > 0) {
      console.error('Validation errors:', validationResults.errors);
    } else {
      console.log('Validation passed! Valid records:', validationResults.validRecords.length);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testPayroll();

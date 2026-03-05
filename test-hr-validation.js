const HrService = require('./src/modules/hr/hr.service');

// Test HR validation directly
async function testHRValidation() {
  console.log('Testing HR Employee Validation...\n');
  
  // Test case 1: Valid employee
  console.log('1. Testing valid employee ID (EMP001):');
  try {
    const employee = await HrService.validateEmployee('EMP001');
    console.log('✅ Success:', JSON.stringify(employee, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 2: Another valid employee
  console.log('2. Testing valid employee ID (EMP002):');
  try {
    const employee = await HrService.validateEmployee('EMP002');
    console.log('✅ Success:', JSON.stringify(employee, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 3: Invalid employee
  console.log('3. Testing invalid employee ID (INVALID123):');
  try {
    const employee = await HrService.validateEmployee('INVALID123');
    console.log('❌ This should have failed!');
  } catch (error) {
    console.log('✅ Correctly rejected:', error.message);
  }
}

testHRValidation().catch(console.error);

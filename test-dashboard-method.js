const HrService = require('./src/modules/hr/hr.service');

async function testDashboardMethod() {
  try {
    console.log('🔄 Testing dashboard method directly...');
    
    const result = await HrService.getDashboardStats();
    console.log('✅ Dashboard method executed successfully!');
    console.log('Result keys:', Object.keys(result));
    console.log('Total Employees:', result.totalEmployees);
    console.log('Active Employees:', result.activeEmployees);
    console.log('Verified Employees:', result.verifiedEmployees);
    console.log('Full result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Dashboard method failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDashboardMethod();

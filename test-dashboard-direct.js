const HrService = require('./src/modules/hr/hr.service');

async function testDashboardDirectly() {
  try {
    console.log('🔄 Testing dashboard method directly...');
    
    const result = await HrService.getDashboardStats();
    console.log('✅ Dashboard method works!');
    console.log('Result keys:', Object.keys(result));
    console.log('Total employees:', result.totalEmployees);
    
  } catch (error) {
    console.log('❌ Dashboard method failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDashboardDirectly();

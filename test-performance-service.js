const HrService = require('./src/modules/hr/hr.service');

async function testPerformanceService() {
  try {
    console.log('🔄 Testing Performance Service directly...');
    
    const stats = await HrService.getPerformanceStats();
    console.log('✅ Performance Service - Success');
    console.log('Result:', JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.log('❌ Performance Service - Failed');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testPerformanceService();

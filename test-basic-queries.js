const { query } = require('./src/config/database');

async function testBasicQueries() {
  try {
    console.log('🔍 Testing basic database queries...');
    
    // Test users query
    console.log('\n👥 Testing users query...');
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);
    
    // Test employee_profiles query
    console.log('\n📋 Testing employee_profiles query...');
    const [profiles] = await query('SELECT COUNT(*) as count FROM employee_profiles');
    console.log('Employee profiles count:', profiles[0].count);
    
    // Test performance_reviews query
    console.log('\n⭐ Testing performance_reviews query...');
    const [reviews] = await query('SELECT COUNT(*) as count FROM performance_reviews');
    console.log('Performance reviews count:', reviews[0].count);
    
    // Test a simple reports query
    console.log('\n📊 Testing reports query...');
    const [monthlyUsers] = await query(`
      SELECT 
        DATE_FORMAT(u.created_at, '%Y-%m') as month,
        COUNT(*) as employee_count
      FROM users u
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
      ORDER BY month
    `);
    
    console.log('Monthly users:', monthlyUsers);
    
  } catch (error) {
    console.error('❌ Query test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBasicQueries();

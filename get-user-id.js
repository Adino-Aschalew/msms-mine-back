const { query } = require('./src/config/database');

async function getUserId() {
  try {
    console.log('Getting user IDs...');
    
    // Get first user with employee profile
    const [users] = await query(`
      SELECT u.id, u.employee_id, u.username, ep.first_name, ep.last_name 
      FROM users u 
      INNER JOIN employee_profiles ep ON u.id = ep.user_id 
      WHERE u.is_active = 1 
      LIMIT 1
    `);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Found user:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Employee ID: ${user.employee_id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log('');
      console.log('🎯 Use this for risk assessment:');
      console.log(`{ "userId": ${user.id}, "loanAmount": 5000, "loanTerm": 12 }`);
    } else {
      console.log('❌ No active users with employee profiles found');
      
      // Get any user
      const [anyUsers] = await query('SELECT id, employee_id, username FROM users WHERE is_active = 1 LIMIT 1');
      if (anyUsers.length > 0) {
        const user = anyUsers[0];
        console.log('✅ Found user without profile:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Employee ID: ${user.employee_id}`);
        console.log(`  Username: ${user.username}`);
        console.log('');
        console.log('🎯 Use this for risk assessment:');
        console.log(`{ "userId": ${user.id}, "loanAmount": 5000, "loanTerm": 12 }`);
      } else {
        console.log('❌ No active users found at all');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getUserId();

const { query } = require('./src/config/database');

async function debugUserQuery() {
  try {
    console.log('🔍 Debugging user query...');
    
    // 1. Check if user exists at all
    const [allUsers] = await query('SELECT id, employee_id, username, is_active FROM users WHERE employee_id = ?', ['ADMIN001']);
    console.log('All users with ADMIN001:', allUsers);
    
    // 2. Check the exact query from auth middleware
    const [authQuery] = await query(
      `SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade 
       FROM users u 
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
       WHERE u.id = ? AND u.is_active = true`,
      [1]
    );
    console.log('Auth middleware query result:', authQuery);
    
    // 3. Check without is_active condition
    const [withoutActive] = await query(
      `SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade 
       FROM users u 
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
       WHERE u.id = ?`,
      [1]
    );
    console.log('Without is_active check:', withoutActive);
    
    // 4. Check is_active value
    const [activeCheck] = await query('SELECT id, employee_id, is_active FROM users WHERE id = ?', [1]);
    console.log('Is_active check:', activeCheck);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugUserQuery();

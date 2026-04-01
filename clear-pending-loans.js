const mysql = require('mysql2/promise');

async function clearPendingLoans() {
  try {
    console.log('🔧 Clearing pending loan applications...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'microfinance_system'
    });
    
    console.log('✅ Database connected');
    
    // Check pending applications for user ID 5 (John Doe)
    const [pendingApps] = await connection.execute(
      'SELECT * FROM loan_applications WHERE user_id = 5 AND status = "PENDING"'
    );
    
    console.log(`📊 Found ${pendingApps.length} pending applications for user ID 5`);
    
    if (pendingApps.length > 0) {
      // Delete pending applications
      const [result] = await connection.execute(
        'DELETE FROM loan_applications WHERE user_id = 5 AND status = "PENDING"'
      );
      
      console.log(`🗑️  Deleted ${result.affectedRows} pending loan applications`);
      
      // Show what was deleted
      pendingApps.forEach(app => {
        console.log(`   - Application ID: ${app.id}, Amount: ${app.requested_amount}, Purpose: ${app.purpose}`);
      });
    } else {
      console.log('ℹ️  No pending applications found');
    }
    
    // Verify no pending applications remain
    const [checkResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM loan_applications WHERE user_id = 5 AND status = "PENDING"'
    );
    
    console.log(`✅ Verification: ${checkResult[0].count} pending applications remaining`);
    
    await connection.end();
    console.log('🎉 Done! User can now apply for loans.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearPendingLoans();

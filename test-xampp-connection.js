const mysql = require('mysql2/promise');

async function testXAMPPConnection() {
  console.log('Testing XAMPP MySQL Connection...\n');
  
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'microfinance_system',
    port: 3307,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  };

  try {
    console.log('Attempting to connect to MySQL with config:', {
      ...dbConfig,
      password: dbConfig.password ? '[HIDDEN]' : '[EMPTY]'
    });
    
    const pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to XAMPP MySQL!');
    console.log('Database info:');
    console.log('- Host:', dbConfig.host);
    console.log('- Port:', dbConfig.port);
    console.log('- User:', dbConfig.user);
    console.log('- Database:', dbConfig.database);
    
    connection.release();
    
    // Test if database exists
    const [rows] = await pool.execute('SHOW DATABASES');
    const dbExists = rows.some(row => row.Database === dbConfig.database);
    
    if (dbExists) {
      console.log('✅ Database "microfinance_system" exists');
    } else {
      console.log('❌ Database "microfinance_system" does not exist');
      console.log('Creating database...');
      await pool.execute(`CREATE DATABASE ${dbConfig.database}`);
      console.log('✅ Database created successfully');
    }
    
    await pool.end();
    console.log('\n🎉 XAMPP MySQL connection test completed successfully!');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure XAMPP is installed and running');
    console.log('2. Start Apache and MySQL from XAMPP Control Panel');
    console.log('3. Check if MySQL is running on port 3307');
    console.log('4. Verify user credentials (usually root with no password)');
    console.log('5. Check if firewall is blocking port 3307');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Quick fix: Start XAMPP MySQL service');
      console.log('   - Open XAMPP Control Panel');
      console.log('   - Click "Start" next to MySQL');
      console.log('   - The MySQL indicator should turn green');
    }
  }
}

testXAMPPConnection();

const fs = require('fs');
const path = require('path');

async function runPerformanceSchema() {
  try {
    console.log('🔄 Creating performance database schema...');
    
    // Read the performance schema file
    const schemaPath = path.join(__dirname, 'performance-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Import database connection
    const { query } = require('./src/config/database');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        await query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.log(`❌ Error executing statement ${i + 1}: ${error.message}`);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('\n🎉 Performance schema creation completed!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying created tables...');
    const tables = await query('SHOW TABLES LIKE "performance_%"');
    console.log('Created tables:', tables.map(t => t[`Tables_in_${process.env.DB_NAME || 'msms'} || 'Tables_in_test'`]));
    
  } catch (error) {
    console.error('❌ Error running performance schema:', error.message);
    console.error('Stack:', error.stack);
  }
}

runPerformanceSchema();

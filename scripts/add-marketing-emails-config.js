const { pool } = require('../src/config/database');

async function addMarketingEmailsConfig() {
  try {
    console.log('Adding marketing_emails to system_configuration...');
    
    // Check if marketing_emails already exists
    const [existing] = await pool.execute(
      'SELECT config_key FROM system_configuration WHERE config_key = ?',
      ['marketing_emails']
    );
    
    if (existing.length > 0) {
      console.log('marketing_emails already exists in system_configuration');
      process.exit(0);
    }
    
    // Insert marketing_emails configuration
    await pool.execute(`
      INSERT INTO system_configuration (config_key, config_value, config_type, description, is_active, created_at, updated_at)
      VALUES ('marketing_emails', 'false', 'BOOLEAN', 'Enable/disable marketing emails for all users', TRUE, NOW(), NOW())
    `);
    
    console.log('Successfully added marketing_emails to system_configuration');
    process.exit(0);
  } catch (error) {
    console.error('Error adding marketing_emails:', error);
    process.exit(1);
  }
}

addMarketingEmailsConfig();

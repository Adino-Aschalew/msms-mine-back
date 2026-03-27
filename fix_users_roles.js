const { query } = require('./src/config/database');

async function fixRoles() {
  try {
    const result = await query('UPDATE users SET role = "EMPLOYEE" WHERE (role = "" OR role IS NULL) AND employee_id IS NOT NULL AND employee_id != ""');
    console.log(`Updated ${result.affectedRows} users with empty roles to "EMPLOYEE"`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixRoles();

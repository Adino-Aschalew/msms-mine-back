const { query } = require('./src/config/database');

async function updateAdmin() {
  try {
    console.log('Updating Admin user identifier to "Admin@2026"...');
    const result = await query(
      "UPDATE users SET username = 'Admin@2026', email = 'Admin@2026' WHERE id = 1"
    );
    console.log('Admin user updated successfully:', result.affectedRows, 'row(s) changed.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    process.exit();
  }
}

updateAdmin();

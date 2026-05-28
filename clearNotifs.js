const { query } = require('./src/config/database');
async function run() {
  try {
    const res = await query("DELETE FROM notifications WHERE title IN ('System Update', 'Action Required', 'Payroll Processed')");
    console.log('Successfully deleted the seeded test notifications. Rows affected: ', res.affectedRows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();

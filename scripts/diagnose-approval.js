/**
 * Diagnostic script for loan approval 500 error
 * Usage: node scripts/diagnose-approval.js [applicationId]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/database');

async function diagnose() {
  const appId = process.argv[2] || 7; // default to app 7 from the error

  console.log('\n=== 1. ACTUAL loan_applications COLUMNS ===');
  const [cols] = await pool.execute('SHOW COLUMNS FROM loan_applications');
  cols.forEach(c => console.log(`  ${c.Field}  [${c.Type}] ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'}`));

  console.log(`\n=== 2. Application #${appId} RAW DATA ===`);
  const [apps] = await pool.execute('SELECT * FROM loan_applications WHERE id = ?', [appId]);
  if (!apps.length) { console.log('  NOT FOUND'); process.exit(0); }
  console.log(apps[0]);

  console.log(`\n=== 3. Guarantors for application #${appId} ===`);
  const [guar] = await pool.execute('SELECT id, status FROM guarantors WHERE loan_application_id = ?', [appId]);
  console.log(guar.length ? guar : '  NONE');

  console.log('\n=== 4. Testing UPDATE query ===');
  try {
    // Detect correct column names
    const colNames = cols.map(c => c.Field);
    const reviewDateCol  = colNames.includes('review_date')    ? 'review_date'    : 'reviewed_at';
    const reviewNotesCol = colNames.includes('review_comments') ? 'review_comments' : 'review_notes';
    const reviewedByCol  = colNames.includes('reviewed_by')    ? 'reviewed_by'    : 'reviewed_by';

    console.log(`  Using columns: reviewed_by=${reviewedByCol}, review_date=${reviewDateCol}, review_comments=${reviewNotesCol}`);

    const app = apps[0];
    const finalAmount = app.approved_amount || app.requested_amount || app.loan_amount;
    const termCol = colNames.includes('repayment_duration_months') ? 'repayment_duration_months' : 'loan_term_months';
    const finalTerm = app.approved_term_months || app[termCol];

    const sql = `
      UPDATE loan_applications
      SET status = 'APPROVED',
          ${reviewedByCol} = ?,
          ${reviewDateCol} = NOW(),
          ${reviewNotesCol} = ?,
          approved_amount = ?,
          approved_term_months = ?,
          approved_interest_rate = ?
      WHERE id = ?
    `;
    console.log('  SQL:', sql.trim());
    const params = [1, JSON.stringify({ test: true }), finalAmount, finalTerm, 5.0, appId];
    console.log('  Params:', params);
    await pool.execute(sql, params);
    console.log('  ✅ UPDATE succeeded!');

    // Rollback — set back to PENDING
    await pool.execute("UPDATE loan_applications SET status = 'PENDING' WHERE id = ?", [appId]);
    console.log('  ↩  Reverted to PENDING');
  } catch (err) {
    console.error('  ❌ UPDATE FAILED:', err.message);
    console.error('  SQL Error Code:', err.code);
  }

  await pool.end();
}

diagnose().catch(e => { console.error(e); process.exit(1); });

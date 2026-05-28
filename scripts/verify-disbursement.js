const CommitteeService = require('../src/modules/loanCommittee/committee.service');
const db = require('../src/config/database');

async function testDisbursement() {
    try {
        console.log('🚀 Starting disbursement test for Application #7...');
        
        // Simulating the request parameters
        const applicationId = 7;
        const adminUserId = 25; // Committee member who approved it
        const ip = '127.0.0.1';
        const userAgent = 'Manual-Test-Script';

        // Before check
        console.log('Checking application status before...');
        const apps = await db.query('SELECT id, status FROM loan_applications WHERE id = ?', [applicationId]);
        
        if (!apps || apps.length === 0) {
            console.error('❌ Application not found!');
            process.exit(1);
        }

        console.log('Current status:', apps[0].status);

        if (apps[0].status !== 'APPROVED') {
            console.log('Force approving for test...');
            await db.query('UPDATE loan_applications SET status = "APPROVED" WHERE id = ?', [applicationId]);
        }

        const result = await CommitteeService.disburseLoan(applicationId, adminUserId, ip, userAgent);
        console.log('✅ Disbursement successful!', result);

        // After check
        const loans = await db.query('SELECT * FROM loans WHERE loan_application_id = ?', [applicationId]);
        console.log('New Loan record created:', loans[0]);
        
        const appsAfter = await db.query('SELECT id, status, disbursement_date FROM loan_applications WHERE id = ?', [applicationId]);
        console.log('Application status after:', appsAfter[0]);

        process.exit(0);
    } catch (error) {
        console.error('❌ Disbursement test failed!');
        console.error(error);
        process.exit(1);
    }
}

testDisbursement();

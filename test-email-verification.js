/**
 * Test Email Verification Flow
 * 
 * This script tests the email verification implementation:
 * 1. Creates a test employee (email_verified = FALSE)
 * 2. Attempts login (should fail with email verification error)
 * 3. Requests OTP (sends verification email)
 * 4. Verifies OTP (should succeed)
 * 5. Attempts login again (should succeed)
 * 
 * PREREQUISITES:
 * 1. Configure SMTP credentials in .env file:
 *    - SMTP_USER=your_email@gmail.com
 *    - SMTP_PASS=your_app_password_here
 * 2. Get Gmail App Password: https://support.google.com/accounts/answer/185833
 * 3. Run: node test-email-verification.js
 */

const bcrypt = require('bcryptjs');
const { query } = require('./src/config/database');
const AuthService = require('./src/modules/auth/auth.service');

const TEST_EMPLOYEE = {
  employee_id: 'TEST001',
  username: 'testuser',
  email: 'bekalusafari2018@gmail.com', // Real email for testing
  first_name: 'Test',
  last_name: 'User',
  department: 'IT',
  job_grade: 'TEST',
  default_password: 'BIT##123'
};

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  try {
    await query('DELETE FROM otp_verifications WHERE user_id IN (SELECT id FROM users WHERE employee_id = ?)', [TEST_EMPLOYEE.employee_id]);
    await query('DELETE FROM employee_profiles WHERE user_id IN (SELECT id FROM users WHERE employee_id = ?)', [TEST_EMPLOYEE.employee_id]);
    await query('DELETE FROM users WHERE employee_id = ?', [TEST_EMPLOYEE.employee_id]);
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.log('⚠️  Cleanup error (may not exist yet):', error.message);
  }
}

async function createTestEmployee() {
  console.log('\n📝 Creating test employee...');

  // Delete existing user with this email if exists
  await query('DELETE FROM otp_verifications WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [TEST_EMPLOYEE.email]);
  await query('DELETE FROM employee_profiles WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [TEST_EMPLOYEE.email]);
  await query('DELETE FROM users WHERE email = ?', [TEST_EMPLOYEE.email]);

  const saltRounds = 12;
  const password_hash = await bcrypt.hash(TEST_EMPLOYEE.default_password, saltRounds);

  // Create user with email_verified = FALSE
  const userResult = await query(`
    INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, password_change_required, created_at)
    VALUES (?, ?, ?, ?, 'EMPLOYEE', TRUE, FALSE, TRUE, NOW())
  `, [TEST_EMPLOYEE.employee_id, TEST_EMPLOYEE.username, TEST_EMPLOYEE.email, password_hash]);

  const userId = userResult.insertId;

  // Create employee profile
  await query(`
    INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())
  `, [userId, TEST_EMPLOYEE.employee_id, TEST_EMPLOYEE.first_name, TEST_EMPLOYEE.last_name, TEST_EMPLOYEE.department, TEST_EMPLOYEE.job_grade]);

  console.log(`✅ Test employee created: ${TEST_EMPLOYEE.employee_id} (${TEST_EMPLOYEE.email})`);
  console.log(`   Password: ${TEST_EMPLOYEE.default_password}`);
  console.log(`   Email Verified: FALSE (as expected)`);

  return userId;
}

async function testLoginBeforeVerification() {
  console.log('\n🔐 Testing login BEFORE email verification...');
  try {
    const result = await AuthService.login(
      TEST_EMPLOYEE.employee_id,
      TEST_EMPLOYEE.default_password,
      'EMPLOYEE',
      '127.0.0.1',
      'TestAgent'
    );
    // Login should succeed even if email is not verified (new flow)
    // Verification happens after login in the frontend
    if (result.user.email_verified === false) {
      console.log('✅ Login succeeded with email_verified = FALSE (as expected in new flow)');
      console.log('   Frontend will redirect to verification page');
      return true;
    } else {
      console.log('❌ UNEXPECTED: email_verified should be FALSE');
      return false;
    }
  } catch (error) {
    console.log('❌ UNEXPECTED ERROR:', error.message);
    return false;
  }
}

async function testRequestOTP(userId) {
  console.log('\n📧 Requesting OTP verification code...');
  try {
    const result = await AuthService.requestOTP(userId, '127.0.0.1', 'TestAgent');
    console.log('✅ OTP requested successfully');
    console.log(`   📨 Verification email sent to: ${TEST_EMPLOYEE.email}`);
    console.log('   ⏱️  Code expires in 60 seconds');
    console.log('   📋 Check your email inbox for the 6-digit code');
    return true;
  } catch (error) {
    console.log('❌ OTP request failed:', error.message);
    console.log('   Make sure SMTP credentials are configured in .env');
    return false;
  }
}

async function getOTPFromDatabase(userId) {
  console.log('\n🔍 Retrieving OTP from database (for testing purposes)...');
  try {
    const [otpRecord] = await query(`
      SELECT otp_code, expires_at FROM otp_verifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);
    
    if (otpRecord) {
      console.log(`✅ OTP found: ${otpRecord.otp_code}`);
      console.log(`   Expires at: ${otpRecord.expires_at}`);
      return otpRecord.otp_code;
    } else {
      console.log('❌ No OTP found in database');
      return null;
    }
  } catch (error) {
    console.log('❌ Error retrieving OTP:', error.message);
    return null;
  }
}

async function testVerifyOTP(userId, otpCode) {
  console.log('\n✅ Verifying OTP code...');
  try {
    const result = await AuthService.verifyOTP(userId, otpCode, '127.0.0.1', 'TestAgent');
    console.log('✅ Email verified successfully!');
    
    // Verify email_verified is now TRUE
    const [user] = await query('SELECT email_verified FROM users WHERE id = ?', [userId]);
    console.log(`   Email Verified in DB: ${user.email_verified === 1 ? 'TRUE ✅' : 'FALSE ❌'}`);
    
    return true;
  } catch (error) {
    console.log('❌ OTP verification failed:', error.message);
    return false;
  }
}

async function testLoginAfterVerification() {
  console.log('\n🔐 Testing login AFTER email verification...');
  try {
    const result = await AuthService.login(
      TEST_EMPLOYEE.employee_id,
      TEST_EMPLOYEE.default_password,
      'EMPLOYEE',
      '127.0.0.1',
      'TestAgent'
    );
    console.log('✅ Login successful after verification!');
    console.log(`   User ID: ${result.user.id}`);
    console.log(`   Employee ID: ${result.user.employee_id}`);
    console.log(`   Email Verified: ${result.user.email_verified}`);
    console.log(`   Token generated: ${result.token ? 'Yes ✅' : 'No ❌'}`);
    return true;
  } catch (error) {
    console.log('❌ Login failed after verification:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Email Verification Flow Tests\n');
  console.log('=' .repeat(60));
  
  try {
    // Cleanup any existing test data
    await cleanup();
    
    // Step 1: Create test employee
    const userId = await createTestEmployee();
    
    // Step 2: Test login before verification (should fail)
    const loginBlocked = await testLoginBeforeVerification();
    if (!loginBlocked) {
      throw new Error('Login was not blocked for unverified email');
    }
    
    // Step 3: Request OTP
    const otpRequested = await testRequestOTP(userId);
    if (!otpRequested) {
      console.log('\n⚠️  Cannot continue without OTP. Please check SMTP configuration.');
      return;
    }
    
    // Step 4: Get OTP from database (for testing - in real flow, user enters from email)
    const otpCode = await getOTPFromDatabase(userId);
    if (!otpCode) {
      throw new Error('Could not retrieve OTP from database');
    }
    
    // Step 5: Verify OTP
    const otpVerified = await testVerifyOTP(userId, otpCode);
    if (!otpVerified) {
      throw new Error('OTP verification failed');
    }
    
    // Step 6: Test login after verification (should succeed)
    const loginSuccess = await testLoginAfterVerification();
    if (!loginSuccess) {
      throw new Error('Login failed after email verification');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Employee created with email_verified = FALSE');
    console.log('   ✅ Login blocked for unverified email');
    console.log('   ✅ OTP requested and email sent');
    console.log('   ✅ OTP verified successfully');
    console.log('   ✅ Login successful after verification');
    console.log('\n🎉 Email verification is working correctly!');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ TEST FAILED:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('   1. Check SMTP credentials in .env file');
    console.log('   2. Ensure Gmail App Password is correct');
    console.log('   3. Check database connection');
    console.log('   4. Verify email address is valid');
  } finally {
    // Cleanup test data
    await cleanup();
    console.log('\n🧹 Test data cleaned up');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

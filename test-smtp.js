/**
 * Test SMTP Email Configuration
 * 
 * This script tests if the SMTP configuration is working correctly
 * by sending a test email to your configured address.
 */

const nodemailer = require('nodemailer');

console.log('📧 Testing SMTP Configuration...\n');

// Load environment variables
require('dotenv').config();

console.log('SMTP Configuration:');
console.log('  Host:', process.env.SMTP_HOST);
console.log('  Port:', process.env.SMTP_PORT);
console.log('  Secure:', process.env.SMTP_SECURE);
console.log('  User:', process.env.SMTP_USER);
console.log('  From:', process.env.SMTP_FROM);
console.log('');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('❌ SMTP configuration incomplete. Please check .env file');
  process.exit(1);
}

async function testSMTP() {
  try {
    console.log('🔌 Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('✅ Transporter created');
    console.log('🔍 Verifying connection...');

    await transporter.verify();
    console.log('✅ SMTP connection verified successfully\n');

    console.log('📨 Sending test email...');
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'MSMS SMTP Test Email',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">SMTP Test Successful</h2>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <p>This is a test email from the MSMS system.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">MSMS Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   To:', process.env.SMTP_USER);
    console.log('\n🎉 SMTP is working correctly! Check your inbox for the test email.');

  } catch (error) {
    console.log('❌ SMTP test failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('   1. Check if Gmail App Password is correct');
    console.log('   2. Ensure 2-Step Verification is enabled on your Google account');
    console.log('   3. Verify the App Password was created for "Mail" or "Other"');
    console.log('   4. Try using port 587 with secure=false instead of port 465');
    console.log('   5. Check if your firewall is blocking SMTP connections');
    console.log('\n🔧 Current Configuration:');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    console.log('   Secure:', process.env.SMTP_SECURE);
    process.exit(1);
  }
}

testSMTP();

const { sendWelcomeEmail } = require('./utils/emailService');

async function testWelcomeEmail() {
  try {
    console.log('Testing welcome email...');
    await sendWelcomeEmail('test@example.com', 'Test User', 'candidate');
    console.log('✅ Welcome email sent successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testWelcomeEmail();
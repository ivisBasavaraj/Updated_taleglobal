const nodemailer = require('nodemailer');

async function testBasicEmail() {
  try {
    console.log('Testing basic email connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'byalimanasi17@gmail.com',
        pass: process.env.EMAIL_PASS || 'cmdimofhdyozexwn'
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'byalimanasi17@gmail.com',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from JobZZ Portal'
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Basic email sent successfully!');
  } catch (error) {
    console.error('❌ Basic email test failed:', error);
  }
}

testBasicEmail();
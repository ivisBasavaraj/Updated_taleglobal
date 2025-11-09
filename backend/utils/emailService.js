const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendWelcomeEmail = async (email, name, userType) => {
  const transporter = createTransport();
  
  const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to tale-global</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Welcome to tale-global! We're excited to have you join our community of ${userType === 'employer' ? 'employers' : userType === 'placement' ? 'placement officers' : 'job seekers'}.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Key Features:</h3>
          <ul style="color: #666; line-height: 1.8;">
            ${userType === 'employer' ? `
              <li>Post unlimited job openings</li>
              <li>Access to qualified candidates</li>
              <li>Advanced application management</li>
              <li>Interview scheduling tools</li>
            ` : userType === 'placement' ? `
              <li>Upload student data files</li>
              <li>Manage student registrations</li>
              <li>Track placement activities</li>
              <li>Monitor student applications</li>
            ` : `
              <li>Browse thousands of job opportunities</li>
              <li>Create a comprehensive profile</li>
              <li>Apply to jobs with one click</li>
              <li>Track your application status</li>
            `}
          </ul>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Get started by completing your profile and exploring all the opportunities available on our platform.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The tale-global Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to tale-global',
    html: welcomeTemplate
  };

  await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, resetToken, userType) => {
  const transporter = createTransport();
  const basePath = userType === 'employer' ? '/employer' : userType === 'placement' ? '/placement' : '/candidate';
  const resetUrl = `${process.env.FRONTEND_URL}${basePath}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordCreationEmail = async (email, name) => {
  const transporter = createTransport();
  const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?email=${encodeURIComponent(email)}`;
  
  const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to TaleGlobal!</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up with TaleGlobal! We're excited to have you join our community of job seekers.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          To complete your registration, please create your password by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${createPasswordUrl}" style="background-color: #fd7e14; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Create Your Password</a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Create your password</li>
            <li>Complete your profile</li>
            <li>Browse thousands of job opportunities</li>
            <li>Apply to jobs with one click</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to TaleGlobal - Create Your Password',
    html: welcomeTemplate
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendResetEmail, sendPasswordCreationEmail };
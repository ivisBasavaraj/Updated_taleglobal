const Employer = require('../models/Employer');

exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employer = await Employer.findOne({ email });

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    if (employer.password) {
      return res.status(400).json({ success: false, message: 'Password already set' });
    }

    employer.password = password;
    employer.status = 'active';
    await employer.save();

    res.json({ success: true, message: 'Password created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Reset Controllers for Employer
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employer = await Employer.findOne({ email });
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    employer.resetPasswordToken = resetToken;
    employer.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await employer.save();

    const { sendResetEmail } = require('../utils/emailService');
    await sendResetEmail(email, resetToken, 'employer');

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const employer = await Employer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!employer) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    employer.password = newPassword;
    employer.resetPasswordToken = undefined;
    employer.resetPasswordExpires = undefined;
    await employer.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
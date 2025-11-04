import React, { useState, useEffect } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

  useEffect(() => {
    // Load EmailJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init('IUBFJTFkQbQuIA-6P');
    };
    document.head.appendChild(script);
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.includes('@')) {
      setMessage('Please enter a valid email.');
      setLoading(false);
      return;
    }

    // Check if email is registered
    try {
      const response = await fetch('http://localhost:5000/api/candidate/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (!result.exists) {
        setMessage('This email is not registered. Please use a registered email address.');
        setLoading(false);
        return;
      }
    } catch (error) {
      setMessage('Unable to verify email. Please try again.');
      setLoading(false);
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otpCode);

    try {
      if (window.emailjs) {
        const result = await window.emailjs.send(
          'service_efcac65',
          'template_7vg4zm5',
          {
            to_email: email,
            to_name: email.split('@')[0],
            otp_code: otpCode,
            user_email: email
          },
          'IUBFJTFkQbQuIA-6P'
        );
        
        setMessage(`OTP sent to ${email} successfully!`);
        setOtpSent(true);
      } else {
        throw new Error('EmailJS not loaded');
      }
    } catch (error) {
      
      setMessage(`Failed to send email: ${error.text || error.message}. Demo OTP: ${otpCode}`);
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (otp !== generatedOTP) {
      setMessage('Invalid OTP. Please check and try again.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    
    

    try {
      const response = await fetch('http://localhost:5000/api/candidate/password/update-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();
      
      

      if (data.success) {
        
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: '500px' }}>
      <h2 className="mb-2">Forgot Password</h2>
      <p className="text-muted mb-4">Enter your email address and we will send you an OTP to reset your password.</p>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-100" disabled={loading} style={{
            backgroundColor: '#FFF3E5',
            color: '#FF7A00',
            border: '1px solid #FF7A00',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-100" disabled={loading} style={{
            backgroundColor: '#FFF3E5',
            color: '#FF7A00',
            border: '1px solid #FF7A00',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default ForgotPassword;

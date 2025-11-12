import React, { useState, useEffect } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('Please enter a valid email.');
      setSuccess('');
      setLoading(false);
      return;
    }

    // Check if email is registered in any user type
    try {
      const [candidateRes, employerRes, placementRes] = await Promise.all([
        fetch('http://localhost:5000/api/candidate/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }),
        fetch('http://localhost:5000/api/employer/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }),
        fetch('http://localhost:5000/api/placement/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
      ]);
      
      const [candidateData, employerData, placementData] = await Promise.all([
        candidateRes.json(),
        employerRes.json(),
        placementRes.json()
      ]);
      
      if (!candidateData.exists && !employerData.exists && !placementData.exists) {
        setError('This email is not registered. Please use a registered email address.');
        setSuccess('');
        setLoading(false);
        return;
      }
    } catch (error) {
      setError('Unable to verify email. Please try again.');
      setSuccess('');
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
        
        setSuccess(`OTP sent to ${email} successfully!`);
        setError('');
        setOtpSent(true);
      } else {
        throw new Error('EmailJS not loaded');
      }
    } catch (error) {
      
      setError(`Failed to send email: ${error.text || error.message}. Demo OTP: ${otpCode}`);
      setSuccess('');
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (otp !== generatedOTP) {
      setError('Invalid OTP. Please check and try again.');
      setSuccess('');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSuccess('');
      setLoading(false);
      return;
    }

    
    

    try {
      // Try all user types
      const responses = await Promise.all([
        fetch('http://localhost:5000/api/candidate/password/update-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        }),
        fetch('http://localhost:5000/api/employer/password/update-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        }),
        fetch('http://localhost:5000/api/placement/password/update-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        })
      ]);

      const results = await Promise.all(responses.map(r => r.json()));
      const data = results.find(r => r.success) || results[0];
      
      

      if (data.success) {
        
        setSuccess('Password reset successful! Redirecting to login...');
        setError('');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        
        setError(data.message || 'Failed to reset password');
        setSuccess('');
      }
    } catch (error) {
      
      setError('Network error. Please try again.');
      setSuccess('');
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
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
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
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
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
    </div>
  );
}

export default ForgotPassword;

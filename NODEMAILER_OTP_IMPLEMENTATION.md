# Nodemailer OTP Implementation for Forgot Password

## Overview
Implemented nodemailer-based OTP system for forgot password functionality for both Candidates and Employers, replacing the previous EmailJS implementation.

## Backend Changes

### 1. Email Service (`backend/utils/emailService.js`)
- Added `sendOTPEmail()` function to send OTP emails with professional template
- OTP email includes:
  - 6-digit OTP code
  - 10-minute expiration notice
  - Professional styling with TaleGlobal branding

### 2. Database Models

#### Candidate Model (`backend/models/Candidate.js`)
Added fields:
```javascript
resetPasswordOTP: { type: String },
resetPasswordOTPExpires: { type: Date }
```

#### Employer Model (`backend/models/Employer.js`)
Added fields:
```javascript
resetPasswordOTP: { type: String },
resetPasswordOTPExpires: { type: Date }
```

### 3. Controllers

#### Candidate Controller (`backend/controllers/candidateController.js`)
Added methods:
- `sendOTP()` - Generates 6-digit OTP, saves to database, sends email
- `verifyOTPAndResetPassword()` - Verifies OTP and resets password

#### Employer Password Controller (`backend/controllers/employerPasswordController.js`)
Added methods:
- `sendOTP()` - Generates 6-digit OTP, saves to database, sends email
- `verifyOTPAndResetPassword()` - Verifies OTP and resets password

### 4. Routes

#### Candidate Routes (`backend/routes/candidate.js`)
Added endpoints:
```javascript
POST /api/candidate/password/send-otp
POST /api/candidate/password/verify-otp
```

#### Employer Routes (`backend/routes/employer.js`)
Added endpoints:
```javascript
POST /api/employer/password/send-otp
POST /api/employer/password/verify-otp
```

## Frontend Changes

### Forgot Password Component (`frontend/src/app/common/popups/forgot-password.jsx`)
- Removed EmailJS dependency
- Updated to use nodemailer OTP endpoints
- Simplified flow:
  1. User enters email
  2. Backend generates OTP and sends via nodemailer
  3. User enters OTP and new password
  4. Backend verifies OTP and updates password

## Features

### Security
- 6-digit random OTP generation
- 10-minute expiration time
- OTP stored securely in database
- OTP cleared after successful password reset
- Server-side OTP validation

### Email Template
- Professional HTML email design
- Clear OTP display with orange branding
- Expiration notice
- Security reminder

### User Experience
- Clear success/error messages
- Loading states during API calls
- Automatic redirect to login after successful reset
- Form validation

## API Endpoints

### Send OTP
```
POST /api/candidate/password/send-otp
POST /api/employer/password/send-otp

Request Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Verify OTP and Reset Password
```
POST /api/candidate/password/verify-otp
POST /api/employer/password/verify-otp

Request Body:
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successful"
}
```

## Environment Variables Required
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Testing

### Test Flow
1. Navigate to forgot password page
2. Enter registered email
3. Check email for OTP (valid for 10 minutes)
4. Enter OTP and new password
5. Submit and verify redirect to login
6. Login with new password

### Error Cases to Test
- Invalid email (not registered)
- Expired OTP (after 10 minutes)
- Invalid OTP
- Password too short (< 6 characters)
- Network errors

## Benefits Over EmailJS

1. **No Third-Party Dependency**: Direct SMTP control
2. **Better Security**: Server-side OTP generation and validation
3. **Professional Emails**: Custom HTML templates
4. **Cost Effective**: No EmailJS subscription needed
5. **Better Control**: Full control over email sending logic
6. **Reliability**: Direct SMTP connection

## Implementation Date
December 2024

## Notes
- OTP expires after 10 minutes for security
- OTP is automatically cleared after successful password reset
- Works for both Candidate and Employer user types
- Uses existing nodemailer configuration from email service

# OTP Email Fix - Forgot Password

## Problem
The forgot password OTP emails were being sent to only one hardcoded email address (byalimanasi17@gmail.com) instead of the user's actual email address. This was happening because the frontend was using EmailJS service which had a hardcoded recipient email in its template configuration.

## Root Cause
The file `frontend/src/app/pannels/public-user/components/pages/forgot-password.jsx` was using EmailJS to send OTP emails directly from the frontend. EmailJS templates often have hardcoded recipient emails or the service configuration was set to send to a specific test email.

## Solution
Replaced the EmailJS implementation with backend API calls that use Nodemailer. Now the OTP emails are sent through the backend using the email service configured in `.env` file.

### Changes Made

**File: `frontend/src/app/pannels/public-user/components/pages/forgot-password.jsx`**

1. **Removed EmailJS dependency**
   - Removed the `useEffect` hook that loaded EmailJS script
   - Removed `generatedOTP` state variable
   - Removed EmailJS configuration and API calls

2. **Implemented Backend API Integration**
   - OTP is now generated and sent by the backend using Nodemailer
   - Uses the existing backend endpoints:
     - `POST /api/candidate/password/send-otp`
     - `POST /api/employer/password/send-otp`
     - `POST /api/placement/password/send-otp`
   - OTP verification is handled by backend endpoints:
     - `POST /api/candidate/password/verify-otp`
     - `POST /api/employer/password/verify-otp`
     - `POST /api/placement/password/verify-otp`

## How It Works Now

### Send OTP Flow:
1. User enters their email address
2. Frontend tries all user type endpoints (candidate, employer, placement)
3. Backend checks if email exists in database
4. Backend generates a 6-digit OTP
5. Backend stores OTP in database with 10-minute expiry
6. Backend sends OTP email to the user's actual email using Nodemailer
7. User receives OTP at their registered email address

### Verify OTP & Reset Password Flow:
1. User enters the OTP received in their email
2. User enters new password
3. Frontend sends OTP, email, and new password to backend
4. Backend verifies OTP matches and hasn't expired
5. Backend updates the password
6. User is redirected to login page

## Email Configuration
The OTP emails are sent using the SMTP configuration in `backend/.env`:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=workkrr15@gmail.com
EMAIL_PASS=pryhpnhqixohrkpo
```

## Benefits
1. ✅ OTP emails are sent to the correct user email address
2. ✅ More secure - OTP generation and validation happens on backend
3. ✅ Consistent with other email functionality (welcome emails, etc.)
4. ✅ No dependency on third-party EmailJS service
5. ✅ Better error handling and user feedback
6. ✅ Works for all user types (Candidate, Employer, Placement Officer)

## Testing
To test the fix:
1. Go to Forgot Password page
2. Enter a registered email address
3. Click "Send OTP"
4. Check the email inbox for the OTP
5. Enter the OTP and new password
6. Verify password reset is successful

## Notes
- OTP expires after 10 minutes
- OTP is a 6-digit random number
- The same flow works for Candidates, Employers, and Placement Officers
- Email template includes professional styling with TaleGlobal branding

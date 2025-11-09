# Authentication 401 Error Fix Guide

## Problem Identified

When you login as a candidate, you're getting 401 errors with the message:
```
"Please complete your registration by creating a password"
```

## Root Cause

Your candidate account has `status: 'pending'` which means:
1. The account was created via email signup (without password)
2. Password was never set
3. Even though login succeeds, the auth middleware blocks API calls

## Solution Options

### Option 1: Complete Password Creation (Recommended)

If you signed up via email, you need to:
1. Check your email for the password creation link
2. Click the link and create your password
3. This will change your status from 'pending' to 'active'

### Option 2: Direct Database Fix (Quick Fix)

If you have database access, update the candidate status:

```javascript
// In MongoDB shell or Compass
db.candidates.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      status: "active",
      registrationMethod: "signup"
    } 
  }
)
```

### Option 3: Backend Fix (For Developers)

**File:** `backend/controllers/candidateController.js`

**Issue:** Line 113 checks status AFTER password validation, but should check BEFORE:

```javascript
// CURRENT CODE (WRONG ORDER):
const passwordMatch = await candidate.comparePassword(password);
if (!passwordMatch) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}

if (candidate.status === 'pending') {  // ❌ This check is too late
  return res.status(401).json({ success: false, message: 'Please complete your registration by creating a password' });
}
```

**Fix:** Move the status check BEFORE password comparison:

```javascript
// FIXED CODE (CORRECT ORDER):
if (candidate.status === 'pending') {  // ✅ Check status first
  return res.status(401).json({ success: false, message: 'Please complete your registration by creating a password' });
}

const passwordMatch = await candidate.comparePassword(password);
if (!passwordMatch) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
```

## How to Check Your Account Status

### Method 1: Check Database
```javascript
db.candidates.findOne({ email: "your-email@example.com" }, { status: 1, password: 1, registrationMethod: 1 })
```

### Method 2: Check Browser Console
After login attempt, check the API response in Network tab:
- Look for `/api/candidate/login` request
- Check the response body for status information

## Expected Account States

| Status | Has Password | Can Login | Can Access APIs |
|--------|-------------|-----------|-----------------|
| pending | ❌ No | ❌ No | ❌ No |
| pending | ✅ Yes | ✅ Yes | ❌ No (Bug!) |
| active | ✅ Yes | ✅ Yes | ✅ Yes |

## Testing After Fix

1. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   ```

2. **Try logging in again**

3. **Check console** - should see NO 401 errors for:
   - `/api/candidate/profile`
   - `/api/candidate/recommended-jobs`
   - `/api/notifications/candidate`

## Prevention

To avoid this issue in the future:

1. **Always complete password creation** after email signup
2. **Check email** for password creation link
3. **Don't skip the password creation step**

## Quick Database Script

Run this in MongoDB to fix all pending candidates with passwords:

```javascript
// Fix all candidates who have passwords but are still pending
db.candidates.updateMany(
  { 
    status: "pending",
    password: { $exists: true, $ne: null }
  },
  { 
    $set: { 
      status: "active",
      registrationMethod: "signup"
    } 
  }
)
```

## Contact Support

If none of these solutions work:
1. Check if email verification is required
2. Verify JWT token is being stored correctly
3. Check browser console for token in localStorage: `localStorage.getItem('candidateToken')`

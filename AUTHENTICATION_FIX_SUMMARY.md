# Authentication 401 Error - Complete Fix

## Problem Summary

After logging in as a candidate, you're getting 401 (Unauthorized) errors:
```
/api/candidate/recommended-jobs:1 - 401 (Unauthorized)
/api/notifications/candidate:1 - 401 (Unauthorized)  
/api/candidate/profile:1 - 401 (Unauthorized)
```

Error message: **"Please complete your registration by creating a password"**

## Root Cause

Your candidate account has:
- ✅ Email registered
- ✅ Password set
- ❌ Status = 'pending' (should be 'active')

The auth middleware blocks all API calls when status is 'pending', even if you have a valid password and token.

## Fixes Applied

### 1. ✅ Backend Code Fix
**File:** `backend/controllers/candidateController.js`

**What changed:** Moved status check before password validation to prevent login with pending status.

### 2. ✅ Database Fix Script Created
**File:** `backend/scripts/fixPendingCandidates.js`

**What it does:** Updates all candidates with passwords from 'pending' to 'active' status.

## How to Fix Your Account

### Option A: Run the Fix Script (Recommended)

```bash
cd backend
node scripts/fixPendingCandidates.js
```

This will:
1. Find all candidates with passwords but pending status
2. Update them to active status
3. Allow them to login and access all features

### Option B: Manual Database Update

If you have MongoDB access:

```javascript
// Update your specific account
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

Or update all affected candidates:

```javascript
// Update all candidates with passwords but pending status
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

### Option C: Complete Password Creation Flow

If you haven't set a password yet:
1. Check your email for the password creation link
2. Click the link and create your password
3. This will automatically set status to 'active'

## Testing After Fix

1. **Clear browser storage:**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   ```

2. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Login again** at http://localhost:3000/login

4. **Check console** - should see NO 401 errors!

## Expected Results

After the fix, you should see:
- ✅ Login successful
- ✅ Dashboard loads
- ✅ Profile data loads
- ✅ Recommended jobs load
- ✅ Notifications load
- ✅ No 401 errors in console

## Files Modified

1. ✅ `backend/controllers/candidateController.js` - Fixed login flow
2. ✅ `backend/scripts/fixPendingCandidates.js` - Created fix script
3. ✅ `AUTH_FIX_GUIDE.md` - Detailed guide
4. ✅ `AUTHENTICATION_FIX_SUMMARY.md` - This file

## Prevention

To prevent this issue in the future:

1. **Always complete password creation** after email signup
2. **Ensure status is set to 'active'** when password is created
3. **Test login immediately** after registration

## Verification Checklist

After running the fix:

- [ ] Run fix script: `node scripts/fixPendingCandidates.js`
- [ ] Clear browser localStorage
- [ ] Restart backend server
- [ ] Login to candidate account
- [ ] Check browser console for errors
- [ ] Verify dashboard loads correctly
- [ ] Verify profile page loads
- [ ] Verify no 401 errors

## Still Having Issues?

If you still see 401 errors after the fix:

1. **Check token is stored:**
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('candidateToken'));
   ```

2. **Check candidate status:**
   ```javascript
   // In MongoDB:
   db.candidates.findOne({ email: "your-email@example.com" })
   ```

3. **Check backend logs** for any error messages

4. **Verify JWT_SECRET** is set in `.env` file

## Quick Commands

```bash
# Fix pending candidates
cd backend
node scripts/fixPendingCandidates.js

# Restart backend
npm start

# Check MongoDB
mongosh
use your_database_name
db.candidates.find({ status: "pending" }).count()
```

## Success!

Once fixed, you should be able to:
- ✅ Login without errors
- ✅ Access all candidate features
- ✅ View recommended jobs
- ✅ Apply for jobs
- ✅ View notifications
- ✅ Update profile

The authentication system will now work correctly!

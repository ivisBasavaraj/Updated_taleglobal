# Employer Approval Flow - Setup Guide

## Quick Start

The Employer Approval Flow has been successfully implemented! Follow these steps to set it up and test it.

## What's New?

✅ Employers must complete their company profile before posting jobs
✅ Admin must approve employers after profile completion
✅ Automatic notifications at each step
✅ Profile completion validation
✅ New admin endpoints for managing approvals

## Setup Steps

### 1. No Code Changes Required
All backend changes are already implemented. The flow is ready to use!

### 2. Test the Implementation

Run the test script to check the current state:

```bash
cd backend
node scripts/testEmployerApprovalFlow.js
```

This will show you:
- How many employers are unapproved
- Which employers have complete profiles
- Which employers are ready for approval
- Any jobs from unapproved employers (legacy data)

### 3. Migrate Existing Data (Optional)

If you have existing employers who posted jobs before this flow was implemented, auto-approve them:

```bash
cd backend
node scripts/migrateExistingEmployers.js
```

This will:
- Find all employers who have posted jobs
- Auto-approve them (they were already trusted)
- Keep the new flow for future employers

### 4. Restart the Backend Server

```bash
cd backend
npm start
```

## Testing the Flow

### Test 1: New Employer Registration
1. Register a new employer account
2. Try to post a job immediately
3. ✅ Should get error: "Please complete your company profile"

### Test 2: Incomplete Profile
1. Fill only some profile fields
2. Try to post a job
3. ✅ Should get error: "Missing fields: [list]"

### Test 3: Complete Profile (Not Approved)
1. Fill all required fields:
   - Company Name
   - Description
   - Location
   - Phone
   - Email
2. Try to post a job
3. ✅ Should get error: "Admin approval required"
4. ✅ Admin should receive notification

### Test 4: Admin Approval
1. Admin logs in
2. Goes to Employers section
3. Sees pending approval list
4. Reviews employer profile
5. Approves employer
6. ✅ Employer receives notification

### Test 5: Post Job After Approval
1. Approved employer tries to post job
2. ✅ Should succeed!

## API Testing with Postman/cURL

### Check Profile Completion Status
```bash
curl -X GET http://localhost:5000/api/employer/profile-completion \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "completion": 100,
  "isProfileComplete": true,
  "isApproved": false,
  "canPostJobs": false,
  "message": "Your profile is complete and under admin review",
  "missingFields": []
}
```

### Get Employers Pending Approval (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/employers/pending-approval \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Employer (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/employers/EMPLOYER_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isApproved": true, "status": "active"}'
```

### Try to Post Job (Employer)
```bash
curl -X POST http://localhost:5000/api/employer/jobs \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "Job description",
    "location": "Mumbai",
    "jobType": "full-time"
  }'
```

## Required Profile Fields

Employers must complete these fields:
1. ✅ Company Name
2. ✅ Company Description
3. ✅ Location
4. ✅ Phone
5. ✅ Email

Optional but recommended:
- Website
- Logo
- Industry
- Team Size
- Documents (PAN, GST, CIN)

## Admin Dashboard Integration

### Pending Approvals Section
Add a new section in admin dashboard:

```javascript
// Fetch pending approvals
fetch('/api/admin/employers/pending-approval', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(`${data.count} employers pending approval`);
  // Display list of employers ready for approval
});
```

### Employer List with Filters
```javascript
// Get all employers with approval status
fetch('/api/admin/employers?approvalStatus=pending', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
.then(res => res.json())
.then(data => {
  // Display employers with profile completion status
  data.data.forEach(employer => {
    console.log(`${employer.companyName}: ${employer.profileCompletionPercentage}% complete`);
  });
});
```

## Employer Dashboard Integration

### Show Approval Status
```javascript
// Fetch profile completion status
fetch('/api/employer/profile-completion', {
  headers: {
    'Authorization': `Bearer ${employerToken}`
  }
})
.then(res => res.json())
.then(data => {
  if (!data.canPostJobs) {
    // Disable "Post Job" button
    // Show message: data.message
    console.log(data.message);
  }
});
```

### Profile Completion Indicator
```javascript
// Show progress bar
const completion = data.completion; // 0-100
const missingFields = data.missingFields; // Array of missing fields

// Display:
// - Progress bar: ${completion}%
// - Missing fields: ${missingFields.join(', ')}
// - Status message: ${data.message}
```

## Troubleshooting

### Issue: Employer can't post jobs
**Check:**
1. Is profile complete? (All 5 required fields)
2. Is employer approved by admin?
3. Check response from `/api/employer/profile-completion`

### Issue: Admin can't approve employer
**Check:**
1. Is profile complete?
2. Check error message - it will list missing fields
3. Employer must complete profile first

### Issue: Old employers can't post jobs
**Solution:**
Run the migration script to auto-approve them:
```bash
node backend/scripts/migrateExistingEmployers.js
```

## Monitoring

### Check System Status
```bash
# Run test script
node backend/scripts/testEmployerApprovalFlow.js

# Output shows:
# - Total employers
# - Approved vs pending
# - Employers ready for approval
# - Any issues
```

### Database Queries

Check unapproved employers:
```javascript
db.employers.find({ isApproved: false }).count()
```

Check employers with complete profiles:
```javascript
// Use the test script or admin API
```

## Support

### Common Questions

**Q: Can I change the required fields?**
A: Yes, modify the `requiredFields` array in:
- `backend/controllers/employerController.js` (createJob function)
- `backend/controllers/adminController.js` (updateEmployerStatus function)

**Q: Can I auto-approve certain employers?**
A: Yes, you can create a custom script or add logic in the registration process.

**Q: How do I notify employers about missing fields?**
A: The API returns `missingFields` array. Display this in the frontend.

**Q: Can sub-admins approve employers?**
A: Yes, if they have the 'employers' permission.

## Next Steps

1. ✅ Backend implementation (Complete)
2. 🔄 Frontend integration (Pending)
   - Update employer dashboard
   - Update admin dashboard
   - Add approval workflow UI
3. 🔄 Testing (Pending)
   - Test all scenarios
   - Test notifications
   - Test edge cases
4. 🔄 Documentation (Pending)
   - User guide for employers
   - Admin guide for approvals

## Files Modified

- ✅ `backend/controllers/employerController.js`
- ✅ `backend/controllers/adminController.js`
- ✅ `backend/routes/admin.js`
- ✅ Documentation files created
- ✅ Test scripts created
- ✅ Migration script created

## Success Criteria

✅ New employers cannot post jobs without complete profile
✅ Admin approval required after profile completion
✅ Validation prevents approval of incomplete profiles
✅ Notifications sent at each step
✅ Existing employers can be migrated
✅ API returns clear status messages

---

**Status**: ✅ Ready for Frontend Integration
**Version**: 1.0
**Last Updated**: 2024

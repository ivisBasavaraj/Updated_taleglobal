# Employer Approval Flow Implementation

## Overview
This document describes the complete employer approval flow that ensures employers must complete their company profile and receive admin approval before they can post jobs.

## Flow Steps

### 1. Employer Registration
- Employer registers with basic information (name, email, company name)
- Account is created with `isApproved: false` by default
- Empty profile is created in EmployerProfile collection
- Welcome email is sent with password creation link

### 2. Complete Company Profile
Employer must fill in the following **required fields**:
- Company Name
- Company Description
- Location
- Phone
- Email

**Optional but recommended fields:**
- Website
- Logo
- Industry
- Team Size
- Established Since
- Documents (PAN, GST, CIN, etc.)

### 3. Profile Submission for Review
- When employer completes all required fields and saves the profile
- System automatically notifies admin: "Company Profile Ready for Review"
- Employer sees message: "Your profile is complete and under admin review"
- Employer **CANNOT post jobs** until admin approval

### 4. Admin Review & Approval
Admin can:
- View all employers with filter options:
  - All employers
  - Pending approval (not approved)
  - Approved employers
  
- Check employer profile completion status
- Review company details and documents
- Approve or reject the employer

**Admin Approval Validation:**
- System checks if profile is complete before allowing approval
- If profile is incomplete, admin gets error: "Cannot approve employer. Company profile is incomplete. Missing fields: [list]"
- Admin can only approve employers with complete profiles

### 5. Post-Approval
Once approved:
- Employer receives notification: "Your employer account has been approved. You can now post jobs."
- Employer can now post jobs
- Profile status shows: "Your profile is approved. You can now post jobs!"

## API Endpoints

### Employer Endpoints

#### Get Profile Completion Status
```
GET /api/employer/profile-completion
Authorization: Bearer <employer_token>

Response:
{
  "success": true,
  "completion": 100,
  "missingFields": [],
  "isProfileComplete": true,
  "isApproved": true,
  "canPostJobs": true,
  "message": "Your profile is approved. You can now post jobs!"
}
```

#### Create Job (Protected)
```
POST /api/employer/jobs
Authorization: Bearer <employer_token>

Validation Checks:
1. Profile exists
2. Required profile fields are complete
3. Admin approval (isApproved: true)

Error Responses:
- 403: "Please complete your company profile before posting jobs." (requiresProfile: true)
- 403: "Please complete your company profile. Missing fields: [list]" (requiresProfile: true)
- 403: "Your company profile is under review. Admin approval is required before you can post jobs." (requiresApproval: true)
```

### Admin Endpoints

#### Get All Employers with Profile Status
```
GET /api/admin/employers?approvalStatus=pending
Authorization: Bearer <admin_token>

Query Parameters:
- status: active | inactive
- approvalStatus: pending | approved
- page: number
- limit: number

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      "companyName": "...",
      "isApproved": false,
      "hasProfile": true,
      "isProfileComplete": true,
      "profileCompletionPercentage": 100
    }
  ]
}
```

#### Get Employers Pending Approval (Complete Profiles Only)
```
GET /api/admin/employers/pending-approval
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      "companyName": "...",
      "isApproved": false,
      "profile": { /* complete profile data */ },
      "isProfileComplete": true
    }
  ],
  "count": 5
}
```

#### Approve/Reject Employer
```
PUT /api/admin/employers/:id/status
Authorization: Bearer <admin_token>

Body:
{
  "isApproved": true,  // or false to reject
  "status": "active"   // or "inactive"
}

Validation:
- Checks if profile exists
- Checks if all required fields are complete
- Only approves if profile is complete

Error Response (if profile incomplete):
{
  "success": false,
  "message": "Cannot approve employer. Company profile is incomplete. Missing fields: description, location",
  "missingFields": ["description", "location"]
}

Success Response:
{
  "success": true,
  "employer": { /* updated employer data */ }
}
```

## Database Schema Updates

### Employer Model
```javascript
{
  name: String,
  email: String,
  companyName: String,
  isApproved: Boolean (default: false),  // Admin approval flag
  status: String (active/inactive/pending)
}
```

### EmployerProfile Model
```javascript
{
  employerId: ObjectId,
  companyName: String,      // Required
  description: String,      // Required
  location: String,         // Required
  phone: String,           // Required
  email: String,           // Required
  website: String,
  logo: String,
  // ... other fields
}
```

## Notifications

### For Employers
1. **Profile Complete**: "Your profile is complete and under admin review. You can post jobs once approved."
2. **Approved**: "Your employer account has been approved. You can now post jobs."
3. **Rejected**: "Your employer account has been rejected. Please contact support for more information."

### For Admins
1. **Profile Ready**: "Company XYZ has completed their profile and is ready for admin approval to post jobs."
2. **Profile Updated**: "Company XYZ has updated their profile"

## Frontend Integration Guide

### Employer Dashboard
1. Show profile completion status prominently
2. Display approval status
3. Show clear message about what's needed:
   - If profile incomplete: "Complete your profile to submit for approval"
   - If profile complete but not approved: "Your profile is under review"
   - If approved: "You can now post jobs!"

4. Disable "Post Job" button until both conditions are met:
   - Profile is complete
   - Admin has approved

### Admin Dashboard
1. Add "Pending Approval" filter/tab for employers
2. Show profile completion percentage for each employer
3. Display profile details before approval
4. Show validation errors if trying to approve incomplete profile
5. Add bulk approval option (only for complete profiles)

## Testing Checklist

- [ ] New employer cannot post jobs without profile
- [ ] Employer with incomplete profile cannot post jobs
- [ ] Employer with complete profile but not approved cannot post jobs
- [ ] Admin cannot approve employer with incomplete profile
- [ ] Admin can approve employer with complete profile
- [ ] Approved employer can post jobs
- [ ] Notifications are sent at each step
- [ ] Profile completion API returns correct status
- [ ] Pending approval endpoint shows only complete profiles

## Migration Notes

For existing employers in the database:
1. All existing employers have `isApproved: false` by default
2. Admin should review and approve existing employers
3. Employers with existing jobs should be auto-approved (optional migration script)

### Optional Migration Script
```javascript
// Auto-approve employers who have already posted jobs
const employersWithJobs = await Job.distinct('employerId');
await Employer.updateMany(
  { _id: { $in: employersWithJobs } },
  { $set: { isApproved: true } }
);
```

## Security Considerations

1. **Profile Validation**: Server-side validation ensures profile completeness
2. **Authorization**: Only authenticated employers can access their profile
3. **Admin Only**: Only admins can approve/reject employers
4. **Audit Trail**: All approval actions are logged with timestamps
5. **Notification System**: Both employer and admin are notified of status changes

## Benefits

1. **Quality Control**: Ensures only legitimate companies with complete information can post jobs
2. **Fraud Prevention**: Admin review prevents fake or spam job postings
3. **Better Candidate Experience**: Candidates see only verified companies
4. **Compliance**: Helps maintain platform standards and regulations
5. **Data Quality**: Ensures all employer profiles have necessary information

## Support

For issues or questions:
- Check profile completion status via API
- Review admin approval logs
- Contact system administrator for manual approval if needed

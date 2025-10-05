# Authorization Letter Management Test Guide

## Overview
This implementation adds company name display and approve/reject functionality for authorization letters in the admin employer details page.

## Features Added

### Backend Changes
1. **New Controller Methods** (`adminController.js`):
   - `approveAuthorizationLetter` - Approves an authorization letter and sends notification
   - `rejectAuthorizationLetter` - Rejects an authorization letter and sends notification

2. **Model Updates** (`EmployerProfile.js`):
   - Added `status`, `approvedAt`, `rejectedAt`, `approvedBy`, `rejectedBy`, `companyName` fields to authorization letters

3. **New Routes** (`admin.js`):
   - `POST /api/admin/employers/:employerId/authorization-letters/:letterId/approve`
   - `POST /api/admin/employers/:employerId/authorization-letters/:letterId/reject`

4. **Notification System**:
   - Employers receive notifications when authorization letters are approved/rejected
   - Notifications are accessible via `/api/employer/notifications`

### Frontend Changes
1. **Enhanced Authorization Letters Table**:
   - Added Company Name column
   - Added Status column with visual indicators
   - Added Approve/Reject buttons
   - Real-time status updates

2. **Notification Integration**:
   - Employers can see notifications in their dashboard
   - Notifications show approval/rejection status

## Testing Steps

### 1. Admin Side Testing
1. Navigate to `http://localhost:3000/admin/employer-details/{employerId}`
2. Scroll to "Authorization Letters" section
3. Verify table shows:
   - Company Name (from profile or individual letter)
   - File Name
   - Upload Date
   - Status (Pending/Approved/Rejected)
   - Action buttons (Approve/Reject)

4. Test Approve functionality:
   - Click "Approve" button on a pending authorization letter
   - Verify status changes to "Approved"
   - Verify success message appears
   - Verify Approve button is hidden for approved letters

5. Test Reject functionality:
   - Click "Reject" button on a pending authorization letter
   - Verify status changes to "Rejected"
   - Verify success message appears
   - Verify Reject button is hidden for rejected letters

### 2. Employer Side Testing
1. Navigate to `http://localhost:3000/employer/` (employer dashboard)
2. Check notifications section
3. Verify notifications appear when authorization letters are approved/rejected
4. Notification should show:
   - Title: "Authorization Letter Approved/Rejected"
   - Message: Details about which letter was approved/rejected
   - Timestamp

### 3. API Testing
Test the new endpoints directly:

```bash
# Approve authorization letter
curl -X POST http://localhost:5000/api/admin/employers/{employerId}/authorization-letters/{letterId}/approve \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json"

# Reject authorization letter
curl -X POST http://localhost:5000/api/admin/employers/{employerId}/authorization-letters/{letterId}/reject \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json"

# Get employer notifications
curl -X GET http://localhost:5000/api/notifications/employer \
  -H "Authorization: Bearer {employerToken}"
```

## Expected Behavior

### Admin Experience
1. **Employer Details Page** (`/admin/employer-details/{id}`):
   - Shows authorization letters with company names
   - Displays current status of each letter
   - Provides approve/reject buttons for pending letters
   - Updates status in real-time after actions

### Employer Experience
1. **Dashboard** (`/employer/`):
   - Receives notifications when letters are approved/rejected
   - Can see notification history
   - Notifications include relevant details about the action

## Database Changes
The authorization letters in EmployerProfile now include:
```javascript
{
  fileName: String,
  fileData: String,
  uploadedAt: Date,
  status: 'pending' | 'approved' | 'rejected',
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: ObjectId,
  rejectedBy: ObjectId,
  companyName: String
}
```

## URLs to Test
- Admin: `http://localhost:3000/admin/employer-details/{employerId}`
- Employer: `http://localhost:3000/employer/`

## Notes
- Existing authorization letters will have default status of 'pending'
- Company name falls back to profile company name if not set on individual letters
- Notifications are created automatically when letters are approved/rejected
- The system maintains audit trail with timestamps and admin IDs
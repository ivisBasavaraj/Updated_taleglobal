# Authorization Letter Notification Implementation

## Overview
This implementation adds notification functionality for employers when their authorization letters are approved or rejected by admin.

## Flow Description

### 1. Employer Signup Process
- Employer selects "Consultant" during signup
- System creates employer account with `employerType: 'consultant'`
- Employer uploads authorization letters for companies they represent

### 2. Admin Approval Process
- Admin accesses: `http://localhost:3000/admin/employer-details/`
- Admin reviews employer profiles and authorization letters
- Admin can approve/reject individual authorization letters

### 3. Notification Creation
When admin approves/rejects an authorization letter:
- System creates a notification targeted to the specific employer
- Notification includes:
  - Title with approval/rejection status
  - Message with file name and next steps
  - Type: `document_approved` or `document_rejected`
  - Role: `employer`
  - RelatedId: employer's ObjectId

### 4. Employer Notification Display
- Employer accesses: `http://localhost:3000/employer/`
- Notifications appear in:
  - Header notification bell (with unread count)
  - Dashboard notifications section
  - Real-time updates every 30 seconds

## Technical Implementation

### Backend Changes

#### 1. Admin Controller (`adminController.js`)
```javascript
// Enhanced notification creation with better messaging
const notificationData = {
  title: '✅ Authorization Letter Approved',
  message: `Great news! Your authorization letter "${fileName}" has been approved by admin. You can now proceed with posting jobs for this company.`,
  type: 'document_approved',
  role: 'employer',
  relatedId: new mongoose.Types.ObjectId(employerId),
  createdBy: new mongoose.Types.ObjectId(req.user.id)
};
```

#### 2. Notification Model (`Notification.js`)
```javascript
// Added new notification types
type: { 
  type: String, 
  enum: [..., 'document_approved', 'document_rejected', 'authorization_approved', 'authorization_rejected'], 
  required: true 
}
```

#### 3. Notification Controller (`notificationController.js`)
```javascript
// Enhanced employer-specific notification handling
else if (role === 'employer') {
  query = {
    $or: [
      { role, relatedId: { $exists: false } }, // General notifications
      { role, relatedId: userId } // Specific notifications for this employer
    ]
  };
}
```

### Frontend Integration

#### 1. Notification Bell Component
- Already integrated in employer header (`emp-header.jsx`)
- Shows unread count with animation
- Dropdown with recent notifications

#### 2. Dashboard Integration
- Employer dashboard (`emp-dashboard.jsx`) displays notifications
- Real-time updates every 30 seconds
- Visual indicators for read/unread status

## API Endpoints

### Get Employer Notifications
```
GET /api/notifications/employer
Authorization: Bearer <employerToken>
```

### Mark Notification as Read
```
PATCH /api/notifications/:id/read
Authorization: Bearer <employerToken>
```

### Mark All Notifications as Read
```
PATCH /api/notifications/employer/read-all
Authorization: Bearer <employerToken>
```

## Testing

### Test Script
Run the test script to verify the complete flow:
```bash
cd backend
node testEmployerAuthorizationFlow.js
```

### Test Credentials
- **URL**: http://localhost:3000/employer/
- **Email**: consultant@test.com
- **Password**: password123
- **Type**: Consultant
- **Company**: Test Consultancy

### Manual Testing Steps
1. Login as admin: `http://localhost:3000/admin/employer-details/`
2. Find the test consultant employer
3. Approve/reject authorization letter
4. Login as employer: `http://localhost:3000/employer/`
5. Check notification bell and dashboard for notifications

## Features

### ✅ Implemented
- Real-time notification creation on authorization approval/rejection
- Employer-specific notification targeting
- Notification bell with unread count
- Dashboard notification display
- API endpoints for notification management
- Automatic polling for new notifications

### 🔄 Notification Types Supported
- `document_approved` - Authorization letter approved
- `document_rejected` - Authorization letter rejected
- `profile_approved` - Employer account approved
- `profile_rejected` - Employer account rejected

### 📱 User Experience
- Visual notification bell with animation
- Unread count badge
- Dropdown notification list
- Dashboard notification section
- Auto-refresh every 30 seconds
- Mark as read functionality

## Database Schema

### Notification Document
```javascript
{
  _id: ObjectId,
  title: String,
  message: String,
  type: String, // 'document_approved', 'document_rejected', etc.
  role: String, // 'employer'
  isRead: Boolean,
  relatedId: ObjectId, // Employer ID for targeted notifications
  createdBy: ObjectId, // Admin ID
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations
- Notifications are filtered by employer ID
- JWT token validation required
- Only targeted employer can see their notifications
- Admin actions are logged with createdBy field

## Performance
- Efficient MongoDB queries with indexed fields
- Pagination support for large notification lists
- Real-time updates without overwhelming the server
- Optimized notification bell component
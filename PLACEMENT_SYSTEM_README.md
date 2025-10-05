# Placement System - Complete Guide

## Overview
The placement system allows placement officers from colleges to upload Excel/CSV files containing student data (email, password, name, etc.), which admins can then process to create candidate accounts. Students can then login using the credentials from the Excel files.

## System Flow

### 1. Placement Officer Registration & File Upload
- Placement officers register at `/placement/register`
- They upload Excel/CSV files with student data via the placement dashboard
- Files are stored in the database and marked as "pending" for admin approval

### 2. Admin Review & Processing
- Admins access the placement details page at `/admin/placement-details/:id`
- They can view uploaded files and their data
- Admins can approve individual files, which creates candidate accounts
- Credits can be assigned per file or in bulk

### 3. Candidate Login & Job Applications
- Candidates login using email/password from the Excel files
- They can apply for jobs using their assigned credits
- Each job application deducts 1 credit

## Required Excel/CSV Format

The Excel/CSV files must contain these columns (case-insensitive):

| Column Name | Required | Description |
|-------------|----------|-------------|
| Email | Yes | Student's email address |
| Password | Yes | Plain text password for login |
| Name / Candidate Name | Yes | Student's full name |
| Phone / Mobile | Optional | Contact number |
| Course / Branch | Optional | Academic course/branch |
| College Name | Optional | College name (uses placement officer's college if not provided) |
| Credits Assigned | Optional | Individual credits (uses file credits if not provided) |

### Sample Excel Format:
```
| Email | Password | Name | Phone | Course | Credits Assigned |
|-------|----------|------|-------|--------|------------------|
| john@college.edu | pass123 | John Doe | 9876543210 | Computer Science | 10 |
| jane@college.edu | pass456 | Jane Smith | 9876543211 | Electronics | 15 |
```

## API Endpoints

### Placement Officer Endpoints
- `POST /api/placement/register` - Register placement officer
- `POST /api/placement/login` - Login placement officer
- `POST /api/placement/upload-student-data` - Upload Excel/CSV file
- `GET /api/placement/students` - Get created candidates
- `GET /api/placement/files/:fileId/view` - View file data
- `GET /api/placement/dashboard` - Get dashboard stats

### Admin Endpoints
- `GET /api/admin/placements` - Get all placement officers
- `GET /api/admin/placements/:id` - Get placement details
- `POST /api/admin/placements/:id/files/:fileId/approve` - Approve file
- `POST /api/admin/placements/:id/files/:fileId/reject` - Reject file
- `PUT /api/admin/placements/:placementId/files/:fileId/credits` - Update file credits
- `PUT /api/admin/placements/:placementId/bulk-credits` - Bulk update credits

### Candidate Endpoints
- `POST /api/candidate/login` - Login with Excel credentials
- `GET /api/candidate/dashboard` - Get dashboard with credits
- `POST /api/candidate/apply/:jobId` - Apply for job (deducts credit)

## Frontend Pages

### Admin Pages
- `/admin/admin-placement-manage` - List all placement officers
- `/admin/placement-details/:id` - Detailed view with file management

### Placement Officer Pages
- `/placement/dashboard` - Upload files and view stats
- `/placement/students` - View created candidates

### Candidate Pages
- `/candidate/login` - Login page
- `/candidate/dashboard` - Dashboard showing credits and applications

## Database Models

### Placement Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  collegeName: String,
  fileHistory: [{
    fileName: String,
    uploadedAt: Date,
    status: 'pending' | 'approved' | 'rejected',
    fileData: String (base64),
    credits: Number,
    candidatesCreated: Number
  }]
}
```

### Candidate Model
```javascript
{
  name: String,
  email: String,
  password: String (plain text for placement candidates),
  credits: Number,
  registrationMethod: 'placement' | 'signup',
  placementId: ObjectId,
  fileId: ObjectId
}
```

## Key Features

### 1. File Processing
- Validates Excel/CSV format before upload
- Supports multiple file uploads per placement officer
- Individual file approval/rejection
- Auto-generates missing email/password if needed

### 2. Credit Management
- Credits can be assigned per file
- Bulk credit updates for all files
- Credits are inherited by candidates from their source file
- Job applications deduct 1 credit each

### 3. Authentication
- Placement candidates use plain text passwords (no hashing)
- Regular signup candidates use bcrypt hashing
- Automatic detection of registration method

### 4. Data Validation
- Email uniqueness across all candidates
- Required field validation with auto-generation
- File format validation before processing

## Testing the System

1. **Run the test script:**
   ```bash
   cd backend
   node testPlacementSystem.js
   ```

2. **Manual testing flow:**
   - Register a placement officer
   - Upload an Excel file with student data
   - Login as admin and approve the file
   - Try logging in as a candidate using Excel credentials
   - Apply for a job to test credit deduction

## Troubleshooting

### Common Issues:
1. **File upload fails:** Check file format (must be .xlsx, .xls, or .csv)
2. **Candidates can't login:** Verify email/password in Excel file
3. **Credits not working:** Check if file has been approved by admin
4. **Missing candidates:** Ensure file processing completed successfully

### Debug Steps:
1. Check browser console for errors
2. Verify database connections
3. Check server logs for processing errors
4. Validate Excel file format and data

## Security Considerations

- Placement candidate passwords are stored as plain text (by design)
- File data is base64 encoded in database
- Admin approval required for all file processing
- Email uniqueness prevents duplicate accounts
- Credit system prevents unlimited job applications

## Future Enhancements

- Email notifications for file approval/rejection
- Bulk candidate operations
- Advanced file validation
- Credit purchase system
- Interview scheduling integration
- Detailed analytics and reporting
# Excel Data Storage for Candidate Login

## Overview
This document explains how Excel data from placement officers is stored and made accessible for candidate login at `http://localhost:3000/admin/placement-details`.

## Excel Data Flow

### 1. Excel File Upload
- Placement officers upload Excel/CSV files containing student data
- Required columns: ID, Candidate Name, College Name, Email, Phone, Course, Password, Credits Assigned
- Files are stored as base64 encoded data in the placement's `fileHistory` array

### 2. Data Processing
When admin approves and processes a file:
- Each row in Excel creates a new candidate account
- All Excel data is stored in both `Candidate` and `CandidateProfile` models

### 3. Data Storage Structure

#### Candidate Model
```javascript
{
  name: "Student Name from Excel",
  email: "student@email.com",
  password: "password from Excel (plain text for placement candidates)",
  phone: "phone from Excel",
  course: "course/branch from Excel",
  credits: "credits assigned from Excel",
  registrationMethod: "placement",
  placementId: "reference to placement officer",
  fileId: "reference to specific Excel file",
  isVerified: true,
  status: "active"
}
```

#### CandidateProfile Model
```javascript
{
  candidateId: "reference to candidate",
  collegeName: "college name from Excel",
  education: [{
    degreeName: "course from Excel",
    collegeName: "college name from Excel",
    scoreType: "percentage",
    scoreValue: "0"
  }]
}
```

## Candidate Login Process

### 1. Login Authentication
- Candidates use email and password from Excel file
- For placement candidates, passwords are stored as plain text (not hashed)
- Login endpoint: `POST /api/candidates/login`

### 2. Available Data After Login
Candidates can access all their Excel data through these endpoints:

#### Basic Profile: `GET /api/candidates/profile`
- Returns candidate profile with college information

#### Complete Profile: `GET /api/candidates/profile/complete`
- Returns candidate data + placement info + original Excel data
- Includes: name, email, phone, course, credits, college name
- Shows placement officer details
- Displays original Excel row data

#### Dashboard Stats: `GET /api/candidates/dashboard/stats`
- Returns application statistics + candidate info
- Includes credits, course, placement details

## Admin Verification

### View All Placement Candidates
Endpoint: `GET /api/admin/placements/:id/candidates`

Returns all candidates created from a specific placement with:
- Complete candidate information
- College details
- Credits assigned
- Creation timestamps

### Test Script
Run the test script to verify data storage:
```bash
node testCandidateExcelData.js
```

## Key Features

### ✅ Complete Data Preservation
- All Excel columns are stored and accessible
- Original data structure is maintained
- No data loss during processing

### ✅ Seamless Login
- Candidates can login using Excel email/password
- Plain text password comparison for placement candidates
- Automatic account activation

### ✅ Data Accessibility
- All Excel data available through API endpoints
- College information stored in profile
- Credits system fully functional

### ✅ Admin Control
- View all candidates from specific placement
- Verify data integrity
- Monitor login capabilities

## Usage Example

1. **Placement Officer uploads Excel file** with student data
2. **Admin approves and processes** the file at `/admin/placement-details`
3. **Candidate accounts are created** with all Excel data
4. **Students can login** using their email and password from Excel
5. **All Excel data is accessible** through candidate dashboard and profile

## API Endpoints Summary

| Endpoint | Purpose | Data Returned |
|----------|---------|---------------|
| `POST /api/candidates/login` | Candidate login | Authentication token |
| `GET /api/candidates/profile/complete` | Full profile data | All Excel + profile data |
| `GET /api/candidates/dashboard/stats` | Dashboard info | Stats + candidate details |
| `GET /api/admin/placements/:id/candidates` | Admin verification | All placement candidates |

## Security Notes
- Placement candidate passwords are stored as plain text for Excel compatibility
- Regular signup candidates use bcrypt hashing
- All data is properly validated during processing
- Admin permissions required for placement management
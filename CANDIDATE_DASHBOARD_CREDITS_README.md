# Candidate Dashboard Credits Display

## Overview
This document explains how admin-assigned credits from the placement details page are displayed in the candidate dashboard at `http://localhost:3000/candidate/dashboard`.

## Credits Display Flow

### 1. Admin Assigns Credits
- Admin goes to `http://localhost:3000/admin/placement-details`
- Admin assigns credits to Excel files or individual candidates
- Credits are stored in the `Candidate` model's `credits` field

### 2. Dashboard API Call
When candidate logs in and visits dashboard:
- Frontend calls `GET /api/candidate/dashboard/stats`
- Backend returns candidate data including credits
- Credits are displayed in the overview cards section

### 3. Credits Card Display

#### For Placement Candidates (from Excel)
```javascript
{
  count: candidate.credits, // Credits assigned by admin
  label: "Credits (From Excel)",
  collegeName: "College Name from Excel" // Shown below credits
}
```

#### For Regular Signup Candidates
```javascript
{
  count: candidate.credits || 0,
  label: "Credits Available"
}
```

## Frontend Implementation

### Location
File: `frontend/src/app/pannels/candidate/sections/dashboard/section-can-overview.jsx`

### Key Features
- **Always Visible**: Credits card is always shown for all candidates
- **Dynamic Labels**: Different labels for placement vs signup candidates
- **College Info**: Shows college name for placement candidates
- **Real-time Updates**: Refreshes every 30 seconds
- **CountUp Animation**: Animated number display

### Code Structure
```jsx
const creditsCard = {
  bg: "#f0f4ff",
  icon: "flaticon-job", 
  color: "text-primary",
  count: candidate.credits || 0,
  label: candidate.registrationMethod === 'placement' 
    ? "Credits (From Excel)" 
    : "Credits Available"
};
```

## Backend API Response

### Endpoint: `GET /api/candidate/dashboard/stats`

### Response Format
```json
{
  "success": true,
  "stats": {
    "applied": 0,
    "inProgress": 0, 
    "shortlisted": 0
  },
  "candidate": {
    "name": "Student Name",
    "credits": 25,
    "registrationMethod": "placement",
    "course": "Computer Science",
    "placement": {
      "name": "Placement Officer Name",
      "collegeName": "College Name"
    }
  }
}
```

## Visual Display

### Credits Card Layout
```
┌─────────────────────────┐
│  💼    25               │
│     Credits (From Excel)│
│     From: ABC College   │
└─────────────────────────┘
```

### Dashboard Grid
- **4 Cards Total**: Credits, Applied, In Progress, Shortlisted
- **Responsive**: Adjusts to screen size
- **Interactive**: Applied/Progress/Shortlisted cards are clickable
- **Color Coded**: Each card has distinct background color

## Credit Usage
- Credits decrease when candidates apply for jobs
- Only placement candidates use credits for applications
- Signup candidates can apply without credit restrictions
- Credit count updates in real-time after job applications

## Testing

### Verify Credits Display
1. **Admin assigns credits** in placement details page
2. **Candidate logs in** and visits dashboard
3. **Credits card shows** assigned amount
4. **College name appears** for placement candidates

### Test Script
```bash
node testCandidateDashboardCredits.js
```

## Key Benefits

### ✅ **Immediate Visibility**
- Credits appear instantly after admin assignment
- No page refresh needed (auto-refresh every 30s)

### ✅ **Clear Source Indication**
- "Credits (From Excel)" label for placement candidates
- College name shown for context

### ✅ **Universal Display**
- All candidates see credits card
- Works for both placement and signup candidates

### ✅ **Real-time Updates**
- Credits update after job applications
- Dashboard refreshes automatically

## Admin Workflow Integration

1. **Upload Excel** → Admin processes placement file
2. **Assign Credits** → Admin sets credits per file/candidate  
3. **Candidate Login** → Student sees assigned credits
4. **Apply for Jobs** → Credits decrease automatically
5. **Dashboard Updates** → Real-time credit tracking

This ensures seamless integration between admin credit assignment and candidate dashboard display.
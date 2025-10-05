# Shortlist Card Navigation and Highlighting Feature

## Overview
This feature implements navigation from the shortlist card in the candidate dashboard to the status page with automatic highlighting of shortlisted applications.

## Implementation Details

### 1. Dashboard Shortlist Card (section-can-overview.jsx)
- Added click handler to the "Shortlisted" card
- Sets a sessionStorage flag when clicked
- Navigates to `/candidate/status`

### 2. Status Page Highlighting (application-status.jsx)
- Checks for sessionStorage flag on component mount
- Highlights shortlisted applications for 5 seconds
- Includes visual effects: background color, border, animation, and shadow
- Shows notification alert when highlighting is active
- Automatically clears the flag after 5 seconds

## User Flow
1. User clicks on the "Shortlisted" card in the dashboard
2. System sets `highlightShortlisted` flag in sessionStorage
3. User is navigated to `/candidate/status`
4. Status page detects the flag and highlights shortlisted applications
5. Notification appears informing user about the highlighting
6. After 5 seconds, highlighting fades and flag is cleared

## Visual Effects
- **Background Color**: Light green (#e8f5e9)
- **Border**: 2px solid green (#4caf50)
- **Animation**: Pulsing effect for 3 cycles
- **Shadow**: Subtle green glow
- **Notification**: Success alert with star icon

## Technical Implementation
- Uses React hooks (useState, useEffect)
- SessionStorage for cross-component communication
- CSS animations and transitions
- Conditional styling based on application status

## Files Modified
1. `src/app/pannels/candidate/sections/dashboard/section-can-overview.jsx`
2. `src/app/pannels/candidate/components/application-status.jsx`

## Testing
To test the feature:
1. Login as a candidate
2. Go to dashboard
3. Click on the "Shortlisted" card (green card with bell icon)
4. Verify navigation to status page
5. Check that shortlisted applications are highlighted
6. Confirm notification appears
7. Wait 5 seconds to see highlighting fade
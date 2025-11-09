# Notification Section Visibility Fix

## Issue
Notifications were displaying behind other elements on the candidate dashboard, making them not visible properly.

## Root Cause
The notification panel lacked proper CSS z-index and positioning properties, causing it to render behind other dashboard elements like the profile completion card.

## Fixes Applied

### 1. Backend Controller Fix (`backend/controllers/notificationController.js`)
- Fixed user ID extraction to use `req.user._id` instead of `req.user.id`
- Added better logging for debugging notification queries
- Updated both `getNotificationsByRole` and `markAllAsRead` functions

### 2. Frontend Component Fix (`frontend/src/app/pannels/candidate/sections/dashboard/section-notifications.jsx`)
- Added `position: relative`, `zIndex: 10`, and `background: white` to the main panel container
- Added `background: white`, `position: relative`, and `zIndex: 1` to the panel body
- Added console logging for debugging notification fetch issues

### 3. Dashboard Layout Fix (`frontend/src/app/pannels/candidate/components/can-dashboard.jsx`)
- Added `zIndex: 1` to the profile completion card column
- Added `zIndex: 2` to the notification section column to ensure it appears above other elements

### 4. CSS Styling Fix (`frontend/src/app/pannels/candidate/components/can-dashboard.css`)
- Added specific CSS rules for notification panel visibility:
  - `.panel.panel-default`: `position: relative`, `z-index: 10`, `background: white`
  - `.panel-body`: `background: white`, `position: relative`, `z-index: 1`
  - `.notification-list`: `position: relative`, `z-index: 1`
  - `.notification-item`: `position: relative`, `z-index: 1`, `background: white`

### 5. Test Script Created (`backend/scripts/testNotifications.js`)
- Created a test script to verify notifications exist in the database
- Script creates sample notifications for testing purposes

## Testing
1. Restart the backend server to apply controller changes
2. Clear browser cache and refresh the candidate dashboard
3. Check browser console for notification fetch logs
4. Verify notifications are now visible and not hidden behind other elements

## Expected Result
- Notifications should now be fully visible in the notification panel
- The panel should appear above all other dashboard elements
- Notifications should have proper white background and be clearly readable
- No overlapping or z-index conflicts with other dashboard components

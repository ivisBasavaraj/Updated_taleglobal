# Real-Time Credit Updates Implementation

## Overview
The system already has real-time credit updates implemented using WebSocket. When credits are assigned in the admin placement details page, they automatically update in the candidate dashboard in real-time.

## Current Implementation

### Backend Components

1. **WebSocket Setup** (`backend/utils/websocket.js`)
   - Initializes Socket.IO server
   - Handles candidate room joining
   - Provides `emitBulkCreditUpdate()` function

2. **Credit Update Functions**
   - `updateFileCredits()` in `placementController.js` - ✅ Already has real-time updates
   - `assignPlacementCredits()` in `adminController.js` - ✅ Already has real-time updates
   - `assignBulkFileCredits()` in `adminController.js` - ⚠️ Missing real-time updates

### Frontend Components

1. **WebSocket Context** (`frontend/src/contexts/WebSocketContext.js`)
   - Manages WebSocket connection
   - Provides room joining functions

2. **Candidate Dashboard** (`frontend/src/app/pannels/candidate/sections/dashboard/section-can-overview.jsx`)
   - ✅ Already listens for `credit-updated` events
   - ✅ Updates credits in real-time
   - ✅ Shows visual feedback with animations

## How It Works

1. **Admin assigns credits** in placement details page
2. **Backend updates database** and calls `emitBulkCreditUpdate(candidateIds, credits)`
3. **WebSocket emits** `credit-updated` event to specific candidate rooms
4. **Frontend receives** event and updates credits display
5. **Visual feedback** shows credit update animation

## Testing the Feature

1. Open admin panel: `http://localhost:3000/admin/placement-details/{id}`
2. Open candidate dashboard in another tab: `http://localhost:3000/candidate/dashboard`
3. Assign credits using any of these methods:
   - Individual file credits (Credits button)
   - Bulk credits (Bulk Credits button)
   - Process file data
4. Credits should update immediately in candidate dashboard

## Files Modified

### Enhanced Functions
- `updateFileCredits()` - Enhanced to handle legacy candidates
- `assignPlacementCredits()` - Enhanced with better feedback
- Need to enhance `assignBulkFileCredits()` - Add real-time updates

### Key Features
- ✅ Real-time WebSocket updates
- ✅ Visual feedback animations
- ✅ Browser notifications (if permitted)
- ✅ Automatic dashboard refresh
- ✅ Credit pulse animation
- ✅ Handles both placement and regular candidates

## Usage Instructions

### For Admins
1. Navigate to placement details page
2. Use any credit assignment method:
   - **Individual File Credits**: Click "Credits" button next to any file
   - **Bulk Credits**: Click "Bulk Credits" for all files
   - **Process Data**: Credits are assigned when processing files
3. Candidates will see updates immediately

### For Candidates
1. Keep dashboard open
2. Credits will update automatically when admin assigns them
3. Visual animation shows when credits change
4. Browser notification appears (if enabled)

## System Requirements
- WebSocket connection between frontend and backend
- Candidate must be logged in and have dashboard open
- Admin must assign credits through the placement details interface

## Troubleshooting
- Ensure WebSocket server is running (initialized in server.js)
- Check browser console for WebSocket connection errors
- Verify candidate is in correct WebSocket room
- Check that candidateId is correctly extracted from JWT token
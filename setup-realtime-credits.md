# Real-time Credit Updates Setup

## Installation Steps

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install socket.io
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install socket.io-client
   ```

3. **Restart Both Servers**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in new terminal)
   cd frontend
   npm start
   ```

## How It Works

1. **Admin updates credits** at `http://localhost:3000/admin/placement-details/`
2. **Backend emits WebSocket event** to affected candidates
3. **Candidate dashboard** at `http://localhost:3000/candidate/dashboard` **updates instantly**

## Features Added

- ✅ Real-time credit updates via WebSocket
- ✅ Visual animations when credits change
- ✅ Browser notifications for credit updates
- ✅ Automatic reconnection on connection loss
- ✅ File-specific and bulk credit updates

## Files Modified

### Backend
- `server.js` - WebSocket server initialization
- `utils/websocket.js` - WebSocket utility functions
- `controllers/placementController.js` - File credit updates
- `controllers/adminController.js` - Bulk credit updates
- `package.json` - Added socket.io dependency

### Frontend
- `App.js` - WebSocket provider wrapper
- `contexts/WebSocketContext.js` - WebSocket context
- `sections/dashboard/section-can-overview.jsx` - Real-time updates
- `components/placement-details.jsx` - Admin room joining
- `package.json` - Added socket.io-client dependency
- `notification-animations.css` - Credit update animations
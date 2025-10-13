# Login Issues Troubleshooting Guide

## Quick Fix (Immediate Solution)

### Option 1: Browser Console Fix
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Copy and paste this code:

```javascript
// Clear all authentication data
['candidateToken', 'candidateUser', 'employerToken', 'employerUser', 'adminToken', 'adminUser', 'placementToken', 'placementUser'].forEach(key => localStorage.removeItem(key));
sessionStorage.clear();
console.log('Authentication data cleared');
window.location.reload();
```

### Option 2: Manual Browser Storage Clear
1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click on Local Storage → your domain
4. Delete all items
5. Click on Session Storage → your domain  
6. Delete all items
7. Refresh the page

## Root Cause Analysis

The errors you're seeing indicate:

1. **WebSocket Connection Issues**: 
   - Frontend trying to connect to `wss://taleglobal.cloud/socket.io/`
   - Backend configured for `http://localhost:5000`

2. **API URL Mismatch**:
   - API calls going to `https://taleglobal.cloud/api/`
   - Backend running on `http://localhost:5000/api`

3. **Authentication Token Issues**:
   - 401 Unauthorized errors suggest expired/invalid tokens

## Permanent Solutions Applied

### 1. Environment Configuration
Created `.env` files for proper URL management:

**Production (.env):**
```
REACT_APP_API_URL=https://taleglobal.cloud/api
REACT_APP_SOCKET_URL=wss://taleglobal.cloud
```

**Development (.env.local):**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 2. Updated API Configuration
- Modified `api.js` to use environment variables
- Added better error handling for 401 responses
- Automatic token cleanup on authentication failure

### 3. Updated WebSocket Configuration
- Modified WebSocket context to use environment variables
- Updated backend CORS settings for production domains

### 4. Fixed Placement Dashboard
- Updated hardcoded localhost URLs to use environment variables
- Consistent API URL usage throughout the component

## Deployment Steps

### For Development:
1. Ensure backend is running on `http://localhost:5000`
2. Use `.env.local` configuration
3. Start frontend with `npm start`

### For Production:
1. Deploy backend to `https://taleglobal.cloud`
2. Use `.env` configuration  
3. Build frontend with `npm run build`
4. Deploy built files to production server

## Testing the Fix

### 1. Check Environment Variables
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Socket URL:', process.env.REACT_APP_SOCKET_URL);
```

### 2. Test API Connection
```javascript
fetch(process.env.REACT_APP_API_URL.replace('/api', '/health'))
  .then(res => res.ok ? console.log('✅ API Connected') : console.log('❌ API Failed'))
  .catch(err => console.log('❌ API Error:', err));
```

### 3. Test WebSocket Connection
```javascript
const socket = io(process.env.REACT_APP_SOCKET_URL);
socket.on('connect', () => console.log('✅ WebSocket Connected'));
socket.on('connect_error', (err) => console.log('❌ WebSocket Error:', err));
```

## Prevention

1. **Always use environment variables** for API URLs
2. **Clear browser storage** when switching between environments
3. **Check token expiration** before making API calls
4. **Implement proper error handling** for authentication failures
5. **Use consistent URL patterns** across all components

## Emergency Contacts

If issues persist:
1. Check backend server status
2. Verify environment configuration
3. Clear browser cache and storage
4. Restart both frontend and backend servers
5. Check network connectivity and firewall settings
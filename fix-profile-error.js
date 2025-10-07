// Quick fix script for profile endpoint 400 error

console.log('🔧 Profile Endpoint Fix Script\n');

console.log('Most common causes and solutions for 400 Bad Request on /api/candidate/profile:\n');

console.log('1. ❌ AUTHENTICATION ISSUE');
console.log('   Problem: Missing or invalid token in localStorage');
console.log('   Solution: Check browser localStorage for "candidateToken"');
console.log('   Fix: Login again or clear localStorage and re-login\n');

console.log('2. ❌ SERVER NOT RUNNING');
console.log('   Problem: Backend server is not running on port 5000');
console.log('   Solution: Start backend server');
console.log('   Command: cd backend && npm start\n');

console.log('3. ❌ CORS ISSUE');
console.log('   Problem: Frontend (port 3000) cannot access backend (port 5000)');
console.log('   Solution: Check CORS configuration in server.js');
console.log('   Current setting should be: origin: "http://localhost:3000"\n');

console.log('4. ❌ DATABASE CONNECTION');
console.log('   Problem: MongoDB is not connected');
console.log('   Solution: Check MongoDB connection in .env file');
console.log('   Check: MONGODB_URI=mongodb://127.0.0.1:27017/jobzz_portal\n');

console.log('5. ❌ MIDDLEWARE ERROR');
console.log('   Problem: Auth middleware is rejecting the request');
console.log('   Solution: Check JWT_SECRET in .env file\n');

console.log('🚀 IMMEDIATE FIXES TO TRY:');
console.log('1. Open browser DevTools > Application > Local Storage');
console.log('2. Check if "candidateToken" exists and is not expired');
console.log('3. If missing, go to login page and login again');
console.log('4. Clear all localStorage: localStorage.clear()');
console.log('5. Refresh page and login again');

console.log('\n📋 BROWSER CONSOLE COMMANDS TO RUN:');
console.log('// Check if token exists');
console.log('console.log("Token:", localStorage.getItem("candidateToken"));');
console.log('');
console.log('// Clear all storage and reload');
console.log('localStorage.clear();');
console.log('sessionStorage.clear();');
console.log('location.reload();');

console.log('\n✅ If none of the above work, the issue might be in the backend code.');
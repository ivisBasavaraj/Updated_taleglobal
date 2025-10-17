// Quick fix for authentication issues
// Run this in browser console: copy and paste this entire script

console.log('🔧 Starting authentication fix...');

// Step 1: Check current authentication state
const checkAuth = () => {
    console.log('📋 Current authentication state:');
    console.log('Placement Token:', localStorage.getItem('placementToken') ? 'EXISTS' : 'MISSING');
    console.log('Placement User:', localStorage.getItem('placementUser') ? 'EXISTS' : 'MISSING');
    console.log('Current URL:', window.location.href);
};

// Step 2: Test API connection
const testAPI = async () => {
    console.log('🌐 Testing API connection...');
    try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API is running:', data);
            return true;
        } else {
            console.log('❌ API returned error:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Cannot connect to API:', error.message);
        console.log('💡 Make sure backend server is running on port 5000');
        return false;
    }
};

// Step 3: Test placement authentication
const testPlacementAuth = async () => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
        console.log('❌ No placement token found');
        return false;
    }
    
    console.log('🔐 Testing placement authentication...');
    try {
        const response = await fetch('http://localhost:5000/api/placement/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Placement authentication successful:', data);
            return true;
        } else {
            console.log('❌ Placement authentication failed:', response.status);
            const errorData = await response.json();
            console.log('Error details:', errorData);
            return false;
        }
    } catch (error) {
        console.log('❌ Placement auth error:', error.message);
        return false;
    }
};

// Step 4: Fix function
const fixAuth = async () => {
    checkAuth();
    
    const apiWorking = await testAPI();
    if (!apiWorking) {
        console.log('🚨 SOLUTION: Start the backend server');
        console.log('   1. Open terminal in backend folder');
        console.log('   2. Run: npm start');
        console.log('   3. Wait for "Tale Job Portal API running on port 5000"');
        return;
    }
    
    const authWorking = await testPlacementAuth();
    if (!authWorking) {
        console.log('🚨 SOLUTION: Login again');
        console.log('   1. Go to login page: /login');
        console.log('   2. Use Placement tab');
        console.log('   3. Enter your credentials');
        
        // Clear invalid tokens
        localStorage.removeItem('placementToken');
        localStorage.removeItem('placementUser');
        console.log('🧹 Cleared invalid tokens');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    console.log('✅ Everything looks good! Try refreshing the page.');
};

// Run the fix
fixAuth();
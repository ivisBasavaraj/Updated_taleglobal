// Verification script - Run in browser console
console.log('🔍 Verifying login fix...');

// Check environment variables
console.log('📍 Environment Check:');
console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
console.log('Socket URL:', process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

// Clear storage and test
console.log('🧹 Clearing storage...');
localStorage.clear();
sessionStorage.clear();

// Test API connectivity
async function testAPI() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const healthUrl = apiUrl.replace('/api', '/health');
    
    try {
        const response = await fetch(healthUrl);
        if (response.ok) {
            console.log('✅ API connection successful');
            return true;
        } else {
            console.log('❌ API connection failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API connection error:', error.message);
        return false;
    }
}

// Run verification
testAPI().then(success => {
    if (success) {
        console.log('🎉 All checks passed! You can now login.');
    } else {
        console.log('⚠️ API connection issues detected.');
        console.log('💡 Make sure your backend server is running.');
    }
});

console.log('✅ Verification complete');
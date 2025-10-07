const fetch = require('node-fetch');

// Test script to debug the profile endpoint error
async function debugProfileEndpoint() {
    const API_BASE_URL = 'http://localhost:5000/api';
    
    console.log('🔍 Debugging Profile Endpoint Error...\n');
    
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
        const healthResponse = await fetch(`http://localhost:5000/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Server is running:', healthData);
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        console.log('💡 Solution: Start the backend server with "npm start" in the backend directory');
        return;
    }
    
    // Test 2: Test profile endpoint without token
    console.log('\n2. Testing profile endpoint without authentication...');
    try {
        const response = await fetch(`${API_BASE_URL}/candidate/profile`);
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (response.status === 401) {
            console.log('✅ Expected 401 - Authentication required');
        }
    } catch (error) {
        console.log('❌ Request failed:', error.message);
    }
    
    // Test 3: Test with sample login to get token
    console.log('\n3. Testing with sample authentication...');
    try {
        // First try to login with a test account
        const loginResponse = await fetch(`${API_BASE_URL}/candidate/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response status:', loginResponse.status);
        console.log('Login response:', loginData);
        
        if (loginData.success && loginData.token) {
            // Test profile endpoint with token
            const profileResponse = await fetch(`${API_BASE_URL}/candidate/profile`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const profileData = await profileResponse.json();
            console.log('Profile response status:', profileResponse.status);
            console.log('Profile response:', profileData);
            
            if (profileResponse.status === 200) {
                console.log('✅ Profile endpoint working correctly with valid token');
            }
        }
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message);
    }
    
    console.log('\n🔧 Common Solutions:');
    console.log('1. Make sure the backend server is running on port 5000');
    console.log('2. Check if you are logged in (candidateToken in localStorage)');
    console.log('3. Verify CORS settings in server.js');
    console.log('4. Check MongoDB connection');
    console.log('5. Clear browser cache and localStorage');
}

// Run the debug script
debugProfileEndpoint().catch(console.error);
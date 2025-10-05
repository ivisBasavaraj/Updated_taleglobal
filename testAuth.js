const fetch = require('node-fetch');

async function testAPI() {
    try {
        // Test public endpoint first
        console.log('Testing public endpoint...');
        const publicResponse = await fetch('http://localhost:5000/api/public/jobs');
        console.log('Public API Status:', publicResponse.status);
        
        if (publicResponse.status === 401) {
            console.log('Public API returning 401 - this is the issue');
            const errorText = await publicResponse.text();
            console.log('Error response:', errorText);
        }
        
        // Test with a token from localStorage simulation
        console.log('\nTesting with candidate token...');
        const candidateToken = 'test-token'; // This would normally come from localStorage
        
        const authResponse = await fetch('http://localhost:5000/api/candidate/dashboard', {
            headers: {
                'Authorization': `Bearer ${candidateToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Auth API Status:', authResponse.status);
        if (authResponse.status === 401) {
            const errorText = await authResponse.text();
            console.log('Auth Error response:', errorText);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAPI();
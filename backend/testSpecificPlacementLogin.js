const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPlacementLogin() {
  try {
    console.log('🧪 Testing Placement Officer Login...\n');
    
    // Test with the active placement officers
    const testCredentials = [
      { email: 'admin@tale.com', password: 'password123' },
      { email: 'admin@tale.com', password: 'admin123' },
      { email: 'admin@tale.com', password: 'tale123' },
      { email: 'manasiabyali00197@gmail.com', password: 'password123' },
      { email: 'manasiabyali00197@gmail.com', password: 'admin123' },
      { email: 'admin2@tale.com', password: 'password123' },
      { email: 'admin2@tale.com', password: 'admin123' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`Testing login: ${creds.email} with password: ${creds.password}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/placement/login`, creds);
        console.log('✅ LOGIN SUCCESS!');
        console.log('Response:', response.data);
        console.log('Token received:', !!response.data.token);
        console.log('');
        break; // Stop on first success
      } catch (error) {
        if (error.response) {
          console.log(`❌ Login failed: ${error.response.data.message}`);
          console.log(`Status: ${error.response.status}`);
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
        console.log('');
      }
    }
    
    // Also test the pending one to confirm it's blocked
    console.log('Testing pending placement officer (should be blocked):');
    try {
      const response = await axios.post(`${BASE_URL}/placement/login`, {
        email: 'test@college.edu',
        password: 'password123'
      });
      console.log('❌ This should have been blocked!', response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Correctly blocked pending placement officer');
        console.log('Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPlacementLogin();
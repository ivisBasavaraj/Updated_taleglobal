const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDirectAPI() {
  try {
    console.log('🧪 Testing Direct API Call...\n');
    
    const credentials = {
      email: 'admin@tale.com',
      password: 'password123'
    };
    
    console.log('Making POST request to:', `${BASE_URL}/placement/login`);
    console.log('With credentials:', { email: credentials.email, password: '***' });
    
    const response = await axios.post(`${BASE_URL}/placement/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ FAILED!');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
    
    console.log('\n🔍 Debugging info:');
    console.log('- Check if backend server is running on port 5000');
    console.log('- Check if placement routes are properly mounted');
    console.log('- Check for any middleware blocking the request');
  }
}

testDirectAPI();
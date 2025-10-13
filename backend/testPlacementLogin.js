const fetch = require('node-fetch');

async function testPlacementLogin() {
  try {
    const API_BASE_URL = 'http://localhost:5000/api';
    
    console.log('Testing placement login...');
    
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/placement/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'placement@test.com',
        password: 'password123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response data:', loginData);

    if (loginData.success && loginData.token) {
      console.log('\nTesting profile endpoint with login token...');
      
      const profileResponse = await fetch(`${API_BASE_URL}/placement/profile`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response status:', profileResponse.status);
      const profileData = await profileResponse.json();
      console.log('Profile response data:', profileData);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPlacementLogin();
const fetch = require('node-fetch');

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/placement/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'placement@test.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogin();
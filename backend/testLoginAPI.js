const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/candidate/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'shreya.sharma4@example.com',
        password: 'Shreya237@'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);

    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('Candidate:', data.candidate);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
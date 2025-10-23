const http = require('http');

// Test if server is logging requests
const testServerLogs = () => {
  console.log('Testing server logs...');
  console.log('Check the backend server console for log messages.');
  console.log('');

  const postData = JSON.stringify({
    email: 'placement@test.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/placement/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Server responded with status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('');
      console.log('Check the backend server console to see if these logs appeared:');
      console.log('- "=== PLACEMENT LOGIN ==="');
      console.log('- "Body: { email: \'placement@test.com\', password: \'password123\' }"');
      console.log('- "Found placement: true"');
      console.log('- "Password valid: true/false"');
    });
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

testServerLogs();
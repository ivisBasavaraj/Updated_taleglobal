const http = require('http');

console.log('Testing backend connection...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Backend is running successfully!');
      console.log('Response:', response);
    } catch (e) {
      console.log('Backend responded but with invalid JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Backend is not running or not accessible:');
  console.error(`Error: ${e.message}`);
  console.log('\nTo fix this:');
  console.log('1. Run: cd backend && npm start');
  console.log('2. Or run: start-backend.bat');
  console.log('3. Make sure MongoDB is running');
});

req.end();
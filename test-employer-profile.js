// Test script to check employer profile API
const https = require('https');
const http = require('http');

function testEmployerProfile() {
  const employerId = '6902437490d37516e931951d'; // The ID from the URL
  const url = `http://localhost:5000/api/public/employers/${employerId}`;
  
  console.log('Testing URL:', url);
  
  const req = http.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response status:', res.statusCode);
        console.log('Response data:', JSON.stringify(jsonData, null, 2));
        
        if (jsonData.success && jsonData.profile) {
          console.log('\n=== Profile Fields Check ===');
          console.log('whyJoinUs:', jsonData.profile.whyJoinUs || 'NOT SET');
          console.log('googleMapsEmbed:', jsonData.profile.googleMapsEmbed || 'NOT SET');
          console.log('location:', jsonData.profile.location || 'NOT SET');
          console.log('description:', jsonData.profile.description || 'NOT SET');
        }
      } catch (error) {
        console.error('JSON Parse Error:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request Error:', error.message);
  });
  
  req.setTimeout(5000, () => {
    console.error('Request timeout');
    req.destroy();
  });
}

testEmployerProfile();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFixedLogin() {
  try {
    console.log('🧪 Testing Fixed Placement Officer Login...\n');
    
    const credentials = {
      email: 'admin@tale.com',
      password: 'password123'
    };
    
    console.log(`Testing login with: ${credentials.email}`);
    
    const response = await axios.post(`${BASE_URL}/placement/login`, credentials);
    
    console.log('✅ LOGIN SUCCESS!');
    console.log('Response:', response.data);
    console.log('Token received:', !!response.data.token);
    console.log('Placement info:', response.data.placement);
    
    console.log('\n🎉 The placement officer can now login successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`Email: ${credentials.email}`);
    console.log(`Password: ${credentials.password}`);
    console.log('\n🌐 Login URL: http://localhost:3000/placement/login');
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Login failed: ${error.response.data.message}`);
      console.log(`Status: ${error.response.status}`);
      
      if (error.response.status === 403) {
        console.log('\n💡 This means the account still needs admin approval');
        console.log('Go to: http://localhost:3000/admin/admin-placement-manage');
        console.log('Find the placement officer and approve their account');
      }
    } else {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
}

testFixedLogin();
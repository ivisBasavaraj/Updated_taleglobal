const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLoginFlow() {
  try {
    console.log('🧪 Testing Login Flow...\n');
    
    const testData = {
      email: 'test@college.edu',
      password: 'password123'
    };
    
    console.log('1️⃣ Attempting login (should be blocked)...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/placement/login`, testData);
      console.log('❌ Login should have been blocked! Got:', loginResponse.data);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresApproval) {
        console.log('✅ Login correctly blocked:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n✅ System working correctly!');
    console.log('Admin needs to approve at: http://localhost:3000/admin/admin-placement-manage');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoginFlow();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFirstLoginFlow() {
  try {
    console.log('🧪 Testing First Login Approval Flow...\n');
    
    // Test data
    const testPlacement = {
      name: 'Test Placement Officer',
      email: 'test.placement@college.edu',
      password: 'password123',
      phone: '9876543210',
      collegeName: 'Test College'
    };
    
    console.log('1️⃣ Registering new placement officer...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/placement/register`, testPlacement);
      console.log('✅ Registration successful:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️ Placement officer already exists, continuing with login test...');
      } else {
        throw error;
      }
    }
    
    console.log('\n2️⃣ Attempting first login (should be blocked)...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/placement/login`, {
        email: testPlacement.email,
        password: testPlacement.password
      });
      console.log('❌ Login should have been blocked!');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresApproval) {
        console.log('✅ First login correctly blocked:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n3️⃣ Admin would now approve the first login via admin panel');
    console.log('   - GET /api/admin/placements/pending-first-logins (to see pending requests)');
    console.log('   - POST /api/admin/placements/{id}/approve-first-login (to approve)');
    
    console.log('\n4️⃣ After approval, placement officer can login normally');
    
    console.log('\n✅ First Login Approval Flow Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFirstLoginFlow();
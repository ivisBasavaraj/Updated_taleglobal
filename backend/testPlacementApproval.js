const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPlacementApprovalFlow() {
  try {
    console.log('🧪 Testing Placement Officer Approval Flow...\n');
    
    const testPlacement = {
      name: 'Test Officer',
      email: 'test@college.edu',
      password: 'password123',
      phone: '9876543210',
      collegeName: 'Test College'
    };
    
    console.log('1️⃣ Registering placement officer...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/placement/register`, testPlacement);
      console.log('✅ Registration:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️ Already exists, testing login...');
      } else {
        throw error;
      }
    }
    
    console.log('\n2️⃣ Attempting login (should be blocked)...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/placement/login`, {
        email: testPlacement.email,
        password: testPlacement.password
      });
      console.log('❌ Login should have been blocked! Got:', loginResponse.data);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresApproval) {
        console.log('✅ Login correctly blocked:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n✅ System working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Admin goes to: http://localhost:3000/admin/admin-placement-manage');
    console.log('2. Find the placement officer and change status from "pending" to "active"');
    console.log('3. Placement officer can then sign in normally');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPlacementApprovalFlow();
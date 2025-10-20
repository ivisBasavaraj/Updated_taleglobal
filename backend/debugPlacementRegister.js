const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugRegistration() {
  try {
    console.log('🔍 Debugging Placement Registration...\n');
    
    const testData = {
      name: 'Test Officer',
      email: 'test@college.edu',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '9876543210',
      collegeName: 'Test College'
    };
    
    console.log('Sending registration request with data:', testData);
    
    const response = await axios.post(`${BASE_URL}/placement/register`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

debugRegistration();
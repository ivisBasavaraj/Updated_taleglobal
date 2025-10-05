const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function testSpecificLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test with a specific candidate
    const email = 'shreya.sharma4@example.com';
    const password = 'Shreya237@';
    
    console.log('Testing login for:', email);
    console.log('Password:', password);

    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      console.log('❌ Candidate not found');
      return;
    }

    console.log('✅ Candidate found:', candidate.name);
    console.log('Registration method:', candidate.registrationMethod);
    console.log('Stored password:', candidate.password);
    console.log('Status:', candidate.status);
    console.log('Credits:', candidate.credits);

    // Test password comparison
    const passwordMatch = await candidate.comparePassword(password);
    console.log('Password match result:', passwordMatch);

    if (passwordMatch) {
      console.log('✅ LOGIN SHOULD WORK');
      console.log('Login URL: http://localhost:3000/ (Sign In → Candidate)');
    } else {
      console.log('❌ LOGIN WILL FAIL');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSpecificLogin();
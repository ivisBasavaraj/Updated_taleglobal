const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function testCandidateLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a placement candidate with plain text password
    const candidate = await Candidate.findOne({ 
      registrationMethod: 'placement',
      email: 'shreya.sharma4@example.com'
    });
    
    if (!candidate) {
      console.log('No placement candidates found');
      return;
    }

    console.log('Found candidate:', {
      name: candidate.name,
      email: candidate.email,
      registrationMethod: candidate.registrationMethod,
      passwordLength: candidate.password ? candidate.password.length : 0,
      status: candidate.status
    });

    // Test password comparison
    const testPassword = candidate.password; // Use the stored password
    console.log('Testing with stored password:', testPassword);
    
    const isMatch = await candidate.comparePassword(testPassword);
    console.log('Password match result:', isMatch);

    // Test with trimmed password
    const trimmedPassword = testPassword.trim();
    console.log('Testing with trimmed password:', trimmedPassword);
    const isMatchTrimmed = await candidate.comparePassword(trimmedPassword);
    console.log('Trimmed password match result:', isMatchTrimmed);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCandidateLogin();
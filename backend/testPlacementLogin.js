const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function testPlacementLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a placement candidate
    const placementCandidate = await Candidate.findOne({ 
      registrationMethod: 'placement' 
    }).select('name email password registrationMethod credits');

    if (!placementCandidate) {
      console.log('No placement candidates found');
      return;
    }

    console.log('Found placement candidate:');
    console.log('Name:', placementCandidate.name);
    console.log('Email:', placementCandidate.email);
    console.log('Password (stored):', placementCandidate.password);
    console.log('Registration Method:', placementCandidate.registrationMethod);
    console.log('Credits:', placementCandidate.credits);

    // Test password comparison
    const testPassword = placementCandidate.password;
    const passwordMatch = await placementCandidate.comparePassword(testPassword);
    console.log('\nPassword comparison test:');
    console.log('Test password:', testPassword);
    console.log('Password match result:', passwordMatch);

    // Test login simulation
    console.log('\n=== LOGIN SIMULATION ===');
    console.log('Login URL: http://localhost:3000/candidate/login');
    console.log('Email:', placementCandidate.email);
    console.log('Password:', placementCandidate.password);
    console.log('Expected result: SUCCESS (candidate can login to dashboard)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testPlacementLogin();
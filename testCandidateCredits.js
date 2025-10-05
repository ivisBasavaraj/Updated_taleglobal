const mongoose = require('mongoose');
const Candidate = require('./backend/models/Candidate');
require('dotenv').config();

async function testCandidateCredits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a placement candidate and update their credits for testing
    const placementCandidate = await Candidate.findOne({ 
      registrationMethod: 'placement' 
    });

    if (placementCandidate) {
      console.log('Found placement candidate:', placementCandidate.email);
      console.log('Current credits:', placementCandidate.credits);
      
      // Update credits to 50 for testing
      await Candidate.findByIdAndUpdate(placementCandidate._id, { credits: 50 });
      console.log('Updated credits to 50');
      
      // Verify update
      const updated = await Candidate.findById(placementCandidate._id);
      console.log('Verified credits:', updated.credits);
      
      console.log('\n✅ Test candidate ready with 50 credits');
      console.log('Email:', updated.email);
      console.log('Password:', updated.password);
      console.log('Credits:', updated.credits);
      console.log('\nNow login with this candidate and check dashboard');
    } else {
      console.log('No placement candidates found. Creating test candidate...');
      
      const testCandidate = await Candidate.create({
        name: 'Test Student',
        email: 'test@student.com',
        password: 'test123',
        phone: '1234567890',
        course: 'Computer Science',
        credits: 25,
        registrationMethod: 'placement',
        isVerified: true,
        status: 'active'
      });
      
      console.log('✅ Created test candidate:');
      console.log('Email:', testCandidate.email);
      console.log('Password: test123');
      console.log('Credits:', testCandidate.credits);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCandidateCredits();
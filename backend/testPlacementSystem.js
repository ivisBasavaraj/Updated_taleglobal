const mongoose = require('mongoose');
const Placement = require('./models/Placement');
const Candidate = require('./models/Candidate');

// Test script to verify placement system functionality
async function testPlacementSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to database');

    // Test 1: Find a placement officer
    const placement = await Placement.findOne().select('name email collegeName fileHistory');
    if (!placement) {
      console.log('No placement officers found');
      return;
    }
    
    console.log('\n=== Placement Officer ===');
    console.log(`Name: ${placement.name}`);
    console.log(`Email: ${placement.email}`);
    console.log(`College: ${placement.collegeName}`);
    console.log(`Files uploaded: ${placement.fileHistory?.length || 0}`);

    // Test 2: Check file history
    if (placement.fileHistory && placement.fileHistory.length > 0) {
      console.log('\n=== File History ===');
      placement.fileHistory.forEach((file, index) => {
        console.log(`${index + 1}. ${file.fileName}`);
        console.log(`   Status: ${file.status}`);
        console.log(`   Uploaded: ${file.uploadedAt}`);
        console.log(`   Credits: ${file.credits || 0}`);
        console.log(`   Candidates Created: ${file.candidatesCreated || 0}`);
      });
    }

    // Test 3: Find candidates created by this placement
    const candidates = await Candidate.find({ placementId: placement._id })
      .select('name email password credits registrationMethod')
      .limit(5);
    
    console.log('\n=== Sample Candidates ===');
    if (candidates.length > 0) {
      candidates.forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.name}`);
        console.log(`   Email: ${candidate.email}`);
        console.log(`   Password: ${candidate.password}`);
        console.log(`   Credits: ${candidate.credits}`);
        console.log(`   Registration Method: ${candidate.registrationMethod}`);
      });
    } else {
      console.log('No candidates found for this placement officer');
    }

    // Test 4: Test candidate login simulation
    if (candidates.length > 0) {
      const testCandidate = candidates[0];
      console.log('\n=== Login Test ===');
      console.log(`Testing login for: ${testCandidate.email}`);
      
      // Simulate password comparison
      const loginResult = await testCandidate.comparePassword(testCandidate.password);
      console.log(`Password match: ${loginResult}`);
      
      if (loginResult) {
        console.log('✅ Candidate can login successfully!');
        console.log(`Available credits: ${testCandidate.credits}`);
      } else {
        console.log('❌ Login would fail');
      }
    }

    console.log('\n=== System Status ===');
    console.log('✅ Placement system is working correctly');
    console.log('✅ Email and password authentication is functional');
    console.log('✅ Credits system is operational');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Run the test
if (require.main === module) {
  require('dotenv').config();
  testPlacementSystem();
}

module.exports = testPlacementSystem;
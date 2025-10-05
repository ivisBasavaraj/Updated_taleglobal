const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function checkPlacementCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all placement candidates
    const placementCandidates = await Candidate.find({ 
      registrationMethod: 'placement' 
    }).select('name email password registrationMethod credits createdAt');

    console.log(`Found ${placementCandidates.length} placement candidates:`);
    
    placementCandidates.forEach((candidate, index) => {
      console.log(`\n${index + 1}. ${candidate.name}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Password: ${candidate.password}`);
      console.log(`   Password length: ${candidate.password.length}`);
      console.log(`   Is hashed: ${candidate.password.startsWith('$2a$') ? 'YES (bcrypt)' : 'NO (plain text)'}`);
      console.log(`   Credits: ${candidate.credits}`);
      console.log(`   Created: ${candidate.createdAt}`);
    });

    // Check if any have plain text passwords
    const plainTextCandidates = placementCandidates.filter(c => !c.password.startsWith('$2a$'));
    console.log(`\nCandidates with plain text passwords: ${plainTextCandidates.length}`);
    
    if (plainTextCandidates.length > 0) {
      console.log('\nPlain text password candidates:');
      plainTextCandidates.forEach(candidate => {
        console.log(`- ${candidate.name} (${candidate.email}): "${candidate.password}"`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPlacementCandidates();
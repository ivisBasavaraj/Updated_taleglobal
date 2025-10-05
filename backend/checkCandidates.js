const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkCandidates() {
  try {
    console.log('=== CHECKING CREATED CANDIDATES ===');
    
    const candidates = await Candidate.find({ registrationMethod: 'placement' })
      .select('name email password phone course credits registrationMethod placementId fileId isVerified status');
    
    console.log(`Found ${candidates.length} placement candidates:`);
    
    candidates.forEach((candidate, index) => {
      console.log(`\n${index + 1}. Candidate:`);
      console.log(`   Name: ${candidate.name}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Password: ${candidate.password}`);
      console.log(`   Phone: ${candidate.phone}`);
      console.log(`   Course: ${candidate.course}`);
      console.log(`   Credits: ${candidate.credits}`);
      console.log(`   Registration Method: ${candidate.registrationMethod}`);
      console.log(`   Placement ID: ${candidate.placementId}`);
      console.log(`   File ID: ${candidate.fileId}`);
      console.log(`   Verified: ${candidate.isVerified}`);
      console.log(`   Status: ${candidate.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCandidates();
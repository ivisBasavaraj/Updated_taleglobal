const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testCreditsSync() {
  try {
    console.log('Testing credits synchronization...');
    
    // Find all placement candidates
    const placementCandidates = await Candidate.find({ 
      registrationMethod: 'placement' 
    }).populate('placementId', 'name collegeName');
    
    console.log(`Found ${placementCandidates.length} placement candidates`);
    
    // Group by placement
    const candidatesByPlacement = {};
    placementCandidates.forEach(candidate => {
      const placementId = candidate.placementId?._id?.toString();
      if (placementId) {
        if (!candidatesByPlacement[placementId]) {
          candidatesByPlacement[placementId] = {
            placement: candidate.placementId,
            candidates: []
          };
        }
        candidatesByPlacement[placementId].candidates.push(candidate);
      }
    });
    
    console.log('\nCredits by Placement:');
    console.log('====================');
    
    for (const [placementId, data] of Object.entries(candidatesByPlacement)) {
      console.log(`\nPlacement: ${data.placement.name} (${data.placement.collegeName})`);
      console.log(`Candidates: ${data.candidates.length}`);
      
      // Show credit distribution
      const creditCounts = {};
      data.candidates.forEach(candidate => {
        const credits = candidate.credits || 0;
        creditCounts[credits] = (creditCounts[credits] || 0) + 1;
      });
      
      console.log('Credit distribution:');
      Object.entries(creditCounts).forEach(([credits, count]) => {
        console.log(`  ${credits} credits: ${count} candidates`);
      });
      
      // Show first few candidates as examples
      console.log('Sample candidates:');
      data.candidates.slice(0, 3).forEach(candidate => {
        console.log(`  - ${candidate.name} (${candidate.email}): ${candidate.credits || 0} credits`);
      });
    }
    
    console.log('\n✅ Credits sync test completed');
    
  } catch (error) {
    console.error('❌ Error testing credits sync:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCreditsSync();
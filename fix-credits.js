// Fix credits for placement candidates
const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('./backend/models/Candidate');
const Placement = require('./backend/models/Placement');

async function fixCredits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all placement candidates with 0 credits
    const candidates = await Candidate.find({
      registrationMethod: 'placement',
      credits: { $lte: 0 }
    }).populate('placementId');

    console.log(`Found ${candidates.length} placement candidates with 0 credits`);

    for (const candidate of candidates) {
      if (candidate.placementId && candidate.placementId.fileHistory) {
        // Find the file this candidate came from
        const files = candidate.placementId.fileHistory;
        const latestFile = files[files.length - 1]; // Use latest file
        
        if (latestFile && latestFile.credits > 0) {
          await Candidate.findByIdAndUpdate(candidate._id, {
            credits: latestFile.credits
          });
          
          console.log(`✅ Updated ${candidate.email}: ${candidate.credits} → ${latestFile.credits}`);
        }
      }
    }

    console.log('✅ Credit fix completed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCredits();
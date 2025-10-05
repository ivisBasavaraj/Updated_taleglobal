// Debug script to check credit assignment
const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('./backend/models/Candidate');
const Placement = require('./backend/models/Placement');

async function debugCredits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check specific candidate by email
    const email = 'ENTER_CANDIDATE_EMAIL_HERE'; // Replace with actual email
    
    const candidate = await Candidate.findOne({ email })
      .populate('placementId', 'name collegeName');
    
    if (!candidate) {
      console.log('❌ Candidate not found');
      return;
    }

    console.log('📊 Candidate Details:');
    console.log('- Name:', candidate.name);
    console.log('- Email:', candidate.email);
    console.log('- Credits:', candidate.credits);
    console.log('- Registration Method:', candidate.registrationMethod);
    console.log('- Placement ID:', candidate.placementId?._id);
    console.log('- College:', candidate.placementId?.collegeName);

    if (candidate.placementId) {
      const placement = await Placement.findById(candidate.placementId);
      console.log('\n🏫 Placement Details:');
      console.log('- Files uploaded:', placement.fileHistory?.length || 0);
      
      placement.fileHistory?.forEach((file, index) => {
        console.log(`\nFile ${index + 1}:`);
        console.log('- Name:', file.fileName);
        console.log('- Credits:', file.credits);
        console.log('- Status:', file.status);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugCredits();
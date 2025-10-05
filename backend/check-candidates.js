const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('./models/Candidate');
const Placement = require('./models/Placement');

async function checkCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('📊 Checking placement candidates...\n');
    
    const placementCandidates = await Candidate.find({
      registrationMethod: 'placement'
    }).populate('placementId', 'name collegeName');
    
    console.log(`Found ${placementCandidates.length} placement candidates:\n`);
    
    placementCandidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
      console.log(`   Credits: ${candidate.credits}`);
      console.log(`   Placement: ${candidate.placementId?.name || 'None'}`);
      console.log(`   College: ${candidate.placementId?.collegeName || 'None'}`);
      console.log('');
    });
    
    // Check placements with files
    const placements = await Placement.find({
      fileHistory: { $exists: true, $ne: [] }
    });
    
    console.log(`\n📋 Placements with files:\n`);
    
    placements.forEach((placement, index) => {
      console.log(`${index + 1}. ${placement.name} (${placement.collegeName})`);
      console.log(`   ID: ${placement._id}`);
      console.log(`   Files: ${placement.fileHistory.length}`);
      placement.fileHistory.forEach((file, fileIndex) => {
        console.log(`     File ${fileIndex + 1}: ${file.fileName} - Credits: ${file.credits}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCandidates();
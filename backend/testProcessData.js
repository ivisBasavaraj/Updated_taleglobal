const mongoose = require('mongoose');
const Placement = require('./models/Placement');
const Candidate = require('./models/Candidate');

async function testProcessData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to database');

    // Find a placement with files
    const placement = await Placement.findOne({ 'fileHistory.0': { $exists: true } });
    if (!placement) {
      console.log('No placement with files found');
      return;
    }

    console.log(`Found placement: ${placement.name}`);
    console.log(`Files: ${placement.fileHistory.length}`);

    // Check if any file has data
    const fileWithData = placement.fileHistory.find(f => f.fileData);
    if (!fileWithData) {
      console.log('No file with data found');
      return;
    }

    console.log(`File with data: ${fileWithData.fileName}`);
    console.log(`File status: ${fileWithData.status}`);

    // Test the process endpoint
    const placementId = placement._id;
    const fileId = fileWithData._id;

    console.log(`\nTesting process endpoint:`);
    console.log(`POST /api/admin/placements/${placementId}/files/${fileId}/process`);

    // Check existing candidates
    const existingCandidates = await Candidate.countDocuments({ placementId });
    console.log(`Existing candidates: ${existingCandidates}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  require('dotenv').config();
  testProcessData();
}

module.exports = testProcessData;
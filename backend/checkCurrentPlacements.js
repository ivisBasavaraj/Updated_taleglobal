const mongoose = require('mongoose');
const Placement = require('./models/Placement');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkCurrentPlacements() {
  try {
    const placements = await Placement.find({}).select('_id name email collegeName fileHistory');
    console.log(`Found ${placements.length} placements in database:`);
    
    placements.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p._id}, Name: ${p.name}, Files: ${p.fileHistory?.length || 0}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCurrentPlacements();
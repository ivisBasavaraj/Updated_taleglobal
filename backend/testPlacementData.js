const mongoose = require('mongoose');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkPlacementData() {
  try {
    console.log('=== CHECKING PLACEMENT DATA ===');
    
    // Get all placements
    const placements = await Placement.find({}).select('_id name email collegeName fileHistory');
    
    console.log(`Found ${placements.length} placements:`);
    
    placements.forEach((placement, index) => {
      console.log(`\n${index + 1}. Placement Officer:`);
      console.log(`   ID: ${placement._id}`);
      console.log(`   Name: ${placement.name}`);
      console.log(`   Email: ${placement.email}`);
      console.log(`   College: ${placement.collegeName}`);
      console.log(`   Files: ${placement.fileHistory?.length || 0}`);
      
      if (placement.fileHistory && placement.fileHistory.length > 0) {
        placement.fileHistory.forEach((file, fileIndex) => {
          console.log(`     File ${fileIndex + 1}:`);
          console.log(`       ID: ${file._id}`);
          console.log(`       Name: ${file.fileName}`);
          console.log(`       Status: ${file.status}`);
          console.log(`       Has Data: ${!!file.fileData}`);
        });
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPlacementData();
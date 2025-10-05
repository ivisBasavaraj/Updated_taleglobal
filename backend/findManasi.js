const mongoose = require('mongoose');
const Placement = require('./models/Placement');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function findManasi() {
  try {
    const placement = await Placement.findOne({ email: 'manasiabyali2300@gmail.com' });
    
    if (placement) {
      console.log('Found Manasi Byali:');
      console.log('ID:', placement._id);
      console.log('Name:', placement.name);
      console.log('Email:', placement.email);
      console.log('College:', placement.collegeName);
      console.log('Files:', placement.fileHistory?.length || 0);
      
      if (placement.fileHistory?.length > 0) {
        placement.fileHistory.forEach((file, i) => {
          console.log(`File ${i + 1}:`);
          console.log('  ID:', file._id);
          console.log('  Name:', file.fileName);
          console.log('  Status:', file.status);
          console.log('  Has Data:', !!file.fileData);
        });
      }
    } else {
      console.log('Manasi Byali not found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findManasi();
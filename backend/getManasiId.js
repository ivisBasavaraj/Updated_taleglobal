const mongoose = require('mongoose');
const Placement = require('./models/Placement');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function getManasiId() {
  try {
    const placement = await Placement.findOne({ email: 'manasiabyali2300@gmail.com' });
    
    if (placement) {
      console.log('Placement ID:', placement._id.toString());
      console.log('File ID:', placement.fileHistory[0]._id.toString());
    } else {
      console.log('Not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getManasiId();
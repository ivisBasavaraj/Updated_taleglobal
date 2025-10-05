const mongoose = require('mongoose');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestPlacement() {
  try {
    console.log('=== CREATING TEST PLACEMENT OFFICER ===');
    
    // Create a test placement officer
    const placement = await Placement.create({
      name: 'Test Placement Officer',
      email: 'placement@test.edu',
      password: 'password123',
      phone: '1234567890',
      collegeName: 'Test College',
      status: 'active',
      fileHistory: [
        {
          fileName: 'test_students.xlsx',
          uploadedAt: new Date(),
          status: 'pending',
          fileData: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAA==', // Sample base64
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          credits: 5
        }
      ]
    });
    
    console.log('Test placement officer created:');
    console.log(`ID: ${placement._id}`);
    console.log(`Name: ${placement.name}`);
    console.log(`Email: ${placement.email}`);
    console.log(`Files: ${placement.fileHistory.length}`);
    
    if (placement.fileHistory.length > 0) {
      console.log(`First file ID: ${placement.fileHistory[0]._id}`);
      console.log(`First file name: ${placement.fileHistory[0].fileName}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test placement:', error);
    process.exit(1);
  }
}

createTestPlacement();
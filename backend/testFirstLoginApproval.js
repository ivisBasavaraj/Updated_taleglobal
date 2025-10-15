const mongoose = require('mongoose');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testFirstLoginApproval() {
  try {
    console.log('Testing First Login Approval System...\n');
    
    // 1. Check existing placement officers
    const existingPlacements = await Placement.find({}).select('name email firstLoginApproved firstLoginAttemptedAt status');
    console.log('Existing placement officers:');
    existingPlacements.forEach(p => {
      console.log(`- ${p.name} (${p.email}): firstLoginApproved=${p.firstLoginApproved}, status=${p.status}`);
    });
    
    // 2. Update existing placement officers to require first login approval
    const updateResult = await Placement.updateMany(
      { firstLoginApproved: { $exists: false } },
      { $set: { firstLoginApproved: false } }
    );
    console.log(`\nUpdated ${updateResult.modifiedCount} placement officers to require first login approval`);
    
    // 3. Show updated status
    const updatedPlacements = await Placement.find({}).select('name email firstLoginApproved firstLoginAttemptedAt status');
    console.log('\nUpdated placement officers:');
    updatedPlacements.forEach(p => {
      console.log(`- ${p.name} (${p.email}): firstLoginApproved=${p.firstLoginApproved}, status=${p.status}`);
    });
    
    console.log('\n✅ First Login Approval system is ready!');
    console.log('\nHow it works:');
    console.log('1. New placement officers register normally');
    console.log('2. On first login attempt, they get blocked and admin gets notified');
    console.log('3. Admin can approve/reject first login via admin panel');
    console.log('4. After approval, placement officers can login normally');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFirstLoginApproval();
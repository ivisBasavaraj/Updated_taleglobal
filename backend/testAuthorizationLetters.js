const mongoose = require('mongoose');
const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');
const { createNotification } = require('./controllers/notificationController');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAuthorizationLetters() {
  try {
    console.log('Testing Authorization Letter Management...');

    // Find an employer with authorization letters
    const profile = await EmployerProfile.findOne({ 
      authorizationLetters: { $exists: true, $ne: [] } 
    }).populate('employerId');

    if (!profile) {
      console.log('No employer profiles with authorization letters found');
      return;
    }

    console.log(`Found profile for: ${profile.employerId.companyName}`);
    console.log(`Authorization letters: ${profile.authorizationLetters.length}`);

    // Test updating authorization letter status
    if (profile.authorizationLetters.length > 0) {
      const letter = profile.authorizationLetters[0];
      console.log(`Testing with letter: ${letter.fileName}`);

      // Update status to approved
      letter.status = 'approved';
      letter.approvedAt = new Date();
      letter.companyName = profile.companyName || profile.employerId.companyName;

      await profile.save();
      console.log('✅ Authorization letter status updated to approved');

      // Create test notification
      const notification = await createNotification({
        title: 'Authorization Letter Approved',
        message: `Your authorization letter "${letter.fileName}" has been approved by admin.`,
        type: 'document_approved',
        role: 'employer',
        relatedId: profile.employerId._id,
        createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // dummy admin ID
      });

      console.log('✅ Test notification created:', notification.title);
    }

    console.log('\n🎉 Authorization Letter Management test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend server: npm start');
    console.log('3. Navigate to admin employer details page');
    console.log('4. Test approve/reject functionality');
    console.log('5. Check employer dashboard for notifications');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAuthorizationLetters();
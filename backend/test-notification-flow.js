const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Support = require('./models/Support');
const Employer = require('./models/Employer');
const Candidate = require('./models/Candidate');
const { createNotification } = require('./controllers/notificationController');

async function testNotificationFlow() {
  try {
    console.log('Testing complete notification flow...');
    
    // Find a real employer
    const employer = await Employer.findOne().select('_id email companyName');
    if (!employer) {
      console.log('❌ No employers found');
      return;
    }
    
    console.log('✅ Found employer:', {
      id: employer._id,
      email: employer.email,
      company: employer.companyName
    });
    
    // Create a test support ticket for this employer
    const testTicket = await Support.create({
      name: employer.companyName || 'Test Company',
      email: employer.email,
      userType: 'employer',
      userId: employer._id,
      userModel: 'Employer',
      subject: 'Test Notification Ticket',
      category: 'technical',
      priority: 'medium',
      message: 'This is a test ticket to verify notifications work.',
      status: 'new'
    });
    
    console.log('✅ Created test ticket:', testTicket._id);
    
    // Test notification creation
    const notification = await createNotification({
      title: 'Support Ticket Response',
      message: `Your support ticket "${testTicket.subject}" has been responded to by admin. Response: This is a test admin response.`,
      type: 'support_response',
      role: 'employer',
      relatedId: employer._id,
      createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Dummy admin ID
    });
    
    console.log('✅ Notification created successfully:', notification._id);
    
    // Clean up test data
    await Support.findByIdAndDelete(testTicket._id);
    console.log('✅ Test ticket cleaned up');
    
    console.log('✅ Notification system is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testNotificationFlow();
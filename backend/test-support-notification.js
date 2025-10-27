const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Support = require('./models/Support');
const Notification = require('./models/Notification');
const Employer = require('./models/Employer');
const Candidate = require('./models/Candidate');

async function testSupportNotification() {
  try {
    console.log('Testing Support Ticket Notification System...');
    
    // Get a sample support ticket
    const ticket = await Support.findOne().sort({ createdAt: -1 });
    if (!ticket) {
      console.log('❌ No support tickets found');
      return;
    }
    
    console.log('✅ Found ticket:', {
      id: ticket._id,
      email: ticket.email,
      userType: ticket.userType,
      subject: ticket.subject
    });
    
    // Check if user exists by email
    let user = null;
    if (ticket.userType === 'employer') {
      user = await Employer.findOne({ email: ticket.email });
    } else if (ticket.userType === 'candidate') {
      user = await Candidate.findOne({ email: ticket.email });
    }
    
    if (user) {
      console.log('✅ Found user:', {
        id: user._id,
        email: user.email,
        name: user.name || user.companyName
      });
      
      // Check existing notifications for this user
      const notifications = await Notification.find({ 
        relatedId: user._id,
        type: 'support_response'
      }).sort({ createdAt: -1 }).limit(3);
      
      console.log(`✅ Found ${notifications.length} support notifications for user`);
      notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.createdAt}`);
      });
      
    } else {
      console.log('❌ No user found with email:', ticket.email);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSupportNotification();
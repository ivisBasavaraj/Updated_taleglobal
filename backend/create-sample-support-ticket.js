const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Support = require('./models/Support');

async function createSampleTicket() {
  try {
    console.log('Creating sample support ticket...');
    
    const sampleTicket = await Support.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      userType: 'candidate',
      subject: 'Login Issue',
      category: 'technical',
      priority: 'medium',
      message: 'I am unable to login to my account. Please help me resolve this issue.',
      status: 'new',
      isRead: false
    });
    
    console.log('✅ Sample support ticket created:', {
      id: sampleTicket._id,
      subject: sampleTicket.subject,
      status: sampleTicket.status,
      userType: sampleTicket.userType
    });
    
    // Create another ticket
    const sampleTicket2 = await Support.create({
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1987654321',
      userType: 'employer',
      subject: 'Job Posting Problem',
      category: 'job-posting',
      priority: 'high',
      message: 'I cannot post new jobs on the platform. The form is not submitting.',
      status: 'new',
      isRead: false
    });
    
    console.log('✅ Second sample support ticket created:', {
      id: sampleTicket2._id,
      subject: sampleTicket2.subject,
      status: sampleTicket2.status,
      userType: sampleTicket2.userType
    });
    
  } catch (error) {
    console.error('❌ Error creating sample ticket:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleTicket();
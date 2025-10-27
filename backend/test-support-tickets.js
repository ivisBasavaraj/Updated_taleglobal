const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Support = require('./models/Support');

async function testSupportTickets() {
  try {
    console.log('Testing Support Tickets...');
    
    // Test 1: Get all support tickets
    const tickets = await Support.find().limit(5);
    console.log(`Found ${tickets.length} support tickets`);
    
    if (tickets.length > 0) {
      console.log('Sample ticket:', {
        id: tickets[0]._id,
        subject: tickets[0].subject,
        status: tickets[0].status,
        userType: tickets[0].userType
      });
      
      // Test 2: Update a ticket status
      const updateResult = await Support.findByIdAndUpdate(
        tickets[0]._id,
        { status: 'in-progress', isRead: true },
        { new: true }
      );
      
      if (updateResult) {
        console.log('✅ Update test passed');
        
        // Revert the change
        await Support.findByIdAndUpdate(
          tickets[0]._id,
          { status: tickets[0].status, isRead: tickets[0].isRead }
        );
      } else {
        console.log('❌ Update test failed');
      }
    }
    
    console.log('✅ All tests completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSupportTickets();
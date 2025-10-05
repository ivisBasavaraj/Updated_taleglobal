const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');

async function testAdminNotificationFixed() {
  try {
    console.log('Testing fixed admin notification system...\n');

    // Create a test notification
    const { createNotification } = require('./controllers/notificationController');
    
    const notification = await createNotification({
      title: 'File Upload Test',
      message: 'Test placement officer uploaded test.xlsx',
      type: 'file_uploaded',
      role: 'admin',
      relatedId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    console.log('✓ Test notification created:', notification._id);

    // Test the controller function directly
    const notificationController = require('./controllers/notificationController');
    
    // Mock request and response objects
    const mockReq = {
      params: { role: 'admin' },
      query: {},
      user: { id: new mongoose.Types.ObjectId().toString() }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('\n✓ Controller response:');
        console.log('  Success:', data.success);
        console.log('  Notifications count:', data.notifications?.length || 0);
        console.log('  Unread count:', data.unreadCount || 0);
        
        if (data.notifications && data.notifications.length > 0) {
          console.log('\n📋 Recent notifications:');
          data.notifications.slice(0, 3).forEach((notif, i) => {
            console.log(`   ${i+1}. ${notif.title} - ${notif.type}`);
          });
        }
      },
      status: (code) => ({ json: (data) => console.log('Error:', code, data) })
    };

    await notificationController.getNotificationsByRole(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminNotificationFixed();
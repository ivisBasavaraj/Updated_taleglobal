const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');

async function testAdminNotification() {
  try {
    console.log('Testing admin notification creation...\n');

    const { createNotification } = require('./controllers/notificationController');
    
    // Create test notification for admin
    const notification = await createNotification({
      title: 'Test Admin Notification',
      message: 'This is a test notification for admin to verify the system is working',
      type: 'file_uploaded',
      role: 'admin',
      createdBy: new mongoose.Types.ObjectId()
    });

    console.log('✓ Admin notification created:', notification._id);

    // Check admin notifications
    const Notification = require('./models/Notification');
    const adminNotifs = await Notification.find({ role: 'admin' })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`\n✓ Total admin notifications: ${adminNotifs.length}`);
    adminNotifs.forEach((notif, i) => {
      console.log(`   ${i+1}. ${notif.title} - ${notif.type} (${notif.createdAt.toISOString()})`);
    });

    // Test the API endpoint directly
    console.log('\n🔍 Testing API endpoint...');
    const fetch = require('node-fetch');
    
    // You'll need to replace this with a real admin token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MWY5ZGJkNzU4YzNhNzI4YzI4YzI4YyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMDA0NzQyMSwiZXhwIjoxNzMwMTMzODIxfQ.example';
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications/admin', {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✓ API Response:', data.success ? 'Success' : 'Failed');
        console.log('✓ Notifications count:', data.notifications?.length || 0);
        console.log('✓ Unread count:', data.unreadCount || 0);
      } else {
        console.log('❌ API Response status:', response.status);
      }
    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminNotification();
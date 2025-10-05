const mongoose = require('mongoose');
require('dotenv').config();

const { createNotification } = require('./controllers/notificationController');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');

async function testPlacementNotification() {
  try {
    console.log('Testing placement notification creation...\n');

    // Test notification creation
    const notification = await createNotification({
      title: 'New Student Data Uploaded',
      message: 'Test placement officer has uploaded a new Excel/CSV file: test.xlsx',
      type: 'file_uploaded',
      role: 'admin',
      relatedId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    console.log('✓ Notification created successfully:', notification._id);
    console.log('✓ Title:', notification.title);
    console.log('✓ Message:', notification.message);
    console.log('✓ Type:', notification.type);
    console.log('✓ Role:', notification.role);

    // Check if notification exists in database
    const Notification = require('./models/Notification');
    const count = await Notification.countDocuments({ role: 'admin' });
    console.log(`\n✓ Total admin notifications in database: ${count}`);

    const recent = await Notification.find({ role: 'admin' })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n📋 Recent admin notifications:');
    recent.forEach((notif, i) => {
      console.log(`   ${i+1}. ${notif.title} - ${notif.type} (${notif.createdAt.toISOString()})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPlacementNotification();
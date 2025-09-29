const mongoose = require('mongoose');
const SubAdmin = require('./models/SubAdmin');
require('dotenv').config();

const resetSubAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Reset password for the first sub-admin
    const subAdmin = await SubAdmin.findOne({ email: 'manasiabyali@gmail.com' });
    if (!subAdmin) {
      console.log('Sub-admin not found');
      process.exit(1);
    }

    subAdmin.password = 'subadmin123';
    await subAdmin.save();

    console.log('Sub-admin password reset successfully!');
    console.log('Email: manasiabyali@gmail.com');
    console.log('Password: subadmin123');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetSubAdminPassword();
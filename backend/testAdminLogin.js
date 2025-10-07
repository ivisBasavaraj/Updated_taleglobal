const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin
    const admin = await Admin.findOne({ email: 'admin@tale.com' });
    if (!admin) {
      console.log('Admin not found!');
      process.exit(1);
    }

    console.log('Admin found:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });

    // Test password comparison
    const isPasswordValid = await admin.comparePassword('admin123456');
    console.log('Password valid:', isPasswordValid);

    // Test wrong password
    const isWrongPasswordValid = await admin.comparePassword('wrongpassword');
    console.log('Wrong password valid:', isWrongPasswordValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminLogin();
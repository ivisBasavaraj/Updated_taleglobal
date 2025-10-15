const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function resetPlacementPassword() {
  try {
    await connectDB();
    console.log('Connected to database');

    const email = 'admin@tale.com'; // Change this to the email you want to reset
    const newPassword = 'password123'; // Set a known password
    
    console.log(`Resetting password for: ${email}`);
    console.log(`New password will be: ${newPassword}`);
    
    const placement = await Placement.findOne({ email });
    if (!placement) {
      console.log('❌ Placement officer not found');
      return;
    }
    
    console.log(`Found placement officer: ${placement.name}`);
    console.log(`Current status: ${placement.status}`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the placement officer
    await Placement.findByIdAndUpdate(placement._id, {
      password: hashedPassword,
      status: 'active',
      isVerified: true
    });
    
    console.log('✅ Password reset successfully!');
    console.log('✅ Status set to active');
    console.log('✅ Account verified');
    
    // Test the new password
    const updatedPlacement = await Placement.findById(placement._id);
    const isMatch = await updatedPlacement.comparePassword(newPassword);
    console.log(`✅ Password test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n🎯 Now you can login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetPlacementPassword();
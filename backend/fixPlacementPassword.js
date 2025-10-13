const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function fixPlacementPassword() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find the test placement officer
    const placement = await Placement.findOne({ email: 'placement@test.com' });
    if (!placement) {
      console.log('Test placement officer not found');
      return;
    }

    console.log('Found placement officer:', placement.name);

    // Update password directly (the pre-save hook will hash it)
    placement.password = 'password123';
    await placement.save();

    console.log('Password updated successfully');

    // Test password comparison
    const isMatch = await placement.comparePassword('password123');
    console.log('Password comparison test:', isMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixPlacementPassword();
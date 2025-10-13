const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function createTestPlacement() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create a test placement officer
    const placementData = {
      name: 'Test Placement Officer',
      email: 'placement@test.com',
      password: 'password123',
      phone: '1234567890',
      collegeName: 'Test College',
      status: 'active',
      isVerified: true
    };

    const placement = await Placement.create(placementData);
    console.log('Created test placement officer:', {
      id: placement._id,
      name: placement.name,
      email: placement.email,
      status: placement.status
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestPlacement();
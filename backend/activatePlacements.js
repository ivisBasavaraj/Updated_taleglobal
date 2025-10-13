const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function activatePlacements() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Update all placement officers to active status
    const result = await Placement.updateMany({}, { 
      status: 'active', 
      isVerified: true 
    });

    console.log(`Updated ${result.modifiedCount} placement officers to active status`);

    // List all placement officers
    const placements = await Placement.find({}).select('name email status');
    console.log('All placement officers:', placements);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

activatePlacements();
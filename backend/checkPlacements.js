const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function checkPlacements() {
  try {
    await connectDB();
    console.log('Connected to database');

    const placements = await Placement.find({}).select('name email status isVerified');
    console.log('All placement officers:');
    console.log(placements);

    if (placements.length > 0) {
      // Activate the first placement officer for testing
      const firstPlacement = placements[0];
      await Placement.findByIdAndUpdate(firstPlacement._id, {
        status: 'active',
        isVerified: true
      });
      console.log(`\nActivated placement officer: ${firstPlacement.name} (${firstPlacement.email})`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkPlacements();
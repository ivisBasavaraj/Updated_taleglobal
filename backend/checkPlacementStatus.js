const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function checkPlacementStatus() {
  try {
    await connectDB();
    console.log('Connected to database');

    console.log('Checking all placement officers...\n');
    
    const placements = await Placement.find({}).select('name email status isVerified createdAt');
    
    if (placements.length === 0) {
      console.log('No placement officers found');
      return;
    }

    console.log(`Found ${placements.length} placement officer(s):\n`);
    
    placements.forEach((placement, index) => {
      console.log(`${index + 1}. ${placement.name}`);
      console.log(`   Email: ${placement.email}`);
      console.log(`   Status: ${placement.status}`);
      console.log(`   Verified: ${placement.isVerified}`);
      console.log(`   Created: ${placement.createdAt}`);
      console.log('');
    });

    // Check if any are pending approval
    const pendingPlacements = placements.filter(p => p.status === 'pending');
    if (pendingPlacements.length > 0) {
      console.log(`⚠️  ${pendingPlacements.length} placement officer(s) are pending approval`);
      console.log('They need to be approved by admin before they can login');
    }

    const activePlacements = placements.filter(p => p.status === 'active');
    if (activePlacements.length > 0) {
      console.log(`✅ ${activePlacements.length} placement officer(s) are active and can login`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkPlacementStatus();
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function fixPlacementLogin() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all placement officers
    const placements = await Placement.find({});
    
    console.log(`Found ${placements.length} placement officer(s):\n`);
    
    for (const placement of placements) {
      console.log(`Checking: ${placement.name} (${placement.email})`);
      console.log(`  Current status: ${placement.status}`);
      console.log(`  Verified: ${placement.isVerified}`);
      
      // If status is active but not verified, fix it
      if (placement.status === 'active' && !placement.isVerified) {
        console.log(`  ✅ Setting isVerified to true for ${placement.email}`);
        await Placement.findByIdAndUpdate(placement._id, {
          isVerified: true
        });
      }
      
      // Test password comparison
      try {
        const testPassword = 'password123'; // Common test password
        const isMatch = await placement.comparePassword(testPassword);
        console.log(`  Password test (${testPassword}): ${isMatch ? '✅ Match' : '❌ No match'}`);
      } catch (error) {
        console.log(`  Password test error: ${error.message}`);
      }
      
      console.log('');
    }

    // Show final status
    console.log('\n=== FINAL STATUS ===');
    const updatedPlacements = await Placement.find({}).select('name email status isVerified');
    
    updatedPlacements.forEach(placement => {
      const canLogin = placement.status === 'active';
      console.log(`${placement.name} (${placement.email}): ${canLogin ? '✅ CAN LOGIN' : '❌ CANNOT LOGIN'}`);
      console.log(`  Status: ${placement.status}, Verified: ${placement.isVerified}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixPlacementLogin();
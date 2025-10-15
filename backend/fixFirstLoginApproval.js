const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function fixFirstLoginApproval() {
  try {
    await connectDB();
    console.log('Connected to database');

    console.log('\n=== CHECKING FIRST LOGIN APPROVAL STATUS ===\n');
    
    const placements = await Placement.find({}).select('name email status firstLoginApproved firstLoginAttemptedAt');
    
    console.log('Current placement officers:');
    placements.forEach(p => {
      console.log(`- ${p.name} (${p.email}):`);
      console.log(`  Status: ${p.status}`);
      console.log(`  First Login Approved: ${p.firstLoginApproved}`);
      console.log(`  First Login Attempted: ${p.firstLoginAttemptedAt || 'Never'}`);
      console.log('');
    });

    // Fix the specific placement officer
    const email = 'admin@tale.com';
    console.log(`\n=== FIXING FIRST LOGIN APPROVAL FOR: ${email} ===\n`);
    
    const result = await Placement.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          firstLoginApproved: true,
          status: 'active',
          isVerified: true
        }
      },
      { new: true }
    );
    
    if (result) {
      console.log('✅ Successfully updated placement officer:');
      console.log(`   Name: ${result.name}`);
      console.log(`   Email: ${result.email}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   First Login Approved: ${result.firstLoginApproved}`);
      console.log(`   Verified: ${result.isVerified}`);
    } else {
      console.log('❌ Placement officer not found');
    }

    console.log('\n🎯 The placement officer should now be able to login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: password123`);
    console.log(`   Login URL: http://localhost:3000/placement/login`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixFirstLoginApproval();
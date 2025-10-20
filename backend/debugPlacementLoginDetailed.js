const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function debugPlacementLoginDetailed() {
  try {
    await connectDB();
    console.log('Connected to database');

    const email = 'admin@tale.com';
    
    console.log(`\n=== DEBUGGING PLACEMENT LOGIN FOR: ${email} ===\n`);
    
    const placement = await Placement.findOne({ email });
    if (!placement) {
      console.log('❌ Placement not found');
      return;
    }

    console.log('✅ Placement found:');
    console.log(`   ID: ${placement._id}`);
    console.log(`   Name: ${placement.name}`);
    console.log(`   Email: ${placement.email}`);
    console.log(`   Status: ${placement.status}`);
    console.log(`   isVerified: ${placement.isVerified}`);
    console.log(`   Created: ${placement.createdAt}`);
    console.log(`   Updated: ${placement.updatedAt}`);
    console.log('');

    // Test different passwords
    const testPasswords = ['password123', 'admin123', 'tale123', '123456'];
    
    console.log('🔐 Testing passwords:');
    for (const pwd of testPasswords) {
      try {
        const isMatch = await placement.comparePassword(pwd);
        console.log(`   ${pwd}: ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        if (isMatch) {
          console.log(`\n🎯 CORRECT PASSWORD FOUND: ${pwd}`);
          break;
        }
      } catch (error) {
        console.log(`   ${pwd}: ❌ Error - ${error.message}`);
      }
    }

    console.log('\n📋 Login Requirements Check:');
    console.log(`   Status is 'active': ${placement.status === 'active' ? '✅' : '❌'}`);
    console.log(`   Should be able to login: ${placement.status === 'active' ? '✅ YES' : '❌ NO'}`);
    
    if (placement.status !== 'active') {
      console.log(`\n💡 ISSUE: Status is '${placement.status}' but needs to be 'active'`);
      console.log('   Fix: Update status to "active" in admin panel or database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPlacementLoginDetailed();
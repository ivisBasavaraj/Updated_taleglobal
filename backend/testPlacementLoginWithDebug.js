const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function testPlacementLoginWithDebug() {
  try {
    await connectDB();
    console.log('Connected to database');

    const email = 'admin@tale.com';
    const password = 'password123';
    
    console.log('\n=== SIMULATING PLACEMENT LOGIN LOGIC ===\n');
    
    // Step 1: Find placement
    console.log('Step 1: Finding placement...');
    const placement = await Placement.findOne({ email });
    if (!placement) {
      console.log('❌ Placement not found');
      return;
    }
    console.log('✅ Placement found');
    
    // Step 2: Check password
    console.log('\nStep 2: Checking password...');
    const isPasswordValid = await placement.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }
    console.log('✅ Password is valid');
    
    // Step 3: Check status
    console.log('\nStep 3: Checking status...');
    console.log(`Current status: ${placement.status}`);
    if (placement.status !== 'active') {
      console.log('❌ Status is not active - this would block login');
      console.log('Expected message: "Account pending admin approval. Please wait for admin to approve your account."');
      return;
    }
    console.log('✅ Status is active');
    
    // Step 4: Check for any other fields that might block login
    console.log('\nStep 4: Checking other potential blocking fields...');
    console.log(`isVerified: ${placement.isVerified}`);
    console.log(`firstLoginApproved: ${placement.firstLoginApproved}`);
    console.log(`isProcessed: ${placement.isProcessed}`);
    
    // Check if there are any other fields that might be causing the issue
    const allFields = Object.keys(placement.toObject());
    console.log('\nAll placement fields:', allFields);
    
    console.log('\n✅ All checks passed - login should work!');
    console.log('\n🤔 If login is still failing, the issue might be:');
    console.log('1. A different version of the placement controller');
    console.log('2. Middleware intercepting the request');
    console.log('3. A cached version of the code');
    console.log('4. The server needs to be restarted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPlacementLoginWithDebug();
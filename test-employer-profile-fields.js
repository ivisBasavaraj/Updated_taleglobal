#!/usr/bin/env node

/**
 * Test script to verify "Why Join Us" and "Google Maps Embed Code" fields are saved to MongoDB
 * Usage: node test-employer-profile-fields.js
 */

const mongoose = require('mongoose');
const Employer = require('./backend/models/Employer');
const EmployerProfile = require('./backend/models/EmployerProfile');
require('dotenv').config();

const testProfileData = {
  whyJoinUs: 'We offer competitive salaries, great work culture, and opportunities for growth in a fast-paced tech environment with cutting-edge technology.',
  googleMapsEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8733571147986!2d77.6245!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1c5e5e5e5e5d%3A0x1234567890abcdef!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
};

async function testEmployerProfileFields() {
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal';
  
  try {
    console.log('='.repeat(70));
    console.log('Testing Employer Profile Fields Storage');
    console.log('='.repeat(70));
    
    // Connect to database
    console.log('\n1. Connecting to database...');
    await mongoose.connect(dbUri);
    console.log('✓ Connected to MongoDB');
    
    // Find an active employer
    console.log('\n2. Finding an active employer...');
    const employer = await Employer.findOne({ 
      status: 'active', 
      isApproved: true 
    });
    
    if (!employer) {
      console.error('❌ No active approved employers found');
      return;
    }
    
    console.log(`✓ Found employer: ${employer.email}`);
    console.log(`  Company: ${employer.companyName}`);
    console.log(`  ID: ${employer._id}`);
    
    // Get or create profile
    console.log('\n3. Getting employer profile...');
    let profile = await EmployerProfile.findOne({ employerId: employer._id });
    
    if (!profile) {
      console.log('   Profile not found, creating new one...');
      profile = await EmployerProfile.create({
        employerId: employer._id,
        companyName: employer.companyName,
        email: employer.email,
        phone: employer.phone
      });
      console.log('   ✓ New profile created');
    } else {
      console.log('✓ Profile found');
    }
    
    console.log(`  Current whyJoinUs: ${profile.whyJoinUs ? profile.whyJoinUs.substring(0, 50) + '...' : 'NOT SET'}`);
    console.log(`  Current googleMapsEmbed: ${profile.googleMapsEmbed ? profile.googleMapsEmbed.substring(0, 50) + '...' : 'NOT SET'}`);
    
    // Update profile with test data
    console.log('\n4. Updating profile with test fields...');
    console.log(`  Setting whyJoinUs: ${testProfileData.whyJoinUs.substring(0, 50)}...`);
    console.log(`  Setting googleMapsEmbed: ${testProfileData.googleMapsEmbed.substring(0, 50)}...`);
    
    const updatedProfile = await EmployerProfile.findOneAndUpdate(
      { employerId: employer._id },
      {
        whyJoinUs: testProfileData.whyJoinUs,
        googleMapsEmbed: testProfileData.googleMapsEmbed
      },
      { new: true, upsert: true }
    );
    
    console.log('✓ Profile update completed');
    console.log(`  Returned whyJoinUs: ${updatedProfile.whyJoinUs?.substring(0, 50) || 'NOT SET'}...`);
    console.log(`  Returned googleMapsEmbed: ${updatedProfile.googleMapsEmbed?.substring(0, 50) || 'NOT SET'}...`);
    
    // Verify by fetching again
    console.log('\n5. Verifying persistence by fetching again...');
    const verifiedProfile = await EmployerProfile.findOne({ employerId: employer._id });
    
    // Check values
    const whyJoinUsMatch = verifiedProfile.whyJoinUs === testProfileData.whyJoinUs;
    const googleMapsMatch = verifiedProfile.googleMapsEmbed === testProfileData.googleMapsEmbed;
    
    console.log('\n6. Verification Results:');
    console.log(`  ${whyJoinUsMatch ? '✓' : '❌'} whyJoinUs saved correctly: ${whyJoinUsMatch ? 'YES' : 'NO'}`);
    if (!whyJoinUsMatch) {
      console.log(`     Expected (${testProfileData.whyJoinUs.length} chars): ${testProfileData.whyJoinUs.substring(0, 40)}...`);
      console.log(`     Got (${verifiedProfile.whyJoinUs?.length || 0} chars): ${verifiedProfile.whyJoinUs?.substring(0, 40) || 'NOT SET'}...`);
    }
    
    console.log(`  ${googleMapsMatch ? '✓' : '❌'} googleMapsEmbed saved correctly: ${googleMapsMatch ? 'YES' : 'NO'}`);
    if (!googleMapsMatch) {
      console.log(`     Expected (${testProfileData.googleMapsEmbed.length} chars): ${testProfileData.googleMapsEmbed.substring(0, 40)}...`);
      console.log(`     Got (${verifiedProfile.googleMapsEmbed?.length || 0} chars): ${verifiedProfile.googleMapsEmbed?.substring(0, 40) || 'NOT SET'}...`);
    }
    
    console.log('\n' + '='.repeat(70));
    if (whyJoinUsMatch && googleMapsMatch) {
      console.log('✓ ALL TESTS PASSED - Fields are properly saved to MongoDB');
      console.log('  The fix is working correctly!');
    } else {
      console.log('❌ TEST FAILED - Some fields were not properly saved');
      if (!whyJoinUsMatch) console.log('   - whyJoinUs field not saved');
      if (!googleMapsMatch) console.log('   - googleMapsEmbed field not saved');
    }
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  } finally {
    // Close connection
    try {
      await mongoose.connection.close();
      console.log('\n✓ Database connection closed');
    } catch (e) {
      // Ignore errors on close
    }
  }
}

// Run test
testEmployerProfileFields();
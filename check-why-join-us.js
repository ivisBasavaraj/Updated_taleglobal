const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const employerId = '6902437490d37516e931951d';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get profile data
    const EmployerProfile = require('./backend/models/EmployerProfile');
    const profile = await EmployerProfile.findOne({ employerId });
    
    if (profile) {
      console.log('\n=== Profile Data ===');
      console.log('Location:', profile.location);
      console.log('Why Join Us:', profile.whyJoinUs);
      console.log('Google Maps Embed:', profile.googleMapsEmbed ? profile.googleMapsEmbed.substring(0, 50) + '...' : 'Not set');
      console.log('\nFull profile object keys:', Object.keys(profile.toObject()));
    } else {
      console.log('Profile not found for employer:', employerId);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
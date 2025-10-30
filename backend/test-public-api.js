const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const EmployerProfile = require('./models/EmployerProfile');

async function testAPI() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    
    const employerId = '6902437490d37516e931951d';
    
    console.log('\n=== Fetching profile for employer:', employerId);
    
    const profile = await EmployerProfile.findOne({ employerId })
      .populate('employerId', 'name email phone companyName');
    
    if (profile) {
      console.log('\n=== Profile found in DB ===');
      console.log('Company:', profile.companyName);
      console.log('Location:', profile.location);
      console.log('WhyJoinUs:', profile.whyJoinUs || '[EMPTY]');
      console.log('GoogleMapsEmbed:', profile.googleMapsEmbed ? '[SET]' : '[EMPTY]');
      
      console.log('\n=== API Response would be ===');
      const response = { success: true, profile };
      console.log(JSON.stringify(response, null, 2).substring(0, 500) + '...');
    } else {
      console.log('Profile not found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

testAPI();
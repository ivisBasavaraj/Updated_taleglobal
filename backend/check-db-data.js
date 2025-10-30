const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const EmployerProfile = require('./models/EmployerProfile');

async function checkData() {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    
    console.log('Connected to MongoDB');
    
    const employerId = '6902437490d37516e931951d';
    const profile = await EmployerProfile.findOne({ employerId });
    
    if (profile) {
      console.log('\n=== Profile Found ===');
      console.log('Company Name:', profile.companyName);
      console.log('Location:', profile.location);
      console.log('Why Join Us:', profile.whyJoinUs || '[EMPTY]');
      console.log('Google Maps Embed:', profile.googleMapsEmbed ? '[SET]' : '[EMPTY]');
      console.log('Description:', profile.description ? profile.description.substring(0, 50) + '...' : '[EMPTY]');
      
      console.log('\n=== All Fields with Values ===');
      const obj = profile.toObject();
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (val !== undefined && val !== null && val !== '') {
          if (typeof val === 'string' && val.length > 50) {
            console.log(`${key}: [STRING - ${val.length} chars]`);
          } else if (Array.isArray(val)) {
            console.log(`${key}: [ARRAY - ${val.length} items]`);
          } else if (typeof val === 'object') {
            console.log(`${key}: [OBJECT]`);
          } else {
            console.log(`${key}: ${val}`);
          }
        }
      });
    } else {
      console.log('No profile found for employer:', employerId);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkData();
const mongoose = require('mongoose');
require('dotenv').config();

const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');

async function debugEmployerData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find the Manoj employer
    const employer = await Employer.findOne({ companyName: /manoj/i });
    if (employer) {
      console.log('Employer found:', employer);
      
      // Find the profile
      const profile = await EmployerProfile.findOne({ employerId: employer._id });
      console.log('Profile found:', profile);
      
      if (profile) {
        console.log('establishedSince:', profile.establishedSince);
        console.log('foundedYear:', profile.foundedYear);
      }
    } else {
      console.log('No employer found with name containing "manoj"');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugEmployerData();
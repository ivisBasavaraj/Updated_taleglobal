const mongoose = require('mongoose');
require('dotenv').config();

const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');

async function updateEmployerData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find the Manoj employer
    const employer = await Employer.findOne({ companyName: /manoj/i });
    if (employer) {
      console.log('Updating profile for:', employer.companyName);
      
      // Update the profile with establishedSince
      const result = await EmployerProfile.findOneAndUpdate(
        { employerId: employer._id },
        { 
          establishedSince: '2018',
          foundedYear: 2018,
          teamSize: '10-50',
          industry: 'IT Services'
        },
        { new: true }
      );
      
      console.log('Profile updated:', result);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

updateEmployerData();
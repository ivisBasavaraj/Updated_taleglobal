const mongoose = require('mongoose');
const Job = require('./models/Job');
const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');

async function testJobAPI() {
  try {
    // Find a job that has images
    const jobs = await Job.find({}).populate('employerId', 'companyName').limit(10);
    
    for (let job of jobs) {
      const profile = await EmployerProfile.findOne({employerId: job.employerId?._id});
      if (profile && profile.logo && profile.coverImage) {
        console.log('Found job with images:');
        console.log('Job ID:', job._id);
        console.log('Job Title:', job.title);
        console.log('Employer:', job.employerId?.companyName);
        console.log('Logo exists:', !!profile.logo);
        console.log('Cover exists:', !!profile.coverImage);
        console.log('Logo starts with data:', profile.logo.startsWith('data:'));
        console.log('Cover starts with data:', profile.coverImage.startsWith('data:'));
        
        // Test the API response format
        const jobWithProfile = {
          ...job.toObject(),
          employerProfile: profile.toObject(),
          postedBy: job.employerId.employerType === 'consultant' ? 'Consultant' : 'Company'
        };
        
        console.log('\nAPI Response structure:');
        console.log('job.employerProfile.logo exists:', !!jobWithProfile.employerProfile.logo);
        console.log('job.employerProfile.coverImage exists:', !!jobWithProfile.employerProfile.coverImage);
        break;
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testJobAPI();
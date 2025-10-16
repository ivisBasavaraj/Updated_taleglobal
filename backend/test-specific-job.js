const mongoose = require('mongoose');
const Job = require('./models/Job');
const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');

async function testSpecificJob() {
  try {
    const jobId = '68c016cff2e8ea3aca542c27';
    
    const job = await Job.findById(jobId).populate('employerId', 'companyName employerType').lean();
    if (!job) {
      console.log('Job not found');
      return;
    }
    
    console.log('Job found:', job.title);
    console.log('Employer:', job.employerId?.companyName);
    
    const profile = await EmployerProfile.findOne({employerId: job.employerId._id}).lean();
    if (profile) {
      console.log('Profile found');
      console.log('Logo exists:', !!profile.logo);
      console.log('Cover exists:', !!profile.coverImage);
      
      if (profile.logo) {
        console.log('Logo length:', profile.logo.length);
        console.log('Logo starts with data:', profile.logo.startsWith('data:'));
      }
      
      if (profile.coverImage) {
        console.log('Cover length:', profile.coverImage.length);
        console.log('Cover starts with data:', profile.coverImage.startsWith('data:'));
      }
    } else {
      console.log('No profile found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testSpecificJob();
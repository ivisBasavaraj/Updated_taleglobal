const mongoose = require('mongoose');
const EmployerProfile = require('./models/EmployerProfile');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');

async function checkImages() {
  try {
    const profiles = await EmployerProfile.find({}, {companyName: 1, logo: 1, coverImage: 1}).limit(5);
    console.log('Employer Profiles:', profiles.length);
    
    profiles.forEach((profile, i) => {
      console.log(`Profile ${i+1}:`);
      console.log('  Company:', profile.companyName);
      console.log('  Logo:', profile.logo ? 'EXISTS' : 'MISSING');
      console.log('  Cover:', profile.coverImage ? 'EXISTS' : 'MISSING');
    });

    const jobs = await Job.find({}, {title: 1, employerId: 1}).populate('employerId', 'companyName').limit(3);
    console.log('\nJobs:', jobs.length);
    
    for (let job of jobs) {
      console.log(`Job: ${job.title}`);
      console.log(`  Employer: ${job.employerId?.companyName}`);
      
      const profile = await EmployerProfile.findOne({employerId: job.employerId?._id});
      if (profile) {
        console.log('  Profile found - Logo:', profile.logo ? 'YES' : 'NO');
        console.log('  Profile found - Cover:', profile.coverImage ? 'YES' : 'NO');
      } else {
        console.log('  No profile found');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImages();
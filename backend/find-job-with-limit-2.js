const mongoose = require('mongoose');
const Job = require('./models/Job');

async function findJobWithLimit2() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');
    console.log('Connected to database');
    
    // Find a job with application limit of 2 and 0 applications
    const job = await Job.findOne({ 
      applicationLimit: 2,
      applicationCount: 0
    }).select('_id title applicationLimit applicationCount status');
    
    if (job) {
      console.log(`Found job: ${job.title}`);
      console.log(`Job ID: ${job._id}`);
      console.log(`Applications: ${job.applicationCount || 0}/${job.applicationLimit}`);
      console.log(`Status: ${job.status}`);
      console.log(`\nYou can visit: http://localhost:3000/job-detail/${job._id}`);
    } else {
      console.log('No job found with limit 2 and 0 applications');
      
      // Find any job with limit 2
      const anyJob = await Job.findOne({ 
        applicationLimit: 2
      }).select('_id title applicationLimit applicationCount status');
      
      if (anyJob) {
        console.log(`Found job with limit 2: ${anyJob.title}`);
        console.log(`Job ID: ${anyJob._id}`);
        console.log(`Applications: ${anyJob.applicationCount || 0}/${anyJob.applicationLimit}`);
        console.log(`Status: ${anyJob.status}`);
        console.log(`\nYou can visit: http://localhost:3000/job-detail/${anyJob._id}`);
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

findJobWithLimit2();
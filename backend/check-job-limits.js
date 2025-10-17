const mongoose = require('mongoose');
const Job = require('./models/Job');

async function checkAndSetJobLimits() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');
    console.log('Connected to database');
    
    // Find jobs with application limits
    const jobsWithLimits = await Job.find({ 
      applicationLimit: { $exists: true, $ne: null, $gt: 0 } 
    }).select('title applicationLimit applicationCount');
    
    console.log('Jobs with application limits:');
    jobsWithLimits.forEach(job => {
      console.log(`- ${job.title}: ${job.applicationCount || 0}/${job.applicationLimit}`);
    });
    
    if (jobsWithLimits.length === 0) {
      console.log('No jobs found with application limits set');
      
      // Let's set a limit of 2 for the first active job
      const firstJob = await Job.findOne({ status: 'active' });
      if (firstJob) {
        await Job.findByIdAndUpdate(firstJob._id, { applicationLimit: 2 });
        console.log(`Set application limit of 2 for job: ${firstJob.title}`);
        console.log(`Job ID: ${firstJob._id}`);
        console.log(`You can now visit: http://localhost:3000/job-detail/${firstJob._id}`);
      } else {
        console.log('No active jobs found');
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndSetJobLimits();
const express = require('express');
const mongoose = require('mongoose');
const Job = require('./models/Job');
const EmployerProfile = require('./models/EmployerProfile');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://127.0.0.1:27017/tale_jobportal');

async function testAPI() {
  try {
    const jobId = '68c016cff2e8ea3aca542c27';
    
    const job = await Job.findById(jobId)
      .populate({
        path: 'employerId',
        select: 'companyName email phone employerType'
      })
      .lean();
    
    if (!job) {
      console.log('Job not found');
      return;
    }

    console.log('Job found:', job.title);
    console.log('Employer ID:', job.employerId._id);

    const employerProfile = await EmployerProfile.findOne({ employerId: job.employerId._id }).lean();
    
    console.log('Profile found:', !!employerProfile);
    if (employerProfile) {
      console.log('Logo exists:', !!employerProfile.logo);
      console.log('Cover exists:', !!employerProfile.coverImage);
      
      const jobWithProfile = {
        ...job,
        employerProfile,
        postedBy: job.employerId.employerType === 'consultant' ? 'Consultant' : 'Company'
      };

      console.log('Final response has profile:', !!jobWithProfile.employerProfile);
      console.log('Final response has logo:', !!jobWithProfile.employerProfile?.logo);
      console.log('Final response has cover:', !!jobWithProfile.employerProfile?.coverImage);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testAPI();
const mongoose = require('mongoose');
const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function removeDummyRecruiters() {
  try {
    // Sample company names that were added via script
    const sampleCompanies = [
      'Wipro Limited',
      'HDFC Bank',
      'Apollo Hospitals',
      'BYJU\'S',
      'Mahindra & Mahindra',
      'Flipkart',
      'Infosys Limited',
      'Tata Consultancy Services'
    ];
    
    console.log('Finding dummy employers...');
    const dummyEmployers = await Employer.find({ 
      companyName: { $in: sampleCompanies } 
    });
    
    console.log(`Found ${dummyEmployers.length} dummy employers to remove`);
    
    if (dummyEmployers.length === 0) {
      console.log('No dummy employers found. Exiting...');
      return;
    }
    
    const employerIds = dummyEmployers.map(emp => emp._id);
    
    console.log('\nDummy employers to be removed:');
    dummyEmployers.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.companyName} (${emp.email})`);
    });
    
    // Remove associated applications first
    console.log('\nRemoving applications for dummy employers...');
    const jobs = await Job.find({ employerId: { $in: employerIds } });
    const jobIds = jobs.map(job => job._id);
    
    if (jobIds.length > 0) {
      const applicationsResult = await Application.deleteMany({ 
        jobId: { $in: jobIds } 
      });
      console.log(`Removed ${applicationsResult.deletedCount} applications`);
    }
    
    // Remove jobs
    console.log('\nRemoving jobs for dummy employers...');
    const jobsResult = await Job.deleteMany({ 
      employerId: { $in: employerIds } 
    });
    console.log(`Removed ${jobsResult.deletedCount} jobs`);
    
    // Remove employer profiles
    console.log('\nRemoving employer profiles...');
    const profilesResult = await EmployerProfile.deleteMany({ 
      employerId: { $in: employerIds } 
    });
    console.log(`Removed ${profilesResult.deletedCount} employer profiles`);
    
    // Remove employers
    console.log('\nRemoving employers...');
    const employersResult = await Employer.deleteMany({ 
      _id: { $in: employerIds } 
    });
    console.log(`Removed ${employersResult.deletedCount} employers`);
    
    console.log('\n✅ Successfully removed all dummy recruiters and their associated data!');
    
    // Show remaining employers
    console.log('\nRemaining employers in database:');
    const remainingEmployers = await Employer.find({});
    console.log(`Total: ${remainingEmployers.length}`);
    remainingEmployers.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.companyName} (${emp.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

removeDummyRecruiters();
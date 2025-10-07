const mongoose = require('mongoose');
require('dotenv').config();

const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testTopRecruitersAPI = async () => {
  try {
    await connectDB();
    console.log('Testing Top Recruiters API logic...\n');
    
    const { limit = 8 } = { limit: 8 };
    
    // Get active and approved employers
    const employers = await Employer.find({ 
      status: 'active', 
      isApproved: true 
    }).select('_id companyName employerType createdAt');
    
    console.log('Found employers:', employers.length);
    
    // Get job counts and profiles for each employer
    const recruitersWithData = await Promise.all(
      employers.map(async (employer) => {
        // Get job count for this employer
        const jobCount = await Job.countDocuments({
          employerId: employer._id,
          status: { $in: ['active', 'pending'] }
        });
        
        // Get employer profile
        const profile = await EmployerProfile.findOne({ employerId: employer._id });
        
        return {
          _id: employer._id,
          companyName: employer.companyName,
          employerType: employer.employerType,
          jobCount,
          logo: profile?.logo || null,
          description: profile?.description || profile?.companyDescription || 'Leading recruitment company',
          location: profile?.location || profile?.corporateAddress || 'Multiple Locations',
          industry: profile?.industry || profile?.industrySector || 'Various Industries',
          establishedSince: profile?.establishedSince || profile?.foundedYear || null,
          teamSize: profile?.teamSize || profile?.companySize || null,
          website: profile?.website || null
        };
      })
    );
    
    console.log('\nAll recruiters with job counts:');
    recruitersWithData.forEach(r => {
      console.log(`${r.companyName}: ${r.jobCount} jobs`);
    });
    
    // Sort by job count (descending) and take top recruiters
    const topRecruiters = recruitersWithData
      .filter(recruiter => recruiter.jobCount > 0) // Only include recruiters with active jobs
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, parseInt(limit));
    
    console.log('\nTop 8 recruiters (filtered and sorted):');
    topRecruiters.forEach((r, index) => {
      console.log(`${index + 1}. ${r.companyName} - ${r.jobCount} jobs - ${r.location}`);
    });
    
    console.log(`\nAPI would return ${topRecruiters.length} recruiters`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

testTopRecruitersAPI();
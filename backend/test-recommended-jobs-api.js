const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const CandidateProfile = require('./models/CandidateProfile');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRecommendedJobsAPI() {
  try {
    console.log('=== TESTING RECOMMENDED JOBS API LOGIC ===\n');
    
    // Get first candidate
    const candidate = await Candidate.findOne();
    if (!candidate) {
      console.log('No candidates found. Please run create-test-data.js first.');
      process.exit(1);
    }
    
    console.log(`Testing for candidate: ${candidate.name} (${candidate.email})`);
    
    // Simulate the API logic from candidateController.getRecommendedJobs
    const profile = await CandidateProfile.findOne({ candidateId: candidate._id });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      console.log('❌ No profile or skills found for candidate');
      process.exit(1);
    }
    
    console.log(`Candidate skills: ${profile.skills.join(', ')}`);
    
    // Get active jobs that match candidate skills
    const jobs = await Job.find({
      status: 'active',
      requiredSkills: { $in: profile.skills }
    })
    .populate('employerId', 'companyName')
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log(`\nFound ${jobs.length} matching jobs from database`);
    
    // Calculate skill match score for each job
    const jobsWithScore = jobs.map(job => {
      const jobObj = job.toObject();
      const matchingSkills = job.requiredSkills.filter(skill => 
        profile.skills.includes(skill)
      );
      const matchScore = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
      
      return {
        ...jobObj,
        matchingSkills,
        matchScore
      };
    });
    
    // Sort by match score (highest first)
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('\n📋 Recommended Jobs (sorted by match score):');
    jobsWithScore.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.employerId?.companyName || 'N/A'}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Required Skills: ${job.requiredSkills.join(', ')}`);
      console.log(`   Matching Skills: ${job.matchingSkills.join(', ')}`);
      console.log(`   Match Score: ${job.matchScore}%`);
      if (job.ctc && job.ctc.max) {
        console.log(`   CTC: ₹${(job.ctc.max / 100000).toFixed(1)} LPA`);
      }
    });
    
    // Test the API response format
    console.log('\n🔧 API Response Format:');
    const apiResponse = {
      success: true,
      jobs: jobsWithScore
    };
    
    console.log(`Response: { success: ${apiResponse.success}, jobs: [${apiResponse.jobs.length} jobs] }`);
    
    if (jobsWithScore.length === 0) {
      console.log('\n⚠️  No recommended jobs found. This could be because:');
      console.log('   1. No jobs match the candidate skills');
      console.log('   2. No active jobs in database');
      console.log('   3. Candidate has no skills in profile');
    } else {
      console.log('\n✅ Recommended jobs API is working correctly!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
}

testRecommendedJobsAPI();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const CandidateProfile = require('./models/CandidateProfile');
const Job = require('./models/Job');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugRecommendedJobs() {
  try {
    console.log('=== DEBUGGING RECOMMENDED JOBS ===\n');
    
    // 1. Check candidates and their profiles
    console.log('1. Checking candidates and profiles...');
    const candidates = await Candidate.find().limit(5);
    console.log(`Found ${candidates.length} candidates`);
    
    for (let candidate of candidates) {
      console.log(`\nCandidate: ${candidate.name} (${candidate.email})`);
      
      const profile = await CandidateProfile.findOne({ candidateId: candidate._id });
      if (profile) {
        console.log(`  Profile exists: YES`);
        console.log(`  Skills: ${profile.skills ? profile.skills.join(', ') : 'None'}`);
      } else {
        console.log(`  Profile exists: NO`);
      }
    }
    
    // 2. Check jobs and their required skills
    console.log('\n\n2. Checking jobs and required skills...');
    const jobs = await Job.find({ status: 'active' }).limit(10);
    console.log(`Found ${jobs.length} active jobs`);
    
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. Job: ${job.title}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Required Skills: ${job.requiredSkills ? job.requiredSkills.join(', ') : 'None'}`);
      console.log(`   Status: ${job.status}`);
    });
    
    // 3. Test recommendation logic for first candidate with profile
    console.log('\n\n3. Testing recommendation logic...');
    const candidateWithProfile = await Candidate.findOne();
    if (candidateWithProfile) {
      const profile = await CandidateProfile.findOne({ candidateId: candidateWithProfile._id });
      
      if (profile && profile.skills && profile.skills.length > 0) {
        console.log(`Testing for candidate: ${candidateWithProfile.name}`);
        console.log(`Candidate skills: ${profile.skills.join(', ')}`);
        
        const recommendedJobs = await Job.find({
          status: 'active',
          requiredSkills: { $in: profile.skills }
        }).populate('employerId', 'companyName').limit(5);
        
        console.log(`Found ${recommendedJobs.length} recommended jobs:`);
        recommendedJobs.forEach((job, index) => {
          const matchingSkills = job.requiredSkills.filter(skill => 
            profile.skills.includes(skill)
          );
          const matchScore = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
          
          console.log(`\n${index + 1}. ${job.title}`);
          console.log(`   Company: ${job.employerId?.companyName || 'N/A'}`);
          console.log(`   Required: ${job.requiredSkills.join(', ')}`);
          console.log(`   Matching: ${matchingSkills.join(', ')}`);
          console.log(`   Match Score: ${matchScore}%`);
        });
      } else {
        console.log('No candidate found with skills in profile');
        
        // Let's add some sample skills to a candidate profile
        console.log('\n4. Adding sample skills to candidate profile...');
        if (profile) {
          profile.skills = ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'];
          await profile.save();
          console.log(`Added skills to ${candidateWithProfile.name}: ${profile.skills.join(', ')}`);
        } else {
          // Create profile with skills
          const newProfile = new CandidateProfile({
            candidateId: candidateWithProfile._id,
            skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS']
          });
          await newProfile.save();
          console.log(`Created profile with skills for ${candidateWithProfile.name}`);
        }
        
        // Test again
        const updatedProfile = await CandidateProfile.findOne({ candidateId: candidateWithProfile._id });
        const recommendedJobs = await Job.find({
          status: 'active',
          requiredSkills: { $in: updatedProfile.skills }
        }).populate('employerId', 'companyName').limit(5);
        
        console.log(`\nAfter adding skills, found ${recommendedJobs.length} recommended jobs`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugRecommendedJobs();
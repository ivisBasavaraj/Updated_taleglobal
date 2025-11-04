const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const CandidateProfile = require('./models/CandidateProfile');
const Employer = require('./models/Employer');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixCandidateSkills() {
  try {
    console.log('=== FIXING CANDIDATE SKILLS FOR RECOMMENDED JOBS ===\n');
    
    // Find all candidates
    const candidates = await Candidate.find();
    console.log(`Found ${candidates.length} candidates`);
    
    for (let candidate of candidates) {
      console.log(`\nChecking candidate: ${candidate.name} (${candidate.email})`);
      
      // Check if profile exists
      let profile = await CandidateProfile.findOne({ candidateId: candidate._id });
      
      if (!profile) {
        console.log('  Creating new profile...');
        profile = new CandidateProfile({
          candidateId: candidate._id,
          skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Node.js'],
          location: 'Bangalore',
          resumeHeadline: 'Software Developer',
          profileSummary: 'Passionate developer with modern web technologies.'
        });
        await profile.save();
        console.log('  ✅ Created profile with skills');
      } else if (!profile.skills || profile.skills.length === 0) {
        console.log('  Adding skills to existing profile...');
        profile.skills = ['JavaScript', 'React', 'HTML', 'CSS', 'Node.js'];
        await profile.save();
        console.log('  ✅ Added skills to profile');
      } else {
        console.log(`  ✅ Profile already has skills: ${profile.skills.join(', ')}`);
      }
    }
    
    // Test recommendation logic for first candidate
    const firstCandidate = candidates[0];
    if (firstCandidate) {
      console.log(`\n=== TESTING RECOMMENDATIONS FOR ${firstCandidate.name} ===`);
      
      const profile = await CandidateProfile.findOne({ candidateId: firstCandidate._id });
      console.log(`Skills: ${profile.skills.join(', ')}`);
      
      const Job = require('./models/Job');
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
        
        console.log(`  ${index + 1}. ${job.title} (${matchScore}% match)`);
      });
    }
    
    console.log('\n✅ All candidates now have skills in their profiles!');
    console.log('You can now test the recommended jobs at: http://localhost:3000/candidate/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCandidateSkills();
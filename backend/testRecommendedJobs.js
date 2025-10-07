const mongoose = require('mongoose');
const Job = require('./models/Job');
const CandidateProfile = require('./models/CandidateProfile');
const Candidate = require('./models/Candidate');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/jobzz_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRecommendedJobs() {
  try {
    console.log('Testing recommended jobs functionality...\n');

    // Find a candidate with skills
    const candidateWithSkills = await CandidateProfile.findOne({ 
      skills: { $exists: true, $ne: [] } 
    }).populate('candidateId', 'name email');

    if (!candidateWithSkills) {
      console.log('No candidate found with skills. Creating test data...');
      
      // Create a test candidate
      const testCandidate = await Candidate.create({
        name: 'Test Candidate',
        email: 'test@example.com',
        password: 'password123',
        registrationMethod: 'signup'
      });

      // Create profile with skills
      const testProfile = await CandidateProfile.create({
        candidateId: testCandidate._id,
        skills: ['JavaScript', 'React', 'Node.js', 'Python']
      });

      console.log('Created test candidate with skills:', testProfile.skills);
      candidateWithSkills = testProfile;
    }

    console.log('Found candidate:', candidateWithSkills.candidateId?.name || 'Test Candidate');
    console.log('Skills:', candidateWithSkills.skills);

    // Find jobs that match the skills
    const matchingJobs = await Job.find({
      status: 'active',
      requiredSkills: { $in: candidateWithSkills.skills }
    }).populate('employerId', 'companyName');

    console.log(`\nFound ${matchingJobs.length} matching jobs:`);
    
    matchingJobs.forEach((job, index) => {
      const matchingSkills = job.requiredSkills.filter(skill => 
        candidateWithSkills.skills.includes(skill)
      );
      
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.employerId?.companyName || 'N/A'}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Required Skills: ${job.requiredSkills.join(', ')}`);
      console.log(`   Matching Skills: ${matchingSkills.join(', ')}`);
      console.log(`   Match Score: ${matchingSkills.length}/${job.requiredSkills.length}`);
      console.log('');
    });

    if (matchingJobs.length === 0) {
      console.log('No matching jobs found. Creating test job...');
      
      // Find an employer to assign the job to
      let testEmployer = await Employer.findOne();
      
      if (!testEmployer) {
        testEmployer = await Employer.create({
          companyName: 'Test Company',
          email: 'employer@test.com',
          password: 'password123',
          isApproved: true
        });
      }

      // Create a test job with matching skills
      const testJob = await Job.create({
        title: 'Frontend Developer',
        description: 'Looking for a skilled frontend developer',
        employerId: testEmployer._id,
        location: 'Bangalore',
        jobType: 'full-time',
        requiredSkills: ['JavaScript', 'React'],
        status: 'active',
        salary: { min: 300000, max: 600000 }
      });

      console.log('Created test job:', testJob.title);
      console.log('Skills:', testJob.requiredSkills);
    }

    console.log('\nRecommended jobs API test completed successfully!');
    
  } catch (error) {
    console.error('Error testing recommended jobs:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRecommendedJobs();
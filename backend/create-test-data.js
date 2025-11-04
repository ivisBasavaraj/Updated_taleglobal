const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const CandidateProfile = require('./models/CandidateProfile');
const Job = require('./models/Job');
const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('=== CREATING TEST DATA FOR RECOMMENDED JOBS ===\n');
    
    // 1. Create test employers
    console.log('1. Creating test employers...');
    const employers = await Employer.insertMany([
      {
        name: 'John HR Manager',
        companyName: 'TechCorp Solutions',
        email: 'hr@techcorp.com',
        password: 'password123',
        phone: '9876543210',
        isApproved: true,
        status: 'active'
      },
      {
        name: 'Sarah Recruiter',
        companyName: 'Digital Innovations',
        email: 'careers@digital.com',
        password: 'password123',
        phone: '9876543211',
        isApproved: true,
        status: 'active'
      },
      {
        name: 'Mike Talent Lead',
        companyName: 'Creative Studios',
        email: 'jobs@creative.com',
        password: 'password123',
        phone: '9876543212',
        isApproved: true,
        status: 'active'
      }
    ]);
    console.log(`Created ${employers.length} employers`);
    
    // 2. Create test jobs with skills
    console.log('\n2. Creating test jobs...');
    const jobs = await Job.insertMany([
      {
        title: 'Frontend React Developer',
        description: 'Looking for a skilled React developer to build modern web applications.',
        employerId: employers[0]._id,
        location: 'Bangalore',
        category: 'IT',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
        ctc: { min: 400000, max: 800000 },
        vacancies: 3,
        experienceLevel: 'freshers'
      },
      {
        title: 'Full Stack Developer',
        description: 'Full stack developer with Node.js and React experience.',
        employerId: employers[0]._id,
        location: 'Bangalore',
        category: 'IT',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express'],
        ctc: { min: 600000, max: 1000000 },
        vacancies: 2,
        experienceLevel: 'minimum'
      },
      {
        title: 'UI/UX Designer',
        description: 'Creative designer for web and mobile applications.',
        employerId: employers[1]._id,
        location: 'Mumbai',
        category: 'Design',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['Figma', 'Adobe XD', 'Photoshop', 'UI Design', 'UX Research'],
        ctc: { min: 350000, max: 700000 },
        vacancies: 2,
        experienceLevel: 'freshers'
      },
      {
        title: 'Digital Marketing Executive',
        description: 'Digital marketing professional for social media and SEO.',
        employerId: employers[1]._id,
        location: 'Mumbai',
        category: 'Marketing',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['SEO', 'Social Media Marketing', 'Google Ads', 'Content Marketing', 'Analytics'],
        ctc: { min: 300000, max: 600000 },
        vacancies: 1,
        experienceLevel: 'freshers'
      },
      {
        title: 'Python Developer',
        description: 'Backend developer with Python and Django experience.',
        employerId: employers[2]._id,
        location: 'Delhi',
        category: 'IT',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Git'],
        ctc: { min: 500000, max: 900000 },
        vacancies: 2,
        experienceLevel: 'minimum'
      },
      {
        title: 'Content Writer',
        description: 'Content writer for blogs, websites, and marketing materials.',
        employerId: employers[2]._id,
        location: 'Delhi',
        category: 'Content',
        jobType: 'full-time',
        status: 'active',
        requiredSkills: ['Content Writing', 'SEO Writing', 'Research', 'WordPress', 'Social Media'],
        ctc: { min: 250000, max: 450000 },
        vacancies: 1,
        experienceLevel: 'freshers'
      }
    ]);
    console.log(`Created ${jobs.length} jobs`);
    
    // 3. Create test candidates
    console.log('\n3. Creating test candidates...');
    const candidates = await Candidate.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543220',
        registrationMethod: 'signup',
        credits: 0,
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543221',
        registrationMethod: 'signup',
        credits: 0,
        status: 'active'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        phone: '9876543222',
        registrationMethod: 'signup',
        credits: 0,
        status: 'active'
      }
    ]);
    console.log(`Created ${candidates.length} candidates`);
    
    // 4. Create candidate profiles with skills
    console.log('\n4. Creating candidate profiles with skills...');
    const profiles = await CandidateProfile.insertMany([
      {
        candidateId: candidates[0]._id,
        location: 'Bangalore',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
        resumeHeadline: 'Frontend Developer with React expertise',
        profileSummary: 'Passionate frontend developer with experience in React and modern web technologies.',
        expectedSalary: 500000,
        jobPreferences: {
          jobType: 'full-time',
          preferredLocations: ['Bangalore', 'Mumbai'],
          remoteWork: true
        }
      },
      {
        candidateId: candidates[1]._id,
        location: 'Mumbai',
        skills: ['Figma', 'Adobe XD', 'Photoshop', 'UI Design', 'HTML', 'CSS'],
        resumeHeadline: 'UI/UX Designer with creative flair',
        profileSummary: 'Creative designer with expertise in user interface and user experience design.',
        expectedSalary: 400000,
        jobPreferences: {
          jobType: 'full-time',
          preferredLocations: ['Mumbai', 'Delhi'],
          remoteWork: false
        }
      },
      {
        candidateId: candidates[2]._id,
        location: 'Delhi',
        skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'JavaScript'],
        resumeHeadline: 'Python Backend Developer',
        profileSummary: 'Backend developer specializing in Python and Django web applications.',
        expectedSalary: 600000,
        jobPreferences: {
          jobType: 'full-time',
          preferredLocations: ['Delhi', 'Bangalore'],
          remoteWork: true
        }
      }
    ]);
    console.log(`Created ${profiles.length} candidate profiles`);
    
    // 5. Test recommendation logic
    console.log('\n5. Testing recommendation logic...');
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const profile = profiles[i];
      
      console.log(`\nTesting for ${candidate.name}:`);
      console.log(`Skills: ${profile.skills.join(', ')}`);
      
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
        
        console.log(`  ${index + 1}. ${job.title} at ${job.employerId?.companyName || 'Unknown'} (${matchScore}% match)`);
      });
    }
    
    console.log('\n✅ Test data created successfully!');
    console.log('\nYou can now test the recommended jobs feature at: http://localhost:3000/candidate/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
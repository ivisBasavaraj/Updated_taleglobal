const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Candidate = require('./models/Candidate');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAPIEndpoint() {
  try {
    console.log('=== TESTING RECOMMENDED JOBS API ENDPOINT ===\n');
    
    // Get first candidate to generate token
    const candidate = await Candidate.findOne();
    if (!candidate) {
      console.log('No candidates found. Please run create-test-data.js first.');
      process.exit(1);
    }
    
    console.log(`Testing with candidate: ${candidate.name} (${candidate.email})`);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: candidate._id, role: 'candidate' }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '1h' }
    );
    
    console.log('Generated token for API testing');
    
    // Test the API endpoint using fetch
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:5000/api/candidate/recommended-jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log(`\nAPI Response Status: ${response.status}`);
      console.log('API Response Data:', JSON.stringify(data, null, 2));
      
      if (data.success && data.jobs) {
        console.log(`\n✅ API endpoint working! Found ${data.jobs.length} recommended jobs`);
        
        data.jobs.forEach((job, index) => {
          console.log(`\n${index + 1}. ${job.title}`);
          console.log(`   Company: ${job.employerId?.companyName || 'N/A'}`);
          console.log(`   Match Score: ${job.matchScore}%`);
          console.log(`   Matching Skills: ${job.matchingSkills?.join(', ') || 'N/A'}`);
        });
      } else {
        console.log('❌ API endpoint returned no jobs or error');
      }
      
    } catch (fetchError) {
      console.error('❌ Error calling API endpoint:', fetchError.message);
      console.log('Make sure the backend server is running on http://localhost:5000');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAPIEndpoint();
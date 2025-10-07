const axios = require('axios');

const testTopRecruitersAPI = async () => {
  try {
    console.log('Testing Top Recruiters API...');
    
    const response = await axios.get('http://localhost:5000/api/public/top-recruiters?limit=6');
    
    console.log('API Response Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Recruiters:', response.data.total);
    
    if (response.data.recruiters && response.data.recruiters.length > 0) {
      console.log('\nTop Recruiters:');
      response.data.recruiters.forEach((recruiter, index) => {
        console.log(`${index + 1}. ${recruiter.companyName}`);
        console.log(`   - Job Count: ${recruiter.jobCount}`);
        console.log(`   - Location: ${recruiter.location}`);
        console.log(`   - Industry: ${recruiter.industry}`);
        console.log(`   - Type: ${recruiter.employerType}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testTopRecruitersAPI();
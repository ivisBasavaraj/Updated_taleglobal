const mongoose = require('mongoose');
const Employer = require('./models/Employer');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function checkAllEmployers() {
  try {
    const allEmployers = await Employer.find({});
    console.log('Total employers:', allEmployers.length);
    console.log('\nAll Employers:');
    
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
    
    const realEmployers = [];
    const sampleEmployers = [];
    
    allEmployers.forEach((emp, index) => {
      const info = {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        companyName: emp.companyName,
        type: emp.employerType,
        approved: emp.isApproved,
        status: emp.status
      };
      
      if (sampleCompanies.includes(emp.companyName)) {
        sampleEmployers.push(info);
      } else {
        realEmployers.push(info);
      }
    });
    
    console.log('\n=== REAL EMPLOYERS ===');
    console.log('Count:', realEmployers.length);
    realEmployers.forEach((emp, index) => {
      console.log(`\n${index + 1}. ${emp.companyName}`);
      console.log('   ID:', emp.id);
      console.log('   Email:', emp.email);
      console.log('   Status:', emp.status);
      console.log('   Approved:', emp.approved);
    });
    
    console.log('\n\n=== SAMPLE/DUMMY EMPLOYERS ===');
    console.log('Count:', sampleEmployers.length);
    sampleEmployers.forEach((emp, index) => {
      console.log(`\n${index + 1}. ${emp.companyName}`);
      console.log('   ID:', emp.id);
      console.log('   Email:', emp.email);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllEmployers();
const mongoose = require('mongoose');
const Employer = require('./models/Employer');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function testEmployerLogin() {
  try {
    console.log('Testing employer login functionality...');
    
    // Get a sample employer
    const employer = await Employer.findOne({ status: 'active', isApproved: true });
    
    if (!employer) {
      console.log('No active approved employers found');
      return;
    }
    
    console.log(`Testing with employer: ${employer.email}`);
    console.log(`Status: ${employer.status}`);
    console.log(`Approved: ${employer.isApproved}`);
    
    // Test password comparison (assuming password is 'password123' for test accounts)
    const testPassword = 'password123';
    const isPasswordValid = await employer.comparePassword(testPassword);
    
    console.log(`Password test result: ${isPasswordValid ? 'PASS' : 'FAIL'}`);
    
    if (employer.status === 'active' && employer.isApproved && isPasswordValid) {
      console.log('✅ Employer login should work correctly');
    } else {
      console.log('❌ Employer login may have issues');
    }
    
  } catch (error) {
    console.error('Error testing employer login:', error);
  } finally {
    mongoose.connection.close();
  }
}

testEmployerLogin();
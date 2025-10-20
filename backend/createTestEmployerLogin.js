const mongoose = require('mongoose');
const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');
const Subscription = require('./models/Subscription');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function createTestEmployerLogin() {
  try {
    console.log('Creating/updating test employer for login testing...');
    
    const testEmail = 'test@employer.com';
    const testPassword = 'test123';
    
    // Remove existing test employer if exists
    await Employer.deleteOne({ email: testEmail });
    await EmployerProfile.deleteOne({ email: testEmail });
    
    // Create new test employer
    const employer = await Employer.create({
      name: 'Test Employer',
      email: testEmail,
      password: testPassword,
      phone: '1234567890',
      companyName: 'Test Company Ltd',
      employerType: 'company',
      status: 'active',
      isApproved: true,
      isVerified: true
    });
    
    // Create employer profile
    await EmployerProfile.create({
      employerId: employer._id,
      companyName: 'Test Company Ltd',
      email: testEmail,
      phone: '1234567890',
      description: 'Test company for login testing'
    });
    
    // Create subscription
    await Subscription.create({
      employerId: employer._id
    });
    
    console.log('✅ Test employer created successfully!');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Status: active');
    console.log('Approved: true');
    
    // Test the login
    const testEmployer = await Employer.findOne({ email: testEmail });
    const isPasswordValid = await testEmployer.comparePassword(testPassword);
    
    console.log(`Password verification: ${isPasswordValid ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error('Error creating test employer:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestEmployerLogin();
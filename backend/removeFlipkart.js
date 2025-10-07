const mongoose = require('mongoose');
require('dotenv').config();

const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');
const Job = require('./models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const removeFlipkart = async () => {
  try {
    // Find Flipkart employer
    const flipkartEmployer = await Employer.findOne({ companyName: 'Flipkart' });
    
    if (!flipkartEmployer) {
      console.log('Flipkart employer not found');
      return;
    }
    
    console.log('Found Flipkart employer:', flipkartEmployer.companyName);
    
    // Remove jobs
    const deletedJobs = await Job.deleteMany({ employerId: flipkartEmployer._id });
    console.log(`Deleted ${deletedJobs.deletedCount} jobs`);
    
    // Remove profile
    const deletedProfile = await EmployerProfile.deleteOne({ employerId: flipkartEmployer._id });
    console.log(`Deleted ${deletedProfile.deletedCount} profile`);
    
    // Remove employer
    const deletedEmployer = await Employer.deleteOne({ _id: flipkartEmployer._id });
    console.log(`Deleted ${deletedEmployer.deletedCount} employer`);
    
    console.log('Flipkart removed successfully!');
    
  } catch (error) {
    console.error('Error removing Flipkart:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  removeFlipkart();
});
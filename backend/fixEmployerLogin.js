const mongoose = require('mongoose');
const Employer = require('./models/Employer');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function fixEmployerLogin() {
  try {
    console.log('Fixing employer login issues...');
    
    // Find all employers with inactive status or not approved
    const employers = await Employer.find({
      $or: [
        { status: { $ne: 'active' } },
        { isApproved: false }
      ]
    });
    
    console.log(`Found ${employers.length} employers with login issues`);
    
    // Fix each employer
    for (const employer of employers) {
      console.log(`Fixing employer: ${employer.email}`);
      
      await Employer.findByIdAndUpdate(employer._id, {
        status: 'active',
        isApproved: true
      });
      
      console.log(`✓ Fixed ${employer.email}`);
    }
    
    console.log('All employer login issues fixed!');
    
  } catch (error) {
    console.error('Error fixing employer login:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixEmployerLogin();
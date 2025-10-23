const mongoose = require('mongoose');
const Placement = require('./models/Placement');
require('dotenv').config();

const checkPlacement = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const placements = await Placement.find({});
    console.log(`Found ${placements.length} placement officers:`);
    
    placements.forEach(p => {
      console.log(`- ${p.name} (${p.email}) - Status: ${p.status}`);
    });

    if (placements.length === 0) {
      console.log('\nNo placement officers found. Creating test placement...');
      
      const testPlacement = await Placement.create({
        name: 'Test Placement Officer',
        email: 'placement@test.com',
        password: 'password123',
        phone: '1234567890',
        collegeName: 'Test College',
        status: 'active'
      });
      
      console.log('Test placement created:');
      console.log(`Email: ${testPlacement.email}`);
      console.log(`Password: password123`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPlacement();
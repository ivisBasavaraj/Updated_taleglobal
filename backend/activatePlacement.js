const mongoose = require('mongoose');
const Placement = require('./models/Placement');
require('dotenv').config();

const activatePlacement = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all placements and activate them
    const result = await Placement.updateMany(
      { status: { $ne: 'active' } },
      { $set: { status: 'active' } }
    );

    console.log(`Updated ${result.modifiedCount} placement officers to active status`);

    // List all placements
    const placements = await Placement.find({}).select('name email status');
    console.log('\nAll placement officers:');
    placements.forEach(p => {
      console.log(`- ${p.name} (${p.email}) - Status: ${p.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

activatePlacement();
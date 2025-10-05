const mongoose = require('mongoose');
require('dotenv').config();

const Placement = require('./models/Placement');

async function fixPlacement() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update the placement with undefined collegeName
    const result = await Placement.findByIdAndUpdate(
      '68d628fd0e967ccef54c786b',
      { collegeName: 'KLE Technologies' },
      { new: true }
    );
    
    console.log('✅ Updated placement:', result.name, '-', result.collegeName);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixPlacement();
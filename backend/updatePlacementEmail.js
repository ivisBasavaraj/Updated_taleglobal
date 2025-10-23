const mongoose = require('mongoose');
const Placement = require('./models/Placement');
require('dotenv').config();

const updateEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Placement.updateOne(
      { email: 'placement@test.com' },
      { email: 'placement@gmail.com' }
    );
    
    console.log('Updated placement email to placement@gmail.com');
    
    const placement = await Placement.findOne({ email: 'placement@gmail.com' });
    console.log('Placement user:', placement.email, 'Status:', placement.status);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateEmail();
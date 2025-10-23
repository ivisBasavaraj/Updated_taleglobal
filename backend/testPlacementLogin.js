const mongoose = require('mongoose');
const Placement = require('./models/Placement');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const placement = await Placement.findOne({ email: 'placement@test.com' });
    if (!placement) {
      console.log('Placement not found');
      return;
    }
    
    console.log('Placement found:', placement.email);
    console.log('Status:', placement.status);
    
    const isValid = await placement.comparePassword('password123');
    console.log('Password valid:', isValid);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function debugPlacementLogin() {
  try {
    await connectDB();
    console.log('Connected to database');

    const email = 'placement@test.com';
    const password = 'password123';

    console.log('Looking for placement with email:', email);
    
    const placement = await Placement.findOne({ email });
    if (!placement) {
      console.log('Placement not found');
      return;
    }

    console.log('Found placement:', {
      id: placement._id,
      name: placement.name,
      email: placement.email,
      status: placement.status,
      hasPassword: !!placement.password,
      passwordLength: placement.password ? placement.password.length : 0
    });

    console.log('Testing password comparison...');
    const isMatch = await placement.comparePassword(password);
    console.log('Password match:', isMatch);

    if (placement.status !== 'active') {
      console.log('Account status issue:', placement.status);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPlacementLogin();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Placement = require('./models/Placement');

async function testPlacementAuth() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Find a placement officer
    const placement = await Placement.findOne({ status: 'active' });
    if (!placement) {
      console.log('No active placement officer found');
      return;
    }

    console.log('Found placement officer:', {
      id: placement._id,
      name: placement.name,
      email: placement.email,
      status: placement.status
    });

    // Generate token
    const token = jwt.sign(
      { id: placement._id, role: 'placement' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('Generated token:', token);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    // Test API endpoint
    const API_BASE_URL = 'http://localhost:5000/api';
    
    console.log('\nTesting placement profile endpoint...');
    const response = await fetch(`${API_BASE_URL}/placement/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPlacementAuth();
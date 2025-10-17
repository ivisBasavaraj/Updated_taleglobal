const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error('Database connection error:', error.message);
    console.log('Running in offline mode - some features may be limited');
    
    // Disable mongoose buffering in offline mode
    mongoose.set('bufferCommands', false);
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
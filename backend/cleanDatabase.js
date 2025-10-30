require('dotenv').config();
const mongoose = require('mongoose');

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop all user-related collections
    const collections = ['candidates', 'candidateprofiles', 'employers', 'employerprofiles', 'applications', 'jobs', 'subscriptions'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).drop();
        console.log(`✅ Dropped ${collection} collection`);
      } catch (error) {
        if (error.message.includes('ns not found')) {
          console.log(`⚠️  Collection ${collection} doesn't exist`);
        } else {
          console.error(`❌ Error dropping ${collection}:`, error.message);
        }
      }
    }

    console.log('🧹 Database cleaned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanDatabase();
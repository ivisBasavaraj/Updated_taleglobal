const mongoose = require('mongoose');
require('dotenv').config();

async function fixReviewIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');
    const db = mongoose.connection.db;
    const collection = db.collection('reviews');
    
    // Drop the problematic index
    try {
      await collection.dropIndex('employerId_1_candidateId_1');
      console.log('Dropped problematic index: employerId_1_candidateId_1');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }
    
    // Create new index to prevent duplicate reviews from same email
    await collection.createIndex({ employerId: 1, reviewerEmail: 1 }, { unique: true });
    console.log('Created new index: employerId_1_reviewerEmail_1');
    
    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixReviewIndex();
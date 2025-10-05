const mongoose = require('mongoose');
const { processFileApproval } = require('./controllers/placementController');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testProcessDataAPI() {
  try {
    console.log('=== TESTING PROCESS DATA API ===');
    
    const placementId = '68dcc43c78467cf6bfc143d5';
    const fileId = '68dcc43c78467cf6bfc143d6';
    
    // Mock request and response objects
    const req = {
      params: {
        placementId: placementId,
        fileId: fileId
      },
      body: {
        fileName: 'students_batch_2024.xlsx'
      }
    };
    
    const res = {
      json: (data) => {
        console.log('API Response:', JSON.stringify(data, null, 2));
        return res;
      },
      status: (code) => {
        console.log('Status Code:', code);
        return res;
      }
    };
    
    console.log('Calling processFileApproval with:');
    console.log('Placement ID:', placementId);
    console.log('File ID:', fileId);
    
    await processFileApproval(req, res);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing API:', error);
    process.exit(1);
  }
}

testProcessDataAPI();
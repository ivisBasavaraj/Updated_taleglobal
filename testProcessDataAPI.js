// Simple test to verify process data API works
const fetch = require('node-fetch');

async function testProcessDataAPI() {
  try {
    // You need to replace these with actual values from your database
    const PLACEMENT_ID = 'YOUR_PLACEMENT_ID_HERE';
    const FILE_ID = 'YOUR_FILE_ID_HERE';
    const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';
    
    console.log('Testing Process Data API...');
    console.log('Placement ID:', PLACEMENT_ID);
    console.log('File ID:', FILE_ID);
    
    const response = await fetch(`http://localhost:5000/api/admin/placements/${PLACEMENT_ID}/files/${FILE_ID}/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName: 'test.xlsx' })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Process Data API is working!');
      console.log(`Created: ${data.stats.created} candidates`);
      console.log(`Skipped: ${data.stats.skipped} candidates`);
    } else {
      console.log('❌ Process Data API failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for running this test
console.log(`
To test the Process Data API:

1. Go to your admin panel and find a placement officer with uploaded files
2. Copy the placement ID from the URL (e.g., /admin/placement-details/PLACEMENT_ID)
3. Copy a file ID from the browser developer tools when viewing file data
4. Get an admin token by logging in and checking localStorage.adminToken
5. Replace the values above and run: node testProcessDataAPI.js

Or simply:
1. Open browser developer tools (F12)
2. Go to placement details page
3. Click "Process Data" button
4. Check Console tab for debug logs
5. Check Network tab for API request/response
`);

if (require.main === module) {
  testProcessDataAPI();
}

module.exports = testProcessDataAPI;
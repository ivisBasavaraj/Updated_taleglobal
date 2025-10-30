// Simple test to verify profile update data
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.put('/test-profile', (req, res) => {
    console.log('=== TEST PROFILE UPDATE ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('whyJoinUs:', req.body.whyJoinUs);
    console.log('googleMapsEmbed:', req.body.googleMapsEmbed);
    console.log('whyJoinUs type:', typeof req.body.whyJoinUs);
    console.log('googleMapsEmbed type:', typeof req.body.googleMapsEmbed);
    console.log('whyJoinUs length:', req.body.whyJoinUs?.length);
    console.log('googleMapsEmbed length:', req.body.googleMapsEmbed?.length);
    
    res.json({
        success: true,
        received: {
            whyJoinUs: req.body.whyJoinUs,
            googleMapsEmbed: req.body.googleMapsEmbed,
            keys: Object.keys(req.body)
        }
    });
});

app.listen(5001, () => {
    console.log('Test server running on port 5001');
    console.log('Test endpoint: PUT http://localhost:5001/test-profile');
});
const fetch = require('node-fetch');

async function testEmployerAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/public/employers/6902437490d37516e931951d');
        const data = await response.json();
        
        if (data.success && data.profile) {
            console.log('API Response Status:', data.success);
            console.log('Company Name:', data.profile.companyName || data.profile.employerId?.companyName);
            console.log('Why Join Us:', data.profile.whyJoinUs ? 'Present' : 'Missing');
            console.log('Google Maps Embed:', data.profile.googleMapsEmbed ? 'Present' : 'Missing');
            
            if (data.profile.whyJoinUs) {
                console.log('Why Join Us Content:', data.profile.whyJoinUs.substring(0, 100) + '...');
            }
            
            if (data.profile.googleMapsEmbed) {
                console.log('Google Maps Embed Content:', data.profile.googleMapsEmbed.substring(0, 100) + '...');
            }
        } else {
            console.log('API Error:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Test Error:', error.message);
    }
}

testEmployerAPI();
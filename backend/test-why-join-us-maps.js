const mongoose = require('mongoose');
require('dotenv').config();

const EmployerProfile = require('./models/EmployerProfile');

async function testWhyJoinUsAndMaps() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the specific employer profile
        const employerId = '6902437490d37516e931951d';
        const profile = await EmployerProfile.findOne({ employerId });
        
        if (!profile) {
            console.log('Profile not found');
            return;
        }

        console.log('Current profile data:');
        console.log('whyJoinUs:', profile.whyJoinUs);
        console.log('googleMapsEmbed:', profile.googleMapsEmbed);
        console.log('description:', profile.description);
        console.log('location:', profile.location);

        // Test update
        const testData = {
            whyJoinUs: 'Test Why Join Us Content - Updated at ' + new Date().toISOString(),
            googleMapsEmbed: '<iframe src="https://www.google.com/maps/embed?pb=test" width="400" height="300"></iframe>',
            description: 'Updated description',
            location: 'Updated location'
        };

        console.log('\nUpdating with test data...');
        const updatedProfile = await EmployerProfile.findOneAndUpdate(
            { employerId },
            testData,
            { new: true }
        );

        console.log('\nAfter update:');
        console.log('whyJoinUs:', updatedProfile.whyJoinUs);
        console.log('googleMapsEmbed:', updatedProfile.googleMapsEmbed);
        console.log('description:', updatedProfile.description);
        console.log('location:', updatedProfile.location);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testWhyJoinUsAndMaps();
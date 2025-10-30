const mongoose = require('mongoose');
require('dotenv').config();

const EmployerProfile = require('./models/EmployerProfile');

async function testProfileUpdate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const employerId = '6902437490d37516e931951d';
        
        // Simulate the profile update with the same logic as the controller
        const updateData = {
            whyJoinUs: 'This is a test Why Join Us content with multiple benefits and reasons to work with our company.',
            googleMapsEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            description: 'Updated company description',
            location: 'Bangalore, Karnataka, India',
            companyName: 'KraftIQ'
        };

        console.log('Updating profile with data:');
        console.log('whyJoinUs length:', updateData.whyJoinUs.length);
        console.log('googleMapsEmbed length:', updateData.googleMapsEmbed.length);

        const profile = await EmployerProfile.findOneAndUpdate(
            { employerId },
            updateData,
            { new: true, upsert: true }
        );

        console.log('\nProfile updated successfully!');
        console.log('Saved whyJoinUs:', profile.whyJoinUs);
        console.log('Saved googleMapsEmbed:', profile.googleMapsEmbed?.substring(0, 100) + '...');
        console.log('Saved description:', profile.description);
        console.log('Saved location:', profile.location);

        // Verify by fetching again
        const verifyProfile = await EmployerProfile.findOne({ employerId });
        console.log('\nVerification - fetched from DB:');
        console.log('whyJoinUs exists:', !!verifyProfile.whyJoinUs);
        console.log('googleMapsEmbed exists:', !!verifyProfile.googleMapsEmbed);
        console.log('whyJoinUs length:', verifyProfile.whyJoinUs?.length);
        console.log('googleMapsEmbed length:', verifyProfile.googleMapsEmbed?.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testProfileUpdate();
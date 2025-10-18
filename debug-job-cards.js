// Test file to debug job card issues
console.log('=== JOB CARD DEBUG TEST ===');

// Test the API endpoint directly
async function testJobAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/public/jobs?limit=5');
        const data = await response.json();
        
        console.log('API Response:', data);
        console.log('Number of jobs:', data.jobs?.length || 0);
        
        if (data.jobs && data.jobs.length > 0) {
            console.log('First job data:', data.jobs[0]);
            console.log('CTC data:', data.jobs[0].ctc);
            console.log('Employer data:', data.jobs[0].employerId);
            console.log('Employer profile:', data.jobs[0].employerProfile);
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}

// Test CTC calculation
function testCTCCalculation(ctc) {
    console.log('Testing CTC calculation for:', ctc);
    
    if (ctc?.min && ctc?.max) {
        const minLPA = Math.floor(ctc.min / 100000);
        const maxLPA = Math.floor(ctc.max / 100000);
        const result = ctc.min === ctc.max ? `₹${minLPA}LPA` : `₹${minLPA} - ${maxLPA} LPA`;
        console.log('CTC Result:', result);
        return result;
    }
    console.log('CTC Result: Not specified');
    return 'Not specified';
}

// Run tests
testJobAPI();

// Test with sample data
testCTCCalculation({ min: 500000, max: 800000 });
testCTCCalculation({ min: 1200000, max: 1200000 });
testCTCCalculation(null);
testCTCCalculation({});
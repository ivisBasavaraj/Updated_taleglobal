// Debug authentication state
console.log('=== Authentication Debug ===');
console.log('Placement Token:', localStorage.getItem('placementToken'));
console.log('Placement User:', localStorage.getItem('placementUser'));
console.log('Candidate Token:', localStorage.getItem('candidateToken'));
console.log('Employer Token:', localStorage.getItem('employerToken'));
console.log('Admin Token:', localStorage.getItem('adminToken'));

// Test API call
const testPlacementAPI = async () => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
        console.error('No placement token found!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/placement/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API Response Status:', response.status);
        const data = await response.json();
        console.log('API Response Data:', data);
    } catch (error) {
        console.error('API Error:', error);
    }
};

// Run test if placement token exists
if (localStorage.getItem('placementToken')) {
    testPlacementAPI();
}
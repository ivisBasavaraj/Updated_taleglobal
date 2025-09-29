// Test script to verify admin login API
const testAdminLogin = async () => {
    try {
        console.log('Testing admin login API...');
        
        const response = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "admin@tale.com",
                password: "admin123456"
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
            console.log('✅ Login successful!');
            console.log('Token:', data.token);
            console.log('Admin:', data.admin);
        } else {
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
};

// Run the test
testAdminLogin();
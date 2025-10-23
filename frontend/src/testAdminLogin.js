// Test script to verify admin login API
const testAdminLogin = async () => {
    try {
        
        
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

        
        
        
        const data = await response.json();
        
        
        if (response.ok && data.success) {
            
            
            
        } else {
            
        }
    } catch (error) {
        
    }
};

// Run the test
testAdminLogin();

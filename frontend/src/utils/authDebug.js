// Authentication debugging utility
export const debugAuth = () => {
    console.log('=== Authentication Debug ===');
    
    // Check all tokens
    const tokens = {
        placement: localStorage.getItem('placementToken'),
        candidate: localStorage.getItem('candidateToken'),
        employer: localStorage.getItem('employerToken'),
        admin: localStorage.getItem('adminToken')
    };
    
    console.log('Stored Tokens:', tokens);
    
    // Check user data
    const users = {
        placement: localStorage.getItem('placementUser'),
        candidate: localStorage.getItem('candidateUser'),
        employer: localStorage.getItem('employerUser'),
        admin: localStorage.getItem('adminUser')
    };
    
    console.log('Stored Users:', users);
    
    // Find active user type
    const activeUserType = Object.keys(tokens).find(type => tokens[type]);
    console.log('Active User Type:', activeUserType);
    
    return { tokens, users, activeUserType };
};

// Test API connectivity
export const testAPIConnection = async () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
        const response = await fetch(`${API_BASE_URL}/../health`);
        const data = await response.json();
        console.log('API Health Check:', data);
        return { success: true, data };
    } catch (error) {
        console.error('API Connection Failed:', error);
        return { success: false, error: error.message };
    }
};

// Test placement authentication
export const testPlacementAuth = async () => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
        return { success: false, error: 'No placement token found' };
    }
    
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
        const response = await fetch(`${API_BASE_URL}/placement/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Placement Auth Success:', data);
            return { success: true, data };
        } else {
            console.error('Placement Auth Failed:', response.status, data);
            return { success: false, status: response.status, error: data.message };
        }
    } catch (error) {
        console.error('Placement Auth Error:', error);
        return { success: false, error: error.message };
    }
};

// Fix authentication issues
export const fixAuthIssues = () => {
    const { activeUserType } = debugAuth();
    
    if (!activeUserType) {
        console.log('No active user found. Redirecting to login...');
        window.location.href = '/login';
        return;
    }
    
    if (activeUserType === 'placement') {
        testPlacementAuth().then(result => {
            if (!result.success) {
                console.log('Placement auth failed. Clearing tokens and redirecting...');
                localStorage.removeItem('placementToken');
                localStorage.removeItem('placementUser');
                window.location.href = '/login';
            }
        });
    }
};
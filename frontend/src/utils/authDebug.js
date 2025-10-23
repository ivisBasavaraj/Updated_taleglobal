

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
    try {
        const response = await fetch('https://taleglobal.cloud/health');
        
        if (!response.ok) {
            throw new Error(`Backend server not running (HTTP ${response.status})`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Backend server not responding with JSON - please start the backend');
        }
        
        const data = await response.json();
        console.log('✅ Backend connected:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        console.log('💡 Run: cd backend && npm start');
        return { success: false, error: error.message };
    }
};

// Test placement authentication
export const testPlacementAuth = async () => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
        return { success: false, error: 'No placement token found' };
    }
    
    try {
        const response = await fetch('https://taleglobal.cloud/api/placement/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 0 || response.type === 'opaque') {
                throw new Error('Backend server not running');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Placement auth success:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Placement auth failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Fix authentication issues
export const fixAuthIssues = async () => {
    // First check if backend is running
    const healthCheck = await testAPIConnection();
    if (!healthCheck.success) {
        console.log('🚨 Backend server is not running!');
        console.log('💡 Please run: cd backend && npm start');
        return { backendDown: true };
    }
    
    const { activeUserType } = debugAuth();
    
    if (!activeUserType) {
        console.log('No active user found. Redirecting to login...');
        window.location.href = '/login';
        return;
    }
    
    if (activeUserType === 'placement') {
        const result = await testPlacementAuth();
        if (!result.success) {
            console.log('Placement auth failed. Clearing tokens and redirecting...');
            localStorage.removeItem('placementToken');
            localStorage.removeItem('placementUser');
            window.location.href = '/login';
        }
        return result;
    }
};
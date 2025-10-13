// Emergency login fix script - Run this in browser console
console.log('🔧 Starting login fix...');

// Clear all authentication data
const keysToRemove = [
    'candidateToken', 'candidateUser',
    'employerToken', 'employerUser', 
    'adminToken', 'adminUser',
    'placementToken', 'placementUser'
];

keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared ${key}`);
});

// Clear session storage
sessionStorage.clear();
console.log('✅ Cleared session storage');

// Check current environment
const currentUrl = window.location.origin;
console.log('🌐 Current URL:', currentUrl);

// Test API connectivity
async function testConnection() {
    const apiUrls = [
        'https://taleglobal.cloud/health',
        'http://localhost:5000/health'
    ];
    
    for (const url of apiUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`✅ API connection successful: ${url}`);
                return url.replace('/health', '');
            }
        } catch (error) {
            console.log(`❌ API connection failed: ${url}`);
        }
    }
    return null;
}

// Run the test
testConnection().then(workingUrl => {
    if (workingUrl) {
        console.log('🎉 Found working API:', workingUrl);
        console.log('💡 You can now try logging in again');
    } else {
        console.log('⚠️ No working API found. Check your backend server.');
    }
    
    // Force reload after 2 seconds
    setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
    }, 2000);
});

console.log('🔧 Login fix completed. Page will reload in 2 seconds...');
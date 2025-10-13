// Emergency login fix utility
export const fixLoginIssues = () => {
  console.log('Fixing login issues...');
  
  // Clear all authentication data
  const keysToRemove = [
    'candidateToken', 'candidateUser',
    'employerToken', 'employerUser', 
    'adminToken', 'adminUser',
    'placementToken', 'placementUser'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear session storage as well
  sessionStorage.clear();
  
  console.log('Authentication data cleared');
  
  // Force reload to reset application state
  window.location.reload();
};

// Check and fix WebSocket connection issues
export const checkWebSocketConnection = () => {
  const wsUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  console.log('WebSocket URL:', wsUrl);
  
  // Test connection
  try {
    const testSocket = new WebSocket(wsUrl.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket');
    
    testSocket.onopen = () => {
      console.log('WebSocket test connection successful');
      testSocket.close();
    };
    
    testSocket.onerror = (error) => {
      console.error('WebSocket test connection failed:', error);
      console.log('Try using polling transport instead');
    };
    
  } catch (error) {
    console.error('WebSocket test failed:', error);
  }
};

// Test API connectivity
export const testApiConnection = async () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  console.log('API URL:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
    if (response.ok) {
      console.log('API connection successful');
      return true;
    } else {
      console.error('API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
};
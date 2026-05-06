// Authentication debugging utility
export const authDebug = {
  // Check current authentication status
  checkAuthStatus: () => {
    console.log('🔍 Authentication Status Check:');
    console.log('  Token exists:', !!localStorage.getItem('authToken'));
    console.log('  Refresh Token exists:', !!localStorage.getItem('refreshToken'));
    console.log('  User data exists:', !!localStorage.getItem('authUser'));
    
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode JWT token (without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('  Token payload:', payload);
        console.log('  Token expires at:', new Date(payload.exp * 1000).toLocaleString());
        console.log('  Token expired:', Date.now() > payload.exp * 1000);
      } catch (error) {
        console.error('  Error decoding token:', error);
      }
    }
    
    return {
      hasToken: !!token,
      hasRefreshToken: !!localStorage.getItem('refreshToken'),
      hasUserData: !!localStorage.getItem('authUser')
    };
  },

  // Clear all authentication data
  clearAuth: () => {
    console.log('🗑️ Clearing authentication data...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    console.log('✅ Authentication data cleared');
  },

  // Test API authentication
  testApiAuth: async () => {
    console.log('🧪 Testing API authentication...');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('  Response status:', response.status);
      console.log('  Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API authentication successful:', data);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ API authentication failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ API test error:', error);
      return false;
    }
  },

  // Get current user info
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('👤 Current user:', user);
        return user;
      }
    } catch (error) {
      console.error('❌ Error getting current user:', error);
    }
    return null;
  }
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.authDebug = authDebug;
  console.log('🔧 Auth debug utilities loaded! Use window.authDebug.checkAuthStatus() to check authentication');
}

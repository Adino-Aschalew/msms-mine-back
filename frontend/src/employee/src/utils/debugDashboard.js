// Debug utility for dashboard issues
import EnterpriseSavingsAPI from '../../../shared/services/enterpriseSavingsAPI';

export const debugDashboard = {
  // Debug authentication and data loading
  debugAuthAndData: async () => {
    console.log('🔍 Debugging Authentication and Data Loading...');
    
    // Check authentication
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token length:', token?.length || 0);
    
    if (token) {
      try {
        // Try to decode token
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Token payload:', payload);
        console.log('📅 Token expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('⏰ Token expired:', Date.now() > payload.exp * 1000);
      } catch (error) {
        console.error('❌ Error decoding token:', error);
      }
    }
    
    // Check user data
    const userData = localStorage.getItem('authUser');
    console.log('👤 User data exists:', !!userData);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('👤 User info:', user);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
    
    // Test API call
    try {
      console.log('🌐 Testing API call...');
      const response = await EnterpriseSavingsAPI.getSavingsDashboard();
      console.log('✅ API call successful');
      console.log('📊 Response structure:', Object.keys(response || {}));
      console.log('📊 Full response:', response);
      
      // Check specific data structures
      console.log('🏦 Account:', response?.account);
      console.log('👤 Employee:', response?.employee);
      console.log('💡 Insights:', response?.insights);
      console.log('💰 Financial Health:', response?.financialHealth);
      console.log('🔒 Restrictions:', response?.restrictions);
      console.log('✅ Has Account:', response?.hasAccount);
      
      // Check for missing data
      if (!response?.account) console.warn('⚠️ Missing account data');
      if (!response?.employee) console.warn('⚠️ Missing employee data');
      if (!response?.insights) console.warn('⚠️ Missing insights data');
      
    } catch (error) {
      console.error('❌ API call failed:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error status:', error.status);
    }
  },
  
  // Test notification service
  debugNotifications: async () => {
    console.log('📢 Debugging Notification Service...');
    
    try {
      // Test basic notification
      await notificationService.notifySavingActivated();
      console.log('✅ Basic notification works');
      
      // Test savings request notification
      await notificationService.notifySavingsRequestSubmitted({
        employeeName: 'Test User',
        department: 'Test Dept',
        oldRate: 10,
        newRate: 15,
        reason: 'Test'
      });
      console.log('✅ Savings request notification works');
      
    } catch (error) {
      console.error('❌ Notification service error:', error);
    }
  },
  
  // Test currency formatting
  debugCurrency: () => {
    console.log('💰 Debugging Currency Formatting...');
    
    const testValues = [0, 500, 1500, 7500, 50000];
    testValues.forEach(value => {
      try {
        const formatted = EnterpriseSavingsAPI.formatCurrency(value);
        const compact = EnterpriseSavingsAPI.formatCompactCurrency(value);
        console.log(`  ${value} → ${formatted} (${compact})`);
      } catch (error) {
        console.error(`❌ Error formatting ${value}:`, error);
      }
    });
  },
  
  // Run all debug tests
  runAllDebugTests: async () => {
    console.log('🚀 Running All Debug Tests...');
    await debugDashboard.debugAuthAndData();
    await debugDashboard.debugNotifications();
    debugDashboard.debugCurrency();
    console.log('✅ All debug tests completed');
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.debugDashboard = debugDashboard;
  console.log('🔧 Dashboard debug utilities loaded! Use window.debugDashboard.runAllDebugTests() to debug all issues');
}

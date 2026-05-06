// Test utility for the complete savings request workflow
import EnterpriseSavingsAPI from '../../../shared/services/enterpriseSavingsAPI';
import { notificationService } from '../../../shared/services/notificationService';

export const testSavingsWorkflow = {
  // Test the complete workflow
  testCompleteWorkflow: async () => {
    console.log('🧪 Testing Complete Savings Request Workflow...');
    
    try {
      // Test 1: Check if user is authenticated
      const token = localStorage.getItem('authToken');
      console.log('  Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No authentication token found');
        return;
      }
      
      // Test 2: Load dashboard data
      console.log('📊 Loading dashboard data...');
      const dashboardData = await EnterpriseSavingsAPI.getSavingsDashboard();
      console.log('  Dashboard data loaded:', !!dashboardData);
      console.log('  Account data:', dashboardData?.account);
      console.log('  Employee data:', dashboardData?.employee);
      
      // Test 3: Test notification service
      console.log('📢 Testing notification service...');
      
      // Test notification templates
      const testRequestData = {
        employeeName: 'Test Employee',
        department: 'Test Department',
        oldRate: 10,
        newRate: 15,
        reason: 'Test reason'
      };
      
      console.log('  Testing savings request notification...');
      await notificationService.notifySavingsRequestSubmitted(testRequestData);
      console.log('  ✅ Savings request notification sent');
      
      console.log('  Testing savings approval notification...');
      await notificationService.notifySavingsRequestApproved({
        newRate: 15,
        comments: 'Test approval'
      });
      console.log('  ✅ Savings approval notification sent');
      
      console.log('  Testing savings rejection notification...');
      await notificationService.notifySavingsRequestRejected({
        comments: 'Test rejection'
      });
      console.log('  ✅ Savings rejection notification sent');
      
      console.log('  Testing savings activation notification...');
      await notificationService.notifySavingsAccountActivated({
        name: 'Test Employee',
        department: 'Test Department',
        rate: 15,
        projectedAnnualSavings: 7500
      });
      console.log('  ✅ Savings activation notification sent');
      
      console.log('✅ Complete workflow test passed!');
      
    } catch (error) {
      console.error('❌ Workflow test failed:', error);
    }
  },
  
  // Test currency formatting
  testCurrencyFormatting: () => {
    console.log('💰 Testing currency formatting...');
    
    const testAmounts = [0, 500, 1500, 7500, 50000, 150000];
    
    testAmounts.forEach(amount => {
      const formatted = EnterpriseSavingsAPI.formatCurrency(amount);
      const compact = EnterpriseSavingsAPI.formatCompactCurrency(amount);
      console.log(`  ${amount} → ${formatted} (${compact})`);
    });
    
    console.log('✅ Currency formatting test completed');
  },
  
  // Test event system
  testEventSystem: () => {
    console.log('🔄 Testing event system...');
    
    // Create a test event listener
    const testListener = (event) => {
      console.log('  📨 Event received:', event.detail);
    };
    
    // Add listener
    window.addEventListener('savingsUpdated', testListener);
    
    // Trigger test event
    window.dispatchEvent(new CustomEvent('savingsUpdated', {
      detail: { timestamp: Date.now(), test: true }
    }));
    
    // Remove listener
    setTimeout(() => {
      window.removeEventListener('savingsUpdated', testListener);
      console.log('✅ Event system test completed');
    }, 100);
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testSavingsWorkflow = testSavingsWorkflow;
  console.log('🧪 Savings workflow test utilities loaded! Use window.testSavingsWorkflow.testCompleteWorkflow() to test the complete system');
}

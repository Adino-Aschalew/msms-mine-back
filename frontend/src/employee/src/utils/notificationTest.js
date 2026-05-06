// Test utility for notification system
// Call these functions from browser console to test notifications

import { notificationService } from '../../shared/services/notificationService';

export const testNotifications = {
  // Test all notification types
  testAllNotifications: async () => {
    console.log('🧪 Testing all notification types...');
    
    try {
      await notificationService.notifyProfileUpdate(['Name', 'Phone']);
      console.log('✅ Profile update notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifyPasswordChange();
      console.log('✅ Password change notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifyLoanApplication({ type: 'Personal', amount: 5000 });
      console.log('✅ Loan application notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifySavingActivated();
      console.log('✅ Savings activation notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifySalaryUpdated({ amount: 75000 });
      console.log('✅ Salary update notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifyPayrollDeduction({ amount: 1500 });
      console.log('✅ Payroll deduction notification sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await notificationService.notifyExportCompleted({ format: 'CSV', filename: 'test-export.csv' });
      console.log('✅ Export completion notification sent');
      
      console.log('🎉 All notification tests completed successfully!');
    } catch (error) {
      console.error('❌ Notification test failed:', error);
    }
  },

  // Test individual notification types
  testProfileUpdate: async () => {
    await notificationService.notifyProfileUpdate(['Name', 'Email', 'Phone']);
    console.log('✅ Profile update notification sent');
  },

  testPasswordChange: async () => {
    await notificationService.notifyPasswordChange();
    console.log('✅ Password change notification sent');
  },

  testLoanApplication: async () => {
    await notificationService.notifyLoanApplication({ type: 'Emergency', amount: 10000 });
    console.log('✅ Loan application notification sent');
  },

  testSavingActivated: async () => {
    await notificationService.notifySavingActivated();
    console.log('✅ Savings activation notification sent');
  },

  testSalaryUpdated: async () => {
    await notificationService.notifySalaryUpdated({ amount: 80000 });
    console.log('✅ Salary update notification sent');
  },

  testPayrollDeduction: async () => {
    await notificationService.notifyPayrollDeduction({ amount: 2000 });
    console.log('✅ Payroll deduction notification sent');
  },

  testExportCompleted: async () => {
    await notificationService.notifyExportCompleted({ format: 'PDF', filename: 'report.pdf' });
    console.log('✅ Export completion notification sent');
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testNotifications = testNotifications;
  console.log('🧪 Notification test utilities loaded! Use window.testNotifications.testAllNotifications() to test all notifications');
}

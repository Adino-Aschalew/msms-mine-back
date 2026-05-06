// Test utility for currency formatting
import { EnterpriseSavingsAPI } from '../../../shared/services/enterpriseSavingsAPI';

export const testCurrencyFormatting = {
  // Test currency formatting with different amounts
  testCurrencyFormats: () => {
    console.log('🧪 Testing currency formatting...');
    
    const testAmounts = [
      0,
      100,
      999.99,
      1000,
      1500.50,
      50000,
      100000,
      1500000,
      2500000
    ];
    
    testAmounts.forEach(amount => {
      const formatted = EnterpriseSavingsAPI.formatCurrency(amount);
      const compact = EnterpriseSavingsAPI.formatCompactCurrency(amount);
      console.log(`Amount: ${amount} -> ${formatted} | ${compact}`);
    });
    
    console.log('✅ Currency formatting tests completed!');
  },

  // Test specific amounts that were showing ETBNaN
  testProblemAmounts: () => {
    console.log('🔧 Testing problem amounts...');
    
    const problemAmounts = [
      50000,  // Common salary amount
      75000,  // Another common salary
      100000, // Round number
      123456.78 // Decimal amount
    ];
    
    problemAmounts.forEach(amount => {
      const formatted = EnterpriseSavingsAPI.formatCurrency(amount);
      const compact = EnterpriseSavingsAPI.formatCompactCurrency(amount);
      console.log(`Problem Amount: ${amount} -> ${formatted} | ${compact}`);
    });
    
    console.log('✅ Problem amounts tested!');
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testCurrency = testCurrencyFormatting;
  console.log('🧪 Currency test utilities loaded! Use window.testCurrency.testCurrencyFormats() to test formatting');
}

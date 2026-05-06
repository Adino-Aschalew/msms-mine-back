// Test utility to verify NaN handling in currency formatting
import { EnterpriseSavingsAPI } from '../../../shared/services/enterpriseSavingsAPI';

export const testNanHandling = {
  // Test various problematic values
  testProblematicValues: () => {
    console.log('🧪 Testing NaN and null handling...');
    
    const testValues = [
      null,
      undefined,
      NaN,
      'NaN',
      '',
      0,
      1000,
      50000
    ];
    
    testValues.forEach(value => {
      console.log(`Testing value: ${value} (${typeof value})`);
      console.log(`  formatCurrency: ${EnterpriseSavingsAPI.formatCurrency(value)}`);
      console.log(`  formatCompactCurrency: ${EnterpriseSavingsAPI.formatCompactCurrency(value)}`);
      console.log('');
    });
    
    console.log('✅ NaN handling tests completed!');
  },

  // Test the specific scenarios that were causing issues
  testRealScenarios: () => {
    console.log('🔧 Testing real-world scenarios...');
    
    // Simulate the data structure that was causing issues
    const mockData = {
      insights: {
        projectedAnnualSavings: NaN
      },
      simulationData: {
        current: {
          annualSavings: null
        },
        proposed: {
          annualSavings: undefined
        }
      }
    };
    
    console.log('Mock data:', mockData);
    
    // Test the actual display scenarios
    console.log('Projected Annual Savings:', EnterpriseSavingsAPI.formatCompactCurrency(mockData.insights.projectedAnnualSavings));
    console.log('Current Year:', EnterpriseSavingsAPI.formatCurrency(mockData.simulationData.current.annualSavings));
    console.log('With New Rate:', EnterpriseSavingsAPI.formatCurrency(mockData.simulationData.proposed.annualSavings));
    
    console.log('✅ Real scenario tests completed!');
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testNan = testNanHandling;
  console.log('🧪 NaN test utilities loaded! Use window.testNan.testProblematicValues() to test NaN handling');
}

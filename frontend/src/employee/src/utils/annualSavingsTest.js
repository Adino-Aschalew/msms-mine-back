// Test utility for annual savings calculations
import { EnterpriseSavingsAPI } from '../../../shared/services/enterpriseSavingsAPI';

export const testAnnualSavingsCalculations = {
  // Test the calculation logic with different scenarios
  testCalculations: () => {
    console.log('🧪 Testing annual savings calculations...');
    
    const scenarios = [
      { salary: 50000, rate: 15, expected: 7500 },
      { salary: 75000, rate: 20, expected: 15000 },
      { salary: 100000, rate: 10, expected: 10000 },
      { salary: 120000, rate: 25, expected: 30000 },
      { salary: 0, rate: 15, expected: 0 },
      { salary: 50000, rate: 0, expected: 0 }
    ];
    
    scenarios.forEach((scenario, index) => {
      const calculated = (scenario.salary * scenario.rate) / 100;
      const formatted = EnterpriseSavingsAPI.formatCurrency(calculated);
      const compact = EnterpriseSavingsAPI.formatCompactCurrency(calculated);
      
      console.log(`Scenario ${index + 1}:`);
      console.log(`  Salary: ${scenario.salary}`);
      console.log(`  Rate: ${scenario.rate}%`);
      console.log(`  Expected: ${scenario.expected}`);
      console.log(`  Calculated: ${calculated}`);
      console.log(`  Formatted: ${formatted}`);
      console.log(`  Compact: ${compact}`);
      console.log(`  ✅ ${calculated === scenario.expected ? 'PASS' : 'FAIL'}`);
      console.log('');
    });
  },

  // Test with real-world Ethiopian salary ranges
  testEthiopianSalaries: () => {
    console.log('🇪🇹 Testing with Ethiopian salary ranges...');
    
    const ethiopianSalaries = [
      { position: 'Entry Level', salary: 15000, rate: 15 },
      { position: 'Mid Level', salary: 35000, rate: 20 },
      { position: 'Senior Level', salary: 60000, rate: 25 },
      { position: 'Manager', salary: 85000, rate: 30 },
      { position: 'Director', salary: 120000, rate: 35 }
    ];
    
    ethiopianSalaries.forEach(job => {
      const annualSavings = (job.salary * job.rate) / 100;
      const monthlySavings = annualSavings / 12;
      
      console.log(`${job.position}:`);
      console.log(`  Monthly Salary: ${EnterpriseSavingsAPI.formatCurrency(job.salary)}`);
      console.log(`  Savings Rate: ${job.rate}%`);
      console.log(`  Annual Savings: ${EnterpriseSavingsAPI.formatCurrency(annualSavings)}`);
      console.log(`  Monthly Savings: ${EnterpriseSavingsAPI.formatCurrency(monthlySavings)}`);
      console.log('');
    });
  },

  // Test edge cases and invalid data
  testEdgeCases: () => {
    console.log('🔧 Testing edge cases and invalid data...');
    
    const edgeCases = [
      { salary: null, rate: 15 },
      { salary: undefined, rate: 15 },
      { salary: 50000, rate: null },
      { salary: 50000, rate: undefined },
      { salary: NaN, rate: 15 },
      { salary: 50000, rate: NaN },
      { salary: '50000', rate: 15 },
      { salary: 50000, rate: '15' }
    ];
    
    edgeCases.forEach((testCase, index) => {
      const salary = Number(testCase.salary);
      const rate = Number(testCase.rate);
      const calculated = (!isNaN(salary) && !isNaN(rate) && salary > 0 && rate > 0) 
        ? (salary * rate) / 100 
        : 0;
      
      console.log(`Edge Case ${index + 1}:`);
      console.log(`  Input: salary=${testCase.salary}, rate=${testCase.rate}`);
      console.log(`  Converted: salary=${salary}, rate=${rate}`);
      console.log(`  Calculated: ${calculated}`);
      console.log(`  Formatted: ${EnterpriseSavingsAPI.formatCurrency(calculated)}`);
      console.log('');
    });
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testAnnualSavings = testAnnualSavingsCalculations;
  console.log('🧪 Annual savings test utilities loaded! Use window.testAnnualSavings.testCalculations() to test calculations');
}

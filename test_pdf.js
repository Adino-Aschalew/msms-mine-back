const PdfUtils = require('./src/utils/pdf');

(async () => {
  try {
      const payslipData = {
        companyName: 'MSMS Microfinance',
        employeeName: `Test User`,
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Dev',
        periodDate: 'May 2026',
        netPay: (1000).toLocaleString(),
        items: [
          { description: 'Gross Salary', amount: (1500).toLocaleString() },
          { description: 'Savings Contribution (-)', amount: (500).toLocaleString() },
          { description: 'Loan Repayment (-)', amount: (0).toLocaleString() },
          { description: 'Other Deductions (-)', amount: (0).toLocaleString() }
        ]
      };

      const buffer = await PdfUtils.generateIndividualPayslip(payslipData);
      console.log('Success, generated buffer of length', buffer.length);
  } catch (err) {
      console.error(err);
  }
})();

const PdfUtils = require('../../utils/pdf');
const { query } = require('../../config/database');
const moment = require('moment');

class DocumentController {
  static async getPayslipPdf(req, res) {
    try {
      const { detailId } = req.params;
      const userId = req.userId;

      // 1. Fetch payroll details
      const [details] = await query(`
        SELECT pd.*, pb.batch_name, pb.payroll_date, ep.first_name, ep.last_name, ep.department, ep.position
        FROM payroll_details pd
        JOIN payroll_batches pb ON pd.payroll_batch_id = pb.id
        JOIN employee_profiles ep ON pd.user_id = ep.user_id
        WHERE pd.id = ? AND pd.user_id = ?
      `, [detailId, userId]);

      if (!details) {
        return res.status(404).json({ success: false, message: 'Payslip not found' });
      }

      // 2. Prepare data for PDF
      const payslipData = {
        companyName: 'MSMS Microfinance',
        employeeName: `${details.first_name} ${details.last_name}`,
        employeeId: details.employee_id,
        department: details.department,
        position: details.position,
        periodDate: moment(details.payroll_date).format('MMMM YYYY'),
        netPay: parseFloat(details.net_salary).toLocaleString(),
        items: [
          { description: 'Gross Salary', amount: parseFloat(details.gross_salary).toLocaleString() },
          { description: 'Savings Contribution (-)', amount: parseFloat(details.savings_deduction).toLocaleString() },
          { description: 'Loan Repayment (-)', amount: parseFloat(details.loan_repayment_deduction || 0).toLocaleString() },
          { description: 'Other Deductions (-)', amount: parseFloat(details.other_deductions || 0).toLocaleString() }
        ]
      };

      // 3. Generate PDF
      const pdfBuffer = await PdfUtils.generateIndividualPayslip(payslipData);

      // 4. Send response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip-${details.employee_id}-${moment(details.payroll_date).format('YYYY-MM')}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Error generating payslip PDF:', error);
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  }

  static async getLoanAgreementPdf(req, res) {
    try {
      const { loanId } = req.params;
      const userId = req.userId;

      // 1. Fetch loan details
      const [loan] = await query(`
        SELECT l.*, ep.first_name, ep.last_name, ep.department, ep.employee_id, la.purpose
        FROM loans l
        JOIN employee_profiles ep ON l.user_id = ep.user_id
        LEFT JOIN loan_applications la ON l.application_id = la.id
        WHERE l.id = ? AND l.user_id = ?
      `, [loanId, userId]);

      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      // 2. Mock or fetch a schedule
      // For simplicity, we'll use the basic details to show terms
      const agreementData = {
        companyName: 'MSMS Microfinance',
        agreementNumber: `LA-${loan.id}-${loan.employee_id}`,
        date: moment(loan.created_at).format('DD MMM YYYY'),
        borrowerName: `${loan.first_name} ${loan.last_name}`,
        employeeId: loan.employee_id,
        loanAmount: parseFloat(loan.loan_amount).toLocaleString(),
        interestRate: loan.interest_rate,
        duration: loan.loan_term_months,
        monthlyPayment: parseFloat(loan.monthly_payment).toLocaleString(),
        purpose: loan.purpose || 'General Purpose',
        schedule: [
          // Simplified row just to show it works
          { month: '1', amount: loan.monthly_payment, principal: '-', interest: '-', balance: '-' }
        ]
      };

      // 3. Generate PDF
      const pdfBuffer = await PdfUtils.generateLoanAgreement(agreementData);

      // 4. Send response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=loan-agreement-${loan.id}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Error generating loan agreement PDF:', error);
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  }
}

module.exports = DocumentController;

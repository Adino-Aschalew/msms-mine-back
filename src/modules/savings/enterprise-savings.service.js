const { query, transaction } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');

class EnterpriseSavingsService {
  
  static async getEmployeeSavingsDashboard(userId) {
    try {
      
      const accountQuery = `
        SELECT 
          sa.*,
          sv.version_number,
          sv.effective_date as version_effective_date,
          sv.status as version_status,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          u.employee_id,
          u.email
        FROM savings_accounts sa
        LEFT JOIN savings_versions sv ON sa.current_version_id = sv.id
        LEFT JOIN users u ON sa.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE sa.user_id = ?
      `;
      
      const account = await query(accountQuery, [userId]);
      
      if (!account || account.length === 0) {
        return {
          hasAccount: false,
          message: 'No savings account found'
        };
      }

      const accountData = account[0];
      
      
      const ytdQuery = `
        SELECT 
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as ytd_contributions,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as ytd_interest,
          COUNT(CASE WHEN transaction_type = 'CONTRIBUTION' THEN 1 END) as contribution_count
        FROM savings_transactions 
        WHERE user_id = ? 
        AND transaction_date >= DATE_FORMAT(NOW(), '%Y-01-01')
      `;
      
      const ytdData = await query(ytdQuery, [userId]);
      
      
      const recentQuery = `
        SELECT 
          transaction_date,
          amount,
          balance_after,
          description
        FROM savings_transactions 
        WHERE user_id = ? 
        AND transaction_type = 'CONTRIBUTION'
        ORDER BY transaction_date DESC 
        LIMIT 3
      `;
      
      const recentContributions = await query(recentQuery, [userId]);
      
      
      let loanDeductions = 0;
      try {
        const loanQuery = `
          SELECT 
            COALESCE(SUM(monthly_payment), 0) as total_loan_deductions
          FROM loans 
          WHERE user_id = ? 
          AND status IN ('ACTIVE', 'APPROVED')
        `;
        
        const loanData = await query(loanQuery, [userId]);
        loanDeductions = parseFloat(loanData[0]?.total_loan_deductions || 0);
      } catch (error) {
        console.log('Loans table not found, using 0 for loan deductions');
        loanDeductions = 0;
      }
      
      
      let grossSalary = 0;
      let netSalary = 0;
      try {
        const salaryQuery = `
          SELECT 
            gross_salary,
            net_salary
          FROM payroll_history 
          WHERE user_id = ? 
          ORDER BY payroll_date DESC 
          LIMIT 1
        `;
        
        const salaryData = await query(salaryQuery, [userId]);
        if (salaryData && salaryData.length > 0) {
          grossSalary = parseFloat(salaryData[0]?.gross_salary || 0);
          netSalary = parseFloat(salaryData[0]?.net_salary || 0);
        }
      } catch (error) {
        console.log('Payroll history table not found or error, using fallback:', error.message);
      }
      
      
      if (grossSalary === 0) {
        try {
          const profileSalaryQuery = `
            SELECT salary as gross_salary
            FROM employee_profiles 
            WHERE user_id = ?
          `;
          
          const profileData = await query(profileSalaryQuery, [userId]);
          if (profileData && profileData.length > 0) {
            grossSalary = parseFloat(profileData[0]?.gross_salary || 0);
          }
        } catch (profileError) {
          console.log('Employee profile salary lookup failed:', profileError.message);
        }
      }
      
      
      if (grossSalary === 0) {
        grossSalary = parseFloat(accountData.current_balance * 4);
        netSalary = grossSalary * 0.85; 
      }
      
      
      const currentDeduction = parseFloat(accountData.savings_type === 'PERCENTAGE' 
        ? (grossSalary * accountData.saving_percentage / 100)
        : accountData.fixed_amount || 0
      );
      const totalDeductions = currentDeduction + loanDeductions;
      const deductionRatio = grossSalary > 0 ? (totalDeductions / grossSalary * 100) : 0;
      
      
      let healthStatus = 'SAFE';
      if (deductionRatio > 50) healthStatus = 'RISKY';
      else if (deductionRatio >= 30) healthStatus = 'MODERATE';
      
      
      const pendingQuery = `
        SELECT COUNT(*) as pending_count
        FROM savings_requests 
        WHERE user_id = ? 
        AND status IN ('PENDING', 'UNDER_REVIEW')
      `;
      
      const pendingData = await query(pendingQuery, [userId]);
      
      return {
        hasAccount: true,
        account: {
          id: accountData.id,
          employeeId: accountData.employee_id,
          savingsType: accountData.savings_type,
          currentValue: accountData.savings_type === 'PERCENTAGE' 
            ? accountData.saving_percentage 
            : accountData.fixed_amount,
          currentBalance: parseFloat(accountData.current_balance),
          accountStatus: accountData.account_status,
          isPaused: accountData.is_paused,
          effectiveDate: accountData.version_effective_date,
          versionNumber: accountData.version_number
        },
        insights: {
          ytdContributions: parseFloat(ytdData[0]?.ytd_contributions || 0),
          ytdInterest: parseFloat(ytdData[0]?.ytd_interest || 0),
          contributionCount: parseInt(ytdData[0]?.contribution_count || 0),
          recentContributions: recentContributions.map(c => ({
            date: c.transaction_date,
            amount: parseFloat(c.amount),
            balance: parseFloat(c.balance_after),
            description: c.description
          })),
          projectedAnnualSavings: currentDeduction * 12
        },
        financialHealth: {
          grossSalary,
          currentDeduction,
          loanDeductions,
          totalDeductions,
          deductionRatio: Math.round(deductionRatio * 100) / 100,
          status: healthStatus,
          netSalaryAfterDeductions: grossSalary - totalDeductions
        },
        employee: {
          firstName: accountData.first_name,
          lastName: accountData.last_name,
          department: accountData.department,
          jobGrade: accountData.job_grade,
          email: accountData.email
        },
        restrictions: {
          hasPendingRequest: parseInt(pendingData[0]?.pending_count || 0) > 0,
          canModify: !accountData.is_paused && accountData.account_status === 'ACTIVE'
        }
      };
      
    } catch (error) {
      console.error('Error in getEmployeeSavingsDashboard:', error);
      throw error;
    }
  }

  
  static async simulateSavingsChange(userId, newValue, savingsType, effectiveDate) {
    try {
      
      const currentData = await this.getEmployeeSavingsDashboard(userId);
      
      if (!currentData.hasAccount) {
        throw new Error('No active savings account found');
      }
      
      const grossSalary = currentData.financialHealth.grossSalary;
      const loanDeductions = currentData.financialHealth.loanDeductions;
      
      
      const newDeduction = savingsType === 'PERCENTAGE' 
        ? (grossSalary * newValue / 100)
        : newValue;
      
      const totalDeductions = newDeduction + loanDeductions;
      const newDeductionRatio = grossSalary > 0 ? (totalDeductions / grossSalary * 100) : 0;
      const newNetSalary = grossSalary - totalDeductions;
      
      
      const constraints = await this.getSavingsConstraints();
      
      
      const validation = {
        isValid: true,
        violations: []
      };
      
      if (newDeductionRatio > constraints.maxTotalDeductionRatio) {
        validation.isValid = false;
        validation.violations.push({
          type: 'MAX_DEDUCTION_RATIO',
          message: `Total deduction ratio (${newDeductionRatio.toFixed(1)}%) exceeds maximum allowed (${constraints.maxTotalDeductionRatio}%)`,
          severity: 'ERROR'
        });
      }
      
      if (newNetSalary < constraints.minNetSalaryThreshold) {
        validation.isValid = false;
        validation.violations.push({
          type: 'MIN_NET_SALARY',
          message: `Net salary after deductions (${newNetSalary.toFixed(2)} ETB) is below minimum threshold (${constraints.minNetSalaryThreshold} ETB)`,
          severity: 'ERROR'
        });
      }
      
      if (savingsType === 'PERCENTAGE' && (newValue < constraints.minSavingsPercentage || newValue > constraints.maxSavingsPercentage)) {
        validation.isValid = false;
        validation.violations.push({
          type: 'PERCENTAGE_RANGE',
          message: `Savings percentage must be between ${constraints.minSavingsPercentage}% and ${constraints.maxSavingsPercentage}%`,
          severity: 'ERROR'
        });
      }
      
      
      if (newDeductionRatio >= 30 && newDeductionRatio <= 50) {
        validation.violations.push({
          type: 'HIGH_DEDUCTION_WARNING',
          message: `High deduction ratio (${newDeductionRatio.toFixed(1)}%) - consider reducing deductions`,
          severity: 'WARNING'
        });
      }
      
      return {
        current: {
          value: currentData.account.currentValue,
          type: currentData.account.savingsType,
          deduction: currentData.financialHealth.currentDeduction,
          netSalary: grossSalary - currentData.financialHealth.totalDeductions,
          deductionRatio: currentData.financialHealth.deductionRatio
        },
        proposed: {
          value: newValue,
          type: savingsType,
          deduction: newDeduction,
          netSalary: newNetSalary,
          deductionRatio: Math.round(newDeductionRatio * 100) / 100
        },
        impact: {
          monthlyDifference: newDeduction - currentData.financialHealth.currentDeduction,
          annualDifference: (newDeduction - currentData.financialHealth.currentDeduction) * 12,
          projectedAnnualSavings: newDeduction * 12
        },
        validation,
        effectiveDate,
        canSubmit: validation.isValid && !currentData.restrictions.hasPendingRequest
      };
      
    } catch (error) {
      console.error('Error in simulateSavingsChange:', error);
      throw error;
    }
  }

  
  static async submitSavingsRequest(userId, requestData) {
    return await transaction(async (connection) => {
      const {
        newValue,
        savingsType,
        effectiveDate,
        reason,
        simulationResult,
        urgencyLevel = 'NORMAL'
      } = requestData;
      
      
      const currentData = await this.getEmployeeSavingsDashboard(userId);
      
      if (!currentData.hasAccount) {
        throw new Error('No active savings account found');
      }
      
      if (currentData.restrictions.hasPendingRequest) {
        throw new Error('You already have a pending request. Please wait for it to be processed.');
      }
      
      
      const insertRequestQuery = `
        INSERT INTO savings_requests (
          employee_id, user_id, request_type, old_value, new_value, 
          savings_type, effective_date, requested_effective_date,
          status, workflow_stage, salary_snapshot, loan_deductions_snapshot,
          current_deduction_ratio, projected_deduction_ratio,
          simulation_result, reason, urgency_level, submitted_by
        ) VALUES (?, ?, 'PERCENTAGE_CHANGE', ?, ?, ?, ?, ?, 'PENDING', 'SUBMITTED', ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [requestResult] = await connection.execute(insertRequestQuery, [
        currentData.account.employeeId,
        userId,
        currentData.account.currentValue,
        newValue,
        savingsType,
        effectiveDate,
        effectiveDate,
        currentData.financialHealth.grossSalary,
        currentData.financialHealth.loanDeductions,
        currentData.financialHealth.deductionRatio,
        simulationResult.proposed.deductionRatio,
        JSON.stringify(simulationResult),
        reason,
        urgencyLevel,
        userId
      ]);
      
      const requestId = requestResult.insertId;
      
      
      await connection.execute(
        'UPDATE savings_accounts SET last_request_date = CURDATE(), total_requests_count = total_requests_count + 1 WHERE user_id = ?',
        [userId]
      );
      
      
      await auditLog(
        userId,
        'REQUEST_CREATED',
        'savings_requests',
        requestId,
        null,
        {
          old_value: currentData.account.currentValue,
          new_value: newValue,
          savings_type: savingsType
        },
        null,
        null,
        connection
      );
      
      return {
        success: true,
        requestId,
        message: 'Savings change request submitted successfully',
        status: 'PENDING',
        nextSteps: 'Your request will be reviewed by the finance team'
      };
    });
  }

  
  static async getSavingsConstraints() {
    try {
      const configQuery = `
        SELECT config_key, config_value 
        FROM savings_configuration 
        WHERE is_active = TRUE 
        AND config_key IN (
          'min_savings_percentage', 
          'max_savings_percentage', 
          'max_total_deduction_ratio', 
          'min_net_salary_threshold'
        )
      `;
      
      const configs = await query(configQuery);
      
      const constraints = {
        minSavingsPercentage: 15,
        maxSavingsPercentage: 65,
        maxTotalDeductionRatio: 50,
        minNetSalaryThreshold: 2000
      };
      
      configs.forEach(config => {
        const value = JSON.parse(config.config_value);
        constraints[config.config_key] = value.value;
      });
      
      return constraints;
      
    } catch (error) {
      console.error('Error in getSavingsConstraints:', error);
      
      return {
        minSavingsPercentage: 15,
        maxSavingsPercentage: 65,
        maxTotalDeductionRatio: 50,
        minNetSalaryThreshold: 2000
      };
    }
  }

  
  static async getEmployeeSavingsHistory(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      
      const requestsQuery = `
        SELECT 
          sr.*,
          ep.first_name,
          ep.last_name,
          reviewer.first_name as reviewer_first_name,
          reviewer.last_name as reviewer_last_name
        FROM savings_requests sr
        LEFT JOIN users u ON sr.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN users reviewer ON sr.final_approved_by = reviewer.id
        WHERE sr.user_id = ?
        ORDER BY sr.submitted_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const requests = await query(requestsQuery, [userId, limit, offset]);
      
      
      const versionsQuery = `
        SELECT 
          sv.*,
          ep.first_name,
          ep.last_name
        FROM savings_versions sv
        LEFT JOIN users u ON sv.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE sv.user_id = ?
        ORDER BY sv.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const versions = await query(versionsQuery, [userId, limit, offset]);
      
      return {
        requests: requests.map(r => ({
          id: r.id,
          type: r.request_type,
          oldValue: r.old_value,
          newValue: r.new_value,
          savingsType: r.savings_type,
          status: r.status,
          workflowStage: r.workflow_stage,
          effectiveDate: r.effective_date,
          submittedAt: r.submitted_at,
          reason: r.reason,
          urgencyLevel: r.urgency_level,
          simulationResult: r.simulation_result ? JSON.parse(r.simulation_result) : null,
          approvedBy: r.final_approved_by ? `${r.reviewer_first_name} ${r.reviewer_last_name}` : null,
          approvedAt: r.final_approved_at,
          comments: r.final_approval_comments
        })),
        versions: versions.map(v => ({
          id: v.id,
          versionNumber: v.version_number,
          savingsType: v.savings_type,
          savingsValue: v.savings_value,
          status: v.status,
          effectiveDate: v.effective_date,
          expiryDate: v.expiry_date,
          createdAt: v.created_at,
          createdBy: `${v.first_name} ${v.last_name}`,
          activatedAt: v.activated_at,
          replacedAt: v.replaced_at
        }))
      };
      
    } catch (error) {
      console.error('Error in getEmployeeSavingsHistory:', error);
      throw error;
    }
  }
}

module.exports = EnterpriseSavingsService;

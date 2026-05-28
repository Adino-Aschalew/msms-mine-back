# Savings Account Flow - Line by Line Walkthrough

> **Also see:** `src/modules/savings/enterprise-savings.service.js` for the employee dashboard (deduction ratio, health status, YTD stats). Payroll auto-contributions are in **`06_PAYROLL_AUTOMATIC_SAVINGS_FLOW.md`**.

## Overview
The savings account flow handles account creation, transaction processing (contributions, withdrawals, interest), monthly interest calculation, and penalty enforcement for missed savings. This walkthrough covers the complete savings management process.

---

## 1. Create Savings Account

### File: `src/controllers/savingsController.js` (Lines 6-51)

```javascript
exports.createSavingsAccount = async (req, res) => {
```
**Line 6:** Exports the createSavingsAccount function as an async handler.

```javascript
  try {
```
**Line 7:** Starts try-catch block for error handling.

```javascript
    const userId = req.user.id;
```
**Line 8:** Gets the authenticated user's ID from the request object (set by auth middleware).

```javascript
    const { savingPercentage } = req.body;
```
**Line 9:** Extracts savingPercentage from the request body.

```javascript
    if (!savingPercentage) {
```
**Line 10:** Validates that savingPercentage is provided.

```javascript
      return res.status(400).json({
```
**Line 11:** Returns 400 Bad Request if validation fails.

```javascript
        success: false,
```
**Line 12:** Sets success flag to false.

```javascript
        message: 'Saving percentage is required'
```
**Line 13:** Error message indicating required field.

```javascript
      });
```
**Line 14:** Closes JSON response.

```javascript
    }
```
**Line 15:** Closes validation if block.

```javascript
    const finalSavingPercentage = parseFloat(savingPercentage);
```
**Line 16:** Converts savingPercentage to a float number.

```javascript
    if (finalSavingPercentage < 15 || finalSavingPercentage > 65) {
```
**Line 17:** Validates that saving percentage is within the allowed range (15-65%). This is a business rule to ensure reasonable savings rates.

```javascript
      return res.status(400).json({
```
**Line 18:** Returns 400 Bad Request if out of range.

```javascript
        success: false,
```
**Line 19:** Sets success flag to false.

```javascript
        message: 'Saving percentage must be between 15% and 65%'
```
**Line 20:** Error message with allowed range.

```javascript
      });
```
**Line 21:** Closes JSON response.

```javascript
    }
```
**Line 22:** Closes validation if block.

```javascript
    const user = await User.findById(userId);
```
**Line 23:** Fetches the user from database to get employee_id.

```javascript
    if (!user) {
```
**Line 24:** Checks if user exists.

```javascript
      return res.status(404).json({
```
**Line 25:** Returns 404 Not Found if user doesn't exist.

```javascript
        success: false,
```
**Line 26:** Sets success flag to false.

```javascript
        message: 'User not found'
```
**Line 27:** Error message.

```javascript
      });
```
**Line 28:** Closes JSON response.

```javascript
    }
```
**Line 29:** Closes validation if block.

```javascript
    const accountId = await Savings.createSavingsAccount(userId, user.employee_id, finalSavingPercentage);
```
**Line 30:** Calls the Savings model to create the account, passing user ID, employee ID, and saving percentage.

```javascript
    await auditLog(
```
**Line 31:** Logs the account creation event for audit trail.

```javascript
      userId,
```
**Line 32:** User ID who created the account.

```javascript
      'SAVINGS_ACCOUNT_CREATE',
```
**Line 33:** Action type: SAVINGS_ACCOUNT_CREATE.

```javascript
      'savings_accounts',
```
**Line 34:** Table name: savings_accounts.

```javascript
      accountId,
```
**Line 35:** Record ID: the new account ID.

```javascript
      null,
```
**Line 36:** No old values (new account).

```javascript
      { saving_percentage: finalSavingPercentage },
```
**Line 37:** New values for audit trail.

```javascript
      req.ip,
```
**Line 38:** Client IP address.

```javascript
      req.get('User-Agent')
```
**Line 39:** User agent string.

```javascript
    );
```
**Line 40:** Closes auditLog call.

```javascript
    res.status(201).json({
```
**Line 41:** Returns 201 Created response.

```javascript
      success: true,
```
**Line 42:** Sets success flag to true.

```javascript
      message: 'Savings account created successfully',
```
**Line 43:** Success message.

```javascript
      data: { accountId }
```
**Line 44:** Returns the new account ID.

```javascript
    });
```
**Line 45:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 46:** Catches any errors.

```javascript
    console.error('Create savings account error:', error);
```
**Line 47:** Logs error for debugging.

```javascript
    res.status(500).json({
```
**Line 48:** Returns 500 Internal Server Error.

```javascript
      success: false,
```
**Line 49:** Sets success flag to false.

```javascript
      message: error.message || 'Internal server error'
```
**Line 50:** Returns specific error message or generic message.

```javascript
    });
```
**Line 51:** Closes JSON response.

```javascript
  }
```
**Line 52:** Closes catch block.

```javascript
};
```
**Line 53:** Closes createSavingsAccount function.

---

## 2. Savings Account Creation Model

### File: `src/models/Savings.js` (Lines 5-20)

```javascript
  static async createSavingsAccount(userId, employeeId, savingPercentage) {
```
**Line 5:** Defines static async method to create a savings account.

```javascript
    const checkQuery = `SELECT id FROM savings_accounts WHERE user_id = ?`;
```
**Line 6:** SQL query to check if user already has a savings account.

```javascript
    const existing = await query(checkQuery, [userId]);
```
**Line 7:** Executes the check query with user ID parameter.

```javascript
    if (existing.length > 0) {
```
**Line 8:** Checks if any existing account was found.

```javascript
      throw new Error('Savings account already exists for this user');
```
**Line 9:** Throws error if account already exists (business rule: one account per user).

```javascript
    }
```
**Line 10:** Closes validation if block.

```javascript
    const insertQuery = `
```
**Line 11:** Starts SQL INSERT query.

```javascript
      INSERT INTO savings_accounts (user_id, employee_id, saving_percentage, lock_period_end_date)
```
**Line 12:** Specifies columns to insert into.

```javascript
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 6 MONTH))
```
**Line 13:** Inserts values and sets lock_period_end_date to 6 months from now. This prevents withdrawals for the first 6 months.

```javascript
    `;
```
**Line 14:** Closes SQL string.

```javascript
    const result = await query(insertQuery, [userId, employeeId, savingPercentage]);
```
**Line 15:** Executes the INSERT query with parameters.

```javascript
    return result.insertId;
```
**Line 16:** Returns the auto-generated ID of the new account.

```javascript
  }
```
**Line 17:** Closes createSavingsAccount method.

```javascript
```
**Line 18:** Empty line for readability.

---

## 3. Add Savings Contribution

### File: `src/controllers/savingsController.js` (Lines 53-120)

```javascript
exports.addContribution = async (req, res) => {
```
**Line 53:** Exports the addContribution function.

```javascript
  try {
```
**Line 54:** Starts try-catch block.

```javascript
    const userId = req.user.id;
```
**Line 55:** Gets authenticated user ID.

```javascript
    const { amount, description } = req.body;
```
**Line 56:** Extracts amount and description from request body.

```javascript
    if (!amount || amount <= 0) {
```
**Line 57:** Validates that amount is provided and positive.

```javascript
      return res.status(400).json({
```
**Line 58:** Returns 400 if validation fails.

```javascript
        success: false,
```
**Line 59:** Sets success to false.

```javascript
        message: 'Valid contribution amount is required'
```
**Line 60:** Error message.

```javascript
      });
```
**Line 61:** Closes JSON response.

```javascript
    }
```
**Line 62:** Closes validation if block.

```javascript
    const account = await Savings.getSavingsAccount(userId);
```
**Line 63:** Fetches the user's savings account.

```javascript
    if (!account) {
```
**Line 64:** Checks if account exists.

```javascript
      return res.status(404).json({
```
**Line 65:** Returns 404 if not found.

```javascript
        success: false,
```
**Line 66:** Sets success to false.

```javascript
        message: 'Savings account not found'
```
**Line 67:** Error message.

```javascript
      });
```
**Line 68:** Closes JSON response.

```javascript
    }
```
**Line 69:** Closes validation if block.

```javascript
    if (account.account_status !== 'ACTIVE') {
```
**Line 70:** Checks if account is active.

```javascript
      return res.status(400).json({
```
**Line 71:** Returns 400 if account is not active.

```javascript
        success: false,
```
**Line 72:** Sets success to false.

```javascript
        message: 'Cannot add contribution to inactive account'
```
**Line 73:** Error message.

```javascript
      });
```
**Line 74:** Closes JSON response.

```javascript
    }
```
**Line 75:** Closes validation if block.

```javascript
    const result = await Savings.addSavingsTransaction(
```
**Line 76:** Calls the Savings model to add a contribution transaction.

```javascript
      account.id,
```
**Line 77:** Passes the savings account ID.

```javascript
      userId,
```
**Line 78:** Passes the user ID.

```javascript
      'CONTRIBUTION',
```
**Line 79:** Transaction type: CONTRIBUTION.

```javascript
      parseFloat(amount),
```
**Line 80:** Passes the amount as a float.

```javascript
      null,
```
**Line 81:** No reference ID for manual contribution.

```javascript
      description || 'Manual contribution'
```
**Line 82:** Passes description or default value.

```javascript
    );
```
**Line 83:** Closes the addSavingsTransaction call.

```javascript
    await auditLog(
```
**Line 84:** Logs the contribution event.

```javascript
      userId,
```
**Line 85:** User ID.

```javascript
      'SAVINGS_CONTRIBUTION',
```
**Line 86:** Action type.

```javascript
      'savings_transactions',
```
**Line 87:** Table name.

```javascript
      result.transactionId,
```
**Line 88:** Transaction record ID.

```javascript
      { balance: result.balanceBefore },
```
**Line 89:** Old balance before transaction.

```javascript
      { balance: result.balanceAfter },
```
**Line 90:** New balance after transaction.

```javascript
      req.ip,
```
**Line 91:** IP address.

```javascript
      req.get('User-Agent')
```
**Line 92:** User agent.

```javascript
    );
```
**Line 93:** Closes auditLog call.

```javascript
    res.json({
```
**Line 94:** Returns JSON response.

```javascript
      success: true,
```
**Line 95:** Sets success to true.

```javascript
      message: 'Contribution added successfully',
```
**Line 96:** Success message.

```javascript
      data: {
```
**Line 97:** Starts data object.

```javascript
        transactionId: result.transactionId,
```
**Line 98:** Transaction ID.

```javascript
        newBalance: result.balanceAfter
```
**Line 99:** New account balance.

```javascript
      }
```
**Line 100:** Closes data object.

```javascript
    });
```
**Line 101:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 102:** Catches errors.

```javascript
    console.error('Add contribution error:', error);
```
**Line 103:** Logs error.

```javascript
    res.status(500).json({
```
**Line 104:** Returns 500.

```javascript
      success: false,
```
**Line 105:** Sets success to false.

```javascript
      message: error.message || 'Internal server error'
```
**Line 106:** Error message.

```javascript
    });
```
**Line 107:** Closes JSON response.

```javascript
  }
```
**Line 108:** Closes catch block.

```javascript
};
```
**Line 109:** Closes addContribution function.

---

## 4. Savings Transaction Processing (ACID Transaction)

### File: `src/models/Savings.js` (Lines 46-105)

```javascript
  static async addSavingsTransaction(savingsAccountId, userId, transactionType, amount, referenceId = null, description = null, payrollBatchId = null) {
```
**Line 46:** Defines static async method to add a savings transaction with multiple parameters.

```javascript
    return await transaction(async (connection) => {
```
**Line 47:** Starts a database transaction using the transaction helper. This ensures ACID properties - all operations succeed or none do.

```javascript
      const [account] = await connection.execute(
```
**Line 48:** Executes a query using the transaction connection (not the pool).

```javascript
        'SELECT current_balance FROM savings_accounts WHERE id = ?',
```
**Line 49:** SQL query to get current balance of the account.

```javascript
        [savingsAccountId]
```
**Line 50:** Parameter for account ID.

```javascript
      );
```
**Line 51:** Closes the execute call.

```javascript
      if (!account[0]) {
```
**Line 52:** Checks if account exists.

```javascript
        throw new Error('Savings account not found');
```
**Line 53:** Throws error if account not found (this will trigger transaction rollback).

```javascript
      }
```
**Line 54:** Closes validation if block.

```javascript
      const balanceBefore = account[0].current_balance;
```
**Line 55:** Stores the balance before the transaction for audit trail.

```javascript
      let balanceAfter = balanceBefore;
```
**Line 56:** Initializes balanceAfter with balanceBefore.

```javascript
      if (transactionType === 'CONTRIBUTION' || transactionType === 'INTEREST') {
```
**Line 57:** Checks if transaction type increases balance.

```javascript
        balanceAfter = balanceBefore + amount;
```
**Line 58:** Adds amount to balance for contributions and interest.

```javascript
      } else if (transactionType === 'WITHDRAWAL' || transactionType === 'PENALTY') {
```
**Line 59:** Checks if transaction type decreases balance.

```javascript
        if (balanceBefore < amount) {
```
**Line 60:** Checks if sufficient balance exists for withdrawal/penalty.

```javascript
          throw new Error('Insufficient balance');
```
**Line 61:** Throws error if insufficient funds (triggers rollback).

```javascript
        }
```
**Line 62:** Closes validation if block.

```javascript
        balanceAfter = balanceBefore - amount;
```
**Line 63:** Subtracts amount from balance for withdrawals and penalties.

```javascript
      }
```
**Line 64:** Closes if-else block.

```javascript
      const insertQuery = `
```
**Line 65:** Starts SQL INSERT query for transaction record.

```javascript
        INSERT INTO savings_transactions 
```
**Line 66:** Table name: savings_transactions.

```javascript
        (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
```
**Line 67:** Columns to insert into.

```javascript
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
```
**Line 68:** Parameter placeholders.

```javascript
      `;
```
**Line 69:** Closes SQL string.

```javascript
      const [result] = await connection.execute(insertQuery, [
```
**Line 70:** Executes the INSERT query.

```javascript
        savingsAccountId, 
```
**Line 71:** First parameter: savings account ID.

```javascript
        userId, 
```
**Line 72:** Second parameter: user ID.

```javascript
        transactionType, 
```
**Line 73:** Third parameter: transaction type.

```javascript
        amount, 
```
**Line 74:** Fourth parameter: amount.

```javascript
        balanceBefore, 
```
**Line 75:** Fifth parameter: balance before.

```javascript
        balanceAfter, 
```
**Line 76:** Sixth parameter: balance after.

```javascript
        referenceId, 
```
**Line 77:** Seventh parameter: reference ID (optional).

```javascript
        description, 
```
**Line 78:** Eighth parameter: description (optional).

```javascript
        payrollBatchId
```
**Line 79:** Ninth parameter: payroll batch ID (optional).

```javascript
      ]);
```
**Line 80:** Closes the execute call.

```javascript
      const updateQuery = `
```
**Line 81:** Starts SQL UPDATE query for account balance.

```javascript
        UPDATE savings_accounts 
```
**Line 82:** Table name: savings_accounts.

```javascript
        SET current_balance = ?, updated_at = NOW()
```
**Line 83:** Updates current balance and sets updated_at timestamp.

```javascript
        WHERE id = ?
```
**Line 84:** WHERE clause to target specific account.

```javascript
      `;
```
**Line 85:** Closes SQL string.

```javascript
      await connection.execute(updateQuery, [balanceAfter, savingsAccountId]);
```
**Line 86:** Executes the UPDATE query with new balance and account ID.

```javascript
      if (transactionType === 'CONTRIBUTION') {
```
**Line 87:** Checks if transaction is a contribution.

```javascript
        await connection.execute(
```
**Line 88:** Executes update to track total contributions.

```javascript
          'UPDATE savings_accounts SET total_contributions = total_contributions + ? WHERE id = ?',
```
**Line 89:** SQL to increment total_contributions.

```javascript
          [amount, savingsAccountId]
```
**Line 90:** Parameters: amount and account ID.

```javascript
        );
```
**Line 91:** Closes execute call.

```javascript
      } else if (transactionType === 'INTEREST') {
```
**Line 92:** Checks if transaction is interest.

```javascript
        await connection.execute(
```
**Line 93:** Executes update to track total interest earned.

```javascript
          'UPDATE savings_accounts SET interest_earned = interest_earned + ? WHERE id = ?',
```
**Line 94:** SQL to increment interest_earned.

```javascript
          [amount, savingsAccountId]
```
**Line 95:** Parameters: amount and account ID.

```javascript
        );
```
**Line 96:** Closes execute call.

```javascript
      }
```
**Line 97:** Closes if-else block.

```javascript
      return {
```
**Line 98:** Returns the transaction result.

```javascript
        transactionId: result.insertId,
```
**Line 99:** The ID of the created transaction record.

```javascript
        balanceAfter,
```
**Line 100:** The new balance after transaction.

```javascript
        balanceBefore
```
**Line 101:** The balance before transaction.

```javascript
      };
```
**Line 102:** Closes return object.

```javascript
    });
```
**Line 103:** Closes the transaction callback. If any error occurred, the transaction automatically rolls back. If no error, it commits.

```javascript
  }
```
**Line 104:** Closes addSavingsTransaction method.

```javascript
```
**Line 105:** Empty line.

---

## 5. Calculate Monthly Interest

### File: `src/models/Savings.js` (Lines 158-182)

```javascript
  static async calculateMonthlyInterest(savingsAccountId) {
```
**Line 158:** Defines static async method to calculate interest for a single account.

```javascript
    const accountQuery = `
```
**Line 159:** Starts SQL query to fetch account details.

```javascript
      SELECT current_balance, account_status
```
**Line 160:** Selects current balance and account status.

```javascript
      FROM savings_accounts
```
**Line 161:** Table name: savings_accounts.

```javascript
      WHERE id = ? AND account_status = 'ACTIVE'
```
**Line 162:** Filters by account ID and active status.

```javascript
    `;
```
**Line 163:** Closes SQL string.

```javascript
    const account = await query(accountQuery, [savingsAccountId]);
```
**Line 164:** Executes the query.

```javascript
    if (!account[0] || account[0].current_balance <= 0) {
```
**Line 165:** Checks if account exists and has positive balance.

```javascript
      return 0;
```
**Line 166:** Returns 0 if no account or zero balance (no interest to calculate).

```javascript
    }
```
**Line 167:** Closes validation if block.

```javascript
    const configQuery = `
```
**Line 168:** Starts SQL query to get interest rate from configuration.

```javascript
      SELECT config_value FROM system_configuration 
```
**Line 169:** Table name: system_configuration.

```javascript
      WHERE config_key = 'savings_interest_rate' AND is_active = true
```
**Line 170:** Filters by config key and active status.

```javascript
    `;
```
**Line 171:** Closes SQL string.

```javascript
    const config = await query(configQuery);
```
**Line 172:** Executes the configuration query.

```javascript
    const annualRate = parseFloat(config[0]?.config_value || '7.00');
```
**Line 173:** Gets the annual interest rate from config or defaults to 7.00%.

```javascript
    const monthlyRate = annualRate / 12 / 100;
```
**Line 174:** Converts annual rate to monthly rate (divide by 12 for months, divide by 100 for percentage).

```javascript
    const monthlyInterest = account[0].current_balance * monthlyRate;
```
**Line 175:** Calculates monthly interest: balance * monthly rate.

```javascript
    return Math.round(monthlyInterest * 100) / 100;
```
**Line 176:** Rounds to 2 decimal places for currency precision.

```javascript
  }
```
**Line 177:** Closes calculateMonthlyInterest method.

```javascript
```
**Line 178:** Empty line.

---

## 6. Process Monthly Interest for All Accounts

### File: `src/models/Savings.js` (Lines 184-227)

```javascript
  static async processMonthlyInterest() {
```
**Line 184:** Defines static async method to process interest for all active accounts.

```javascript
    const accountsQuery = `
```
**Line 185:** Starts SQL query to fetch all eligible accounts.

```javascript
      SELECT id, user_id, employee_id, current_balance
```
**Line 186:** Selects account details needed for processing.

```javascript
      FROM savings_accounts
```
**Line 187:** Table name: savings_accounts.

```javascript
      WHERE account_status = 'ACTIVE' AND current_balance > 0
```
**Line 188:** Filters for active accounts with positive balance.

```javascript
    `;
```
**Line 189:** Closes SQL string.

```javascript
    const accounts = await query(accountsQuery);
```
**Line 190:** Executes the query to get all eligible accounts.

```javascript
    const results = [];
```
**Line 191:** Initializes array to store processing results.

```javascript
    for (const account of accounts) {
```
**Line 192:** Loops through each account sequentially (not parallel to avoid overwhelming database).

```javascript
      try {
```
**Line 193:** Starts try-catch for individual account processing (one account failure shouldn't stop all).

```javascript
        const interestAmount = await this.calculateMonthlyInterest(account.id);
```
**Line 194:** Calculates interest for this specific account.

```javascript
        if (interestAmount > 0) {
```
**Line 195:** Checks if interest amount is positive.

```javascript
          const result = await this.addSavingsTransaction(
```
**Line 196:** Adds the interest as a transaction.

```javascript
            account.id,
```
**Line 197:** Account ID.

```javascript
            account.user_id,
```
**Line 198:** User ID.

```javascript
            'INTEREST',
```
**Line 199:** Transaction type: INTEREST.

```javascript
            interestAmount,
```
**Line 200:** Interest amount.

```javascript
            null,
```
**Line 201:** No reference ID.

```javascript
            `Monthly interest - ${moment().format('YYYY-MM')}`,
```
**Line 202:** Description with current month.

```javascript
            null
```
**Line 203:** No payroll batch ID.

```javascript
          );
```
**Line 204:** Closes addSavingsTransaction call.

```javascript
          results.push({
```
**Line 205:** Adds successful result to results array.

```javascript
            accountId: account.id,
```
**Line 206:** Account ID.

```javascript
            employeeId: account.employee_id,
```
**Line 207:** Employee ID.

```javascript
            interestAmount,
```
**Line 208:** Interest amount credited.

```javascript
            success: true
```
**Line 209:** Success flag.

```javascript
          });
```
**Line 210:** Closes result object.

```javascript
        }
```
**Line 211:** Closes if block.

```javascript
      } catch (error) {
```
**Line 212:** Catches errors for individual account.

```javascript
        results.push({
```
**Line 213:** Adds failure result to results array.

```javascript
          accountId: account.id,
```
**Line 214:** Account ID.

```javascript
          employeeId: account.employee_id,
```
**Line 215:** Employee ID.

```javascript
          error: error.message,
```
**Line 216:** Error message.

```javascript
          success: false
```
**Line 217:** Failure flag.

```javascript
        });
```
**Line 218:** Closes result object.

```javascript
      }
```
**Line 219:** Closes catch block.

```javascript
    }
```
**Line 220:** Closes for loop.

```javascript
    return results;
```
**Line 221:** Returns array of results (successes and failures).

```javascript
  }
```
**Line 222:** Closes processMonthlyInterest method.

```javascript
```
**Line 223:** Empty line.

---

## 7. Check Missed Savings Penalties

### File: `src/models/Savings.js` (Lines 229-287)

```javascript
  static async checkMissedSavings() {
```
**Line 229:** Defines static async method to check for missed savings and apply penalties.

```javascript
    const configQuery = `
```
**Line 230:** Starts SQL query to get penalty threshold configuration.

```javascript
      SELECT config_value FROM system_configuration 
```
**Line 231:** Table name: system_configuration.

```javascript
      WHERE config_key = 'penalty_days_threshold' AND is_active = true
```
**Line 232:** Filters for penalty threshold configuration.

```javascript
    `;
```
**Line 233:** Closes SQL string.

```javascript
    const config = await query(configQuery);
```
**Line 234:** Executes the query.

```javascript
    const thresholdDays = parseInt(config[0]?.config_value || '10');
```
**Line 235:** Gets threshold days from config or defaults to 10 days.

```javascript
    const missedSavingsQuery = `
```
**Line 236:** Starts SQL query to find accounts with missed savings.

```javascript
      SELECT sa.id, sa.user_id, sa.employee_id, sa.current_balance,
```
**Line 237:** Selects account details.

```javascript
             MAX(st.transaction_date) as last_contribution_date
```
**Line 238:** Gets the most recent contribution date.

```javascript
      FROM savings_accounts sa
```
**Line 239:** Table name: savings_accounts.

```javascript
      LEFT JOIN savings_transactions st ON sa.id = st.savings_account_id AND st.transaction_type = 'CONTRIBUTION'
```
**Line 240:** Left joins transactions to get contribution history.

```javascript
      WHERE sa.account_status = 'ACTIVE'
```
**Line 241:** Filters for active accounts.

```javascript
      GROUP BY sa.id, sa.user_id, sa.employee_id, sa.current_balance
```
**Line 242:** Groups by account to get one row per account.

```javascript
      HAVING last_contribution_date < DATE_SUB(NOW(), INTERVAL ? DAY) OR last_contribution_date IS NULL
```
**Line 243:** Filters for accounts with no contribution in threshold days or never contributed.

```javascript
    `;
```
**Line 244:** Closes SQL string.

```javascript
    const missedAccounts = await query(missedSavingsQuery, [thresholdDays]);
```
**Line 245:** Executes the query with threshold days parameter.

```javascript
    const results = [];
```
**Line 246:** Initializes results array.

```javascript
    for (const account of missedAccounts) {
```
**Line 247:** Loops through each account with missed savings.

```javascript
      const penaltyAmount = account.current_balance * 0.02;
```
**Line 248:** Calculates penalty as 2% of current balance.

```javascript
      try {
```
**Line 249:** Starts try-catch for individual penalty processing.

```javascript
        await this.addSavingsTransaction(
```
**Line 250:** Adds penalty as a transaction.

```javascript
          account.id,
```
**Line 251:** Account ID.

```javascript
          account.user_id,
```
**Line 252:** User ID.

```javascript
          'PENALTY',
```
**Line 253:** Transaction type: PENALTY.

```javascript
          penaltyAmount,
```
**Line 254:** Penalty amount.

```javascript
          null,
```
**Line 255:** No reference ID.

```javascript
          `Penalty for missed savings - ${thresholdDays} days`,
```
**Line 256:** Description with threshold days.

```javascript
          null
```
**Line 257:** No payroll batch ID.

```javascript
        );
```
**Line 258:** Closes addSavingsTransaction call.

```javascript
        await query(
```
**Line 259:** Inserts record into penalties table for tracking.

```javascript
          'INSERT INTO penalties (user_id, employee_id, penalty_type, amount, reason, due_date) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
```
**Line 260:** SQL to insert penalty record with 30-day due date.

```javascript
          [account.user_id, account.employee_id, 'MISSED_SAVINGS', penaltyAmount, `Missed savings for ${thresholdDays} days`]
```
**Line 261:** Parameters for penalty record.

```javascript
        );
```
**Line 262:** Closes query execution.

```javascript
        results.push({
```
**Line 263:** Adds successful result.

```javascript
          accountId: account.id,
```
**Line 264:** Account ID.

```javascript
          employeeId: account.employee_id,
```
**Line 265:** Employee ID.

```javascript
          penaltyAmount,
```
**Line 266:** Penalty amount applied.

```javascript
          success: true
```
**Line 267:** Success flag.

```javascript
        });
```
**Line 268:** Closes result object.

```javascript
      } catch (error) {
```
**Line 269:** Catches errors.

```javascript
        results.push({
```
**Line 270:** Adds failure result.

```javascript
          accountId: account.id,
```
**Line 271:** Account ID.

```javascript
          employeeId: account.employee_id,
```
**Line 272:** Employee ID.

```javascript
          error: error.message,
```
**Line 273:** Error message.

```javascript
          success: false
```
**Line 274:** Failure flag.

```javascript
        });
```
**Line 275:** Closes result object.

```javascript
      }
```
**Line 276:** Closes catch block.

```javascript
    }
```
**Line 277:** Closes for loop.

```javascript
    return results;
```
**Line 278:** Returns results array.

```javascript
  }
```
**Line 279:** Closes checkMissedSavings method.

```javascript
```
**Line 280:** Empty line.

---

## 8. Withdraw Savings

### File: `src/controllers/savingsController.js` (Lines 122-178)

```javascript
exports.withdrawSavings = async (req, res) => {
```
**Line 122:** Exports the withdrawSavings function.

```javascript
  try {
```
**Line 123:** Starts try-catch block.

```javascript
    const userId = req.user.id;
```
**Line 124:** Gets authenticated user ID.

```javascript
    const { amount, reason } = req.body;
```
**Line 125:** Extracts amount and reason from request body.

```javascript
    if (!amount || amount <= 0) {
```
**Line 126:** Validates amount is provided and positive.

```javascript
      return res.status(400).json({
```
**Line 127:** Returns 400 if validation fails.

```javascript
        success: false,
```
**Line 128:** Sets success to false.

```javascript
        message: 'Valid withdrawal amount is required'
```
**Line 129:** Error message.

```javascript
      });
```
**Line 130:** Closes JSON response.

```javascript
    }
```
**Line 131:** Closes validation if block.

```javascript
    const account = await Savings.getSavingsAccount(userId);
```
**Line 132:** Fetches user's savings account.

```javascript
    if (!account) {
```
**Line 133:** Checks if account exists.

```javascript
      return res.status(404).json({
```
**Line 134:** Returns 404 if not found.

```javascript
        success: false,
```
**Line 135:** Sets success to false.

```javascript
        message: 'Savings account not found'
```
**Line 136:** Error message.

```javascript
      });
```
**Line 137:** Closes JSON response.

```javascript
    }
```
**Line 138:** Closes validation if block.

```javascript
    if (account.account_status !== 'ACTIVE') {
```
**Line 139:** Checks if account is active.

```javascript
      return res.status(400).json({
```
**Line 140:** Returns 400 if not active.

```javascript
        success: false,
```
**Line 141:** Sets success to false.

```javascript
        message: 'Cannot withdraw from inactive account'
```
**Line 142:** Error message.

```javascript
      });
```
**Line 143:** Closes JSON response.

```javascript
    }
```
**Line 144:** Closes validation if block.

```javascript
    if (new Date(account.lock_period_end_date) > new Date()) {
```
**Line 145:** Checks if account is still within lock period (first 6 months).

```javascript
      return res.status(400).json({
```
**Line 146:** Returns 400 if within lock period.

```javascript
        success: false,
```
**Line 147:** Sets success to false.

```javascript
        message: 'Cannot withdraw during lock period'
```
**Line 148:** Error message.

```javascript
      });
```
**Line 149:** Closes JSON response.

```javascript
    }
```
**Line 150:** Closes validation if block.

```javascript
    const result = await Savings.addSavingsTransaction(
```
**Line 151:** Calls Savings model to process withdrawal transaction.

```javascript
      account.id,
```
**Line 152:** Account ID.

```javascript
      userId,
```
**Line 153:** User ID.

```javascript
      'WITHDRAWAL',
```
**Line 154:** Transaction type: WITHDRAWAL.

```javascript
      parseFloat(amount),
```
**Line 155:** Withdrawal amount.

```javascript
      null,
```
**Line 156:** No reference ID.

```javascript
      reason || 'Manual withdrawal'
```
**Line 157:** Reason or default description.

```javascript
    );
```
**Line 158:** Closes addSavingsTransaction call.

```javascript
    await auditLog(
```
**Line 159:** Logs the withdrawal event.

```javascript
      userId,
```
**Line 160:** User ID.

```javascript
      'SAVINGS_WITHDRAWAL',
```
**Line 161:** Action type.

```javascript
      'savings_transactions',
```
**Line 162:** Table name.

```javascript
      result.transactionId,
```
**Line 163:** Transaction ID.

```javascript
      { balance: result.balanceBefore },
```
**Line 164:** Old balance.

```javascript
      { balance: result.balanceAfter },
```
**Line 165:** New balance.

```javascript
      req.ip,
```
**Line 166:** IP address.

```javascript
      req.get('User-Agent')
```
**Line 167:** User agent.

```javascript
    );
```
**Line 168:** Closes auditLog call.

```javascript
    res.json({
```
**Line 169:** Returns JSON response.

```javascript
      success: true,
```
**Line 170:** Sets success to true.

```javascript
      message: 'Withdrawal processed successfully',
```
**Line 171:** Success message.

```javascript
      data: {
```
**Line 172:** Starts data object.

```javascript
        transactionId: result.transactionId,
```
**Line 173:** Transaction ID.

```javascript
        newBalance: result.balanceAfter
```
**Line 174:** New balance.

```javascript
      }
```
**Line 175:** Closes data object.

```javascript
    });
```
**Line 176:** Closes JSON response.

```javascript
  } catch (error) {
```
**Line 177:** Catches errors.

```javascript
    console.error('Withdrawal error:', error);
```
**Line 178:** Logs error.

```javascript
    res.status(500).json({
```
**Line 179:** Returns 500.

```javascript
      success: false,
```
**Line 180:** Sets success to false.

```javascript
      message: error.message || 'Internal server error'
```
**Line 181:** Error message.

```javascript
    });
```
**Line 182:** Closes JSON response.

```javascript
  }
```
**Line 183:** Closes catch block.

```javascript
};
```
**Line 184:** Closes withdrawSavings function.

---

## Summary

The savings account flow implements a comprehensive financial management system with:

1. **Account Creation:** One account per user with 6-month lock period, 15-65% saving percentage range
2. **Transaction Processing:** ACID transactions ensure atomicity - balance updates and transaction records always stay consistent
3. **Interest Calculation:** Monthly interest at configurable rate (default 7% annually), calculated as balance * (rate/12/100)
4. **Penalty Enforcement:** 2% penalty for missed savings beyond threshold (default 10 days), with 30-day payment due date
5. **Withdrawal Restrictions:** Lock period prevents early withdrawals, insufficient balance checks prevent overdrafts
6. **Audit Trail:** All transactions logged with before/after balances for complete audit trail
7. **Error Isolation:** Individual account processing failures don't stop batch operations (interest, penalties)
8. **Configuration-Driven:** Interest rates, thresholds, and other parameters stored in system_configuration table for easy adjustment

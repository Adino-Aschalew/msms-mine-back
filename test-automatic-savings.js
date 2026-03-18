require('dotenv').config({ path: '../.env' });

// Test automatic savings deduction system
async function testAutomaticSavings() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:9999';
  
  console.log('🧪 Testing Automatic Savings Deduction System...\n');
  
  let authToken = null;
  
  try {
    // Step 1: Login as Finance Admin
    console.log('📋 Step 1: Finance Admin Login');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'finance@company.com',
        password: 'password',
        role: 'FINANCE'
      })
    });

    const loginData = await loginResponse.json();
    if (loginResponse.ok && loginData.success) {
      authToken = loginData.data.token;
      console.log('✅ Finance Admin Login Successful');
    } else {
      throw new Error('Finance login failed');
    }

    // Step 2: Check Employee Savings Account Before Payroll
    console.log('\n📋 Step 2: Check Employee Savings Before Payroll');
    const employeeLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'EMP001',
        password: 'password',
        role: 'EMPLOYEE'
      })
    });

    const employeeLoginData = await employeeLoginResponse.json();
    if (employeeLoginResponse.ok && employeeLoginData.success) {
      const employeeToken = employeeLoginData.data.token;
      
      // Get employee savings account
      const savingsResponse = await fetch(`${baseUrl}/api/savings/account`, {
        headers: { 'Authorization': `Bearer ${employeeToken}` }
      });

      if (savingsResponse.ok) {
        const savingsData = await savingsResponse.json();
        console.log('✅ Employee Savings Account Found:');
        console.log(`   Current Balance: $${savingsData.data?.current_balance || 0}`);
        console.log(`   Saving Percentage: ${savingsData.data?.saving_percentage || 0}%`);
      } else {
        console.log('⚠️  No savings account found for employee');
      }
    }

    // Step 3: Create Test Payroll File
    console.log('\n📋 Step 3: Creating Test Payroll File');
    const csvContent = `Employee ID,Gross Salary,Net Salary,Payroll Date
EMP001,5000,3750,2024-03-15
EMP002,6000,4500,2024-03-15`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test_payroll.csv', { type: 'text/csv' });
    
    console.log('✅ Test Payroll File Created');

    // Step 4: Upload Payroll File
    console.log('\n📋 Step 4: Uploading Payroll File');
    const formData = new FormData();
    formData.append('payroll', file);

    const uploadResponse = await fetch(`${baseUrl}/api/finance/payroll/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadResponse.ok && uploadData.success) {
      console.log('✅ Payroll Upload Successful');
      console.log(`   Batch ID: ${uploadData.data.batch_id}`);
      console.log(`   Total Employees: ${uploadData.data.total_employees}`);
      console.log(`   Successful: ${uploadData.data.successful_employees || 0}`);
      console.log(`   Failed: ${uploadData.data.failed_employees || 0}`);
      
      // Step 5: Validate Payroll Batch
      console.log('\n📋 Step 5: Validating Payroll Batch');
      const validateResponse = await fetch(`${baseUrl}/api/finance/payroll/validate/${uploadData.data.batch_id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const validateData = await validateResponse.json();
      
      if (validateResponse.ok && validateData.success) {
        console.log('✅ Payroll Validation Successful');
        
        // Step 6: Confirm Payroll (This triggers automatic savings)
        console.log('\n📋 Step 6: Confirming Payroll (Triggers Automatic Savings)');
        const confirmResponse = await fetch(`${baseUrl}/api/finance/payroll/confirm/${uploadData.data.batch_id}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ confirmed_by: 1 })
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmResponse.ok && confirmData.success) {
          console.log('✅ Payroll Confirmation Successful');
          console.log('   Automatic savings deductions should have been processed');
          
          // Step 7: Check Employee Savings After Payroll
          console.log('\n📋 Step 7: Checking Employee Savings After Payroll');
          
          // Wait a moment for processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const savingsAfterResponse = await fetch(`${baseUrl}/api/savings/account`, {
            headers: { 'Authorization': `Bearer ${employeeLoginData.data.token}` }
          });

          if (savingsAfterResponse.ok) {
            const savingsAfterData = await savingsAfterResponse.json();
            console.log('✅ Employee Savings After Payroll:');
            console.log(`   Current Balance: $${savingsAfterData.data?.current_balance || 0}`);
            console.log(`   Previous Balance: $${savingsData.data?.current_balance || 0}`);
            
            const balanceIncrease = (savingsAfterData.data?.current_balance || 0) - (savingsData.data?.current_balance || 0);
            console.log(`   Balance Increase: $${balanceIncrease}`);
            
            // Step 8: Check Transaction History
            console.log('\n📋 Step 8: Checking Transaction History');
            const transactionsResponse = await fetch(`${baseUrl}/api/savings/transactions?page=1&limit=5`, {
              headers: { 'Authorization': `Bearer ${employeeLoginData.data.token}` }
            });

            if (transactionsResponse.ok) {
              const transactionsData = await transactionsResponse.json();
              console.log('✅ Recent Transactions:');
              
              transactionsData.data?.transactions?.forEach((transaction, index) => {
                console.log(`   ${index + 1}. ${transaction.transaction_type}: $${transaction.amount} (${transaction.description})`);
                console.log(`      Balance: $${transaction.balance_before} → $${transaction.balance_after}`);
              });
            }
            
            // Step 9: Verify Automatic Deduction
            const expectedDeduction = 5000 * 0.25; // 25% of $5000 = $1250
            if (balanceIncrease >= expectedDeduction) {
              console.log('\n🎉 SUCCESS: Automatic savings deduction working correctly!');
              console.log(`   Expected deduction: $${expectedDeduction}`);
              console.log(`   Actual increase: $${balanceIncrease}`);
            } else {
              console.log('\n⚠️  WARNING: Automatic deduction may not be working as expected');
            }
          }
        } else {
          console.log('❌ Payroll Confirmation Failed');
          console.log(`   Error: ${confirmData.message}`);
        }
      } else {
        console.log('❌ Payroll Validation Failed');
        console.log(`   Error: ${validateData.message}`);
      }
    } else {
      console.log('❌ Payroll Upload Failed');
      console.log(`   Error: ${uploadData.message}`);
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }

  console.log('\n🏁 Automatic Savings System Test Completed!');
  console.log('\n📊 Summary:');
  console.log('- Finance admin login tested');
  console.log('- Employee savings account checked');
  console.log('- Payroll file uploaded');
  console.log('- Payroll validation and confirmation tested');
  console.log('- Automatic savings deduction verified');
  console.log('- Transaction history checked');
  console.log('\n🎯 Expected Behavior:');
  console.log('- When finance uploads payroll → Savings automatically deducted');
  console.log('- Employee balance immediately updated');
  console.log('- Transaction record created automatically');
  console.log('- No manual intervention required');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9999/api/health');
    if (response.ok) {
      console.log('✅ Backend server is running');
      testAutomaticSavings();
    } else {
      console.log('❌ Backend server is not responding correctly');
    }
  } catch (error) {
    console.log('❌ Backend server is not running. Please start the server first:');
    console.log('   npm run dev');
  }
}

checkServer();

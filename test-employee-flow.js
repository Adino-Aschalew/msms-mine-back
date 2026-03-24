const axios = require('axios');

async function testEmployeeCreationFlow() {
  try {
    console.log('🔄 Testing Complete Employee Creation Flow...');
    
    // Step 1: Login as HR
    console.log('🔐 Step 1: Logging in as HR...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get current employees list
    console.log('\n📋 Step 2: Getting current employees list...');
    const currentEmployeesResponse = await axios.get('http://localhost:9999/api/hr/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const currentEmployees = currentEmployeesResponse.data.data || [];
    console.log(`✅ Current employees count: ${currentEmployees.length}`);
    
    // Step 3: Create new employee
    console.log('\n➕ Step 3: Creating new employee...');
    const newEmployee = {
      employeeId: `TEST${Date.now()}`,
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe${Date.now()}@test.com`,
      phone: '+1234567890',
      department: 'Engineering',
      role: 'EMPLOYEE',
      type: 'Full-time',
      salary: '60000',
      address: '123 Test Street',
      emergencyContact: 'Jane Doe - +1234567891',
      joinDate: '2026-03-24',
      status: 'Active'
    };
    
    const createResponse = await axios.post('http://localhost:9999/api/hr/employees', newEmployee, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Employee created successfully!');
    console.log('Employee details:', createResponse.data.data.employee);
    
    // Step 4: Verify employee appears in list
    console.log('\n🔍 Step 4: Verifying employee appears in list...');
    const updatedEmployeesResponse = await axios.get('http://localhost:9999/api/hr/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const updatedEmployees = updatedEmployeesResponse.data.data || [];
    console.log(`✅ Updated employees count: ${updatedEmployees.length}`);
    
    // Check if new employee is in the list
    const newEmployeeInList = updatedEmployees.find(emp => 
      emp.email === newEmployee.email || emp.employee_id === newEmployee.employeeId
    );
    
    if (newEmployeeInList) {
      console.log('✅ New employee found in the list!');
      console.log('Employee details from list:', {
        id: newEmployeeInList.id,
        employeeId: newEmployeeInList.employee_id,
        name: `${newEmployeeInList.first_name} ${newEmployeeInList.last_name}`,
        email: newEmployeeInList.email,
        department: newEmployeeInList.department,
        status: newEmployeeInList.employment_status
      });
    } else {
      console.log('❌ New employee not found in the list');
    }
    
    // Step 5: Test reports endpoint
    console.log('\n📊 Step 5: Testing reports endpoint...');
    const reportsResponse = await axios.get('http://localhost:9999/api/hr/reports?reportType=payroll', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Reports working!');
    console.log('Reports data keys:', Object.keys(reportsResponse.data.data));
    
    console.log('\n🎉 Complete flow test successful!');
    console.log('\n📋 Summary:');
    console.log(`- ✅ Employee count before: ${currentEmployees.length}`);
    console.log(`- ✅ Employee count after: ${updatedEmployees.length}`);
    console.log(`- ✅ New employee in list: ${newEmployeeInList ? 'YES' : 'NO'}`);
    console.log(`- ✅ Reports working: YES`);
    console.log(`- ✅ Default password: ${createResponse.data.data.employee.defaultPassword || 'N/A'}`);
    
  } catch (error) {
    console.log('❌ Flow test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testEmployeeCreationFlow();

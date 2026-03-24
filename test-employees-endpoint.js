const axios = require('axios');

async function testEmployeesEndpoint() {
  try {
    console.log('👥 Testing HR Employees Endpoint...');
    
    // Step 1: Login as HR Admin
    console.log('🔐 Step 1: Logging in as HR Admin...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get employees list
    console.log('\n📊 Step 2: Getting employees list...');
    try {
      const employeesResponse = await axios.get('http://localhost:9999/api/hr/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const employees = employeesResponse.data.data || [];
      console.log('✅ Employees retrieved successfully!');
      console.log(`Found ${employees.length} employees`);
      
      if (employees.length > 0) {
        console.log('\nFirst employee details:');
        const emp = employees[0];
        console.log('- ID:', emp.id);
        console.log('- Employee ID:', emp.employee_id);
        console.log('- Name:', `${emp.first_name} ${emp.last_name}`);
        console.log('- Email:', emp.email);
        console.log('- Department:', emp.department);
        console.log('- Status:', emp.employment_status);
        console.log('- Phone:', emp.phone);
      }
    } catch (error) {
      console.log('❌ Employees endpoint failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      }
    }
    
    // Step 3: Test adding a new employee
    console.log('\n➕ Step 3: Testing add new employee...');
    try {
      const newEmployee = {
        employeeId: `TEST${Date.now()}`,
        firstName: 'Test',
        lastName: 'Employee',
        email: `test.employee${Date.now()}@test.com`,
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
      
    } catch (error) {
      console.log('❌ Add employee failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      }
    }
    
    console.log('\n🎉 Employees endpoint test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testEmployeesEndpoint();

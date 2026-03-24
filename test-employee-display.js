const axios = require('axios');

async function testEmployeeDisplay() {
  try {
    console.log('🔍 Testing Employee Display...');
    
    // Login as HR
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Get employees
    const employeesResponse = await axios.get('http://localhost:9999/api/hr/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const employees = employeesResponse.data.data || [];
    console.log(`✅ Found ${employees.length} employees`);
    
    if (employees.length > 0) {
      console.log('\n📋 Employee Data Structure:');
      console.log('First employee fields:', Object.keys(employees[0]));
      
      console.log('\n👤 First Employee Details:');
      const emp = employees[0];
      console.log(`- ID: ${emp.id}`);
      console.log(`- Employee ID: ${emp.employee_id}`);
      console.log(`- Name: ${emp.first_name} ${emp.last_name}`);
      console.log(`- Email: ${emp.email}`);
      console.log(`- Department: ${emp.department}`);
      console.log(`- Status: ${emp.employment_status}`);
      console.log(`- Hire Date: ${emp.hire_date}`);
      console.log(`- Phone: ${emp.phone}`);
      console.log(`- Role: ${emp.role}`);
      
      console.log('\n✅ Employee data structure looks correct!');
      console.log('The frontend should now display employees properly.');
    } else {
      console.log('❌ No employees found in database');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testEmployeeDisplay();

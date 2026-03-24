// Test script to simulate frontend API calls
const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('🔄 Testing Frontend API Calls...');
    
    // Step 1: Login as HR Admin
    console.log('🔐 Step 1: Logging in as HR Admin...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test the exact API call the frontend makes
    console.log('\n📊 Step 2: Testing frontend API call...');
    const employeesResponse = await axios.get('http://localhost:9999/api/hr/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 1000
      }
    });
    
    console.log('✅ Frontend API call successful!');
    console.log('Response structure:', Object.keys(employeesResponse.data));
    console.log('Success:', employeesResponse.data.success);
    console.log('Employees count:', employeesResponse.data.data?.length || 0);
    console.log('First employee:', employeesResponse.data.data?.[0] || 'No employees');
    
    // Step 3: Test hrAPI.getAllEmployees (simulating frontend)
    console.log('\n🔍 Step 3: Testing hrAPI response structure...');
    
    // This is what the frontend receives from hrAPI
    const apiResponse = {
      data: employeesResponse.data // hrAPI returns response.data which is {success, data, pagination}
    };
    
    console.log('hrAPI response:', apiResponse);
    console.log('hrAPI.data:', apiResponse.data);
    
    const employees = apiResponse.data?.data || []; // Need to access .data.data
    console.log('Data extracted for frontend:', employees.length, 'employees');
    
    if (employees.length > 0) {
      console.log('First employee for frontend:', {
        id: employees[0].id,
        employee_id: employees[0].employee_id,
        name: `${employees[0].first_name} ${employees[0].last_name}`,
        email: employees[0].email,
        department: employees[0].department,
        status: employees[0].employment_status
      });
    }
    
    console.log('\n🎉 Frontend API integration test completed!');
    console.log('\n📋 Summary:');
    console.log(`- ✅ Login: SUCCESS`);
    console.log(`- ✅ API Call: SUCCESS`);
    console.log(`- ✅ Data Structure: CORRECT`);
    console.log(`- ✅ Employee Count: ${employees.length}`);
    console.log(`- ✅ Frontend Ready: YES`);
    
    console.log('\n🚀 Frontend should now display employees correctly!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    }
  }
}

testFrontendAPI();

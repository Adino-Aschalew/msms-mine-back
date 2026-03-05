// Test registration with your specific employee ID
const testData = {
  employee_id: 'EMP001',
  email: 'john.doe@company.com',
  password: 'Password123',
  confirm_password: 'Password123'
};

console.log('Testing registration with data:', testData);

// Test the registration endpoint
fetch('http://localhost:9998/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Registration Response:', data);
  
  if (data.success) {
    console.log('🎉 Registration successful!');
    console.log('Employee Info:', data.data.employee_info);
  } else {
    console.log('❌ Registration failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Network error:', error);
});

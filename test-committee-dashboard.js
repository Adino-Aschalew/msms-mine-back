const axios = require('axios');

async function testCommitteeDashboard() {
  try {
    // Test with a loan committee token (you'll need to replace with a valid token)
    const token = 'your-auth-token-here'; // Replace with actual token from login
    
    const response = await axios.get('http://localhost:9999/api/loan-committee/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
  process.exit(0);
}

testCommitteeDashboard();

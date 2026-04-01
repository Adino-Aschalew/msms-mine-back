const axios = require('axios');

async function testNotificationsEndpoint() {
  try {
    // Test without authentication first to see if route exists
    const response = await axios.get('http://localhost:9999/api/notifications');
    console.log('Response:', response.status, response.data);
  } catch (error) {
    if (error.response) {
      console.log('Route exists but returned:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running');
    } else {
      console.log('Route not found or other error:', error.message);
    }
  }
  process.exit(0);
}

testNotificationsEndpoint();

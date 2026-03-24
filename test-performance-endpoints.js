const axios = require('axios');

async function testPerformanceEndpoints() {
  try {
    console.log('🚀 Testing Performance Endpoints...');
    
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:9999/api/auth/login', {
      identifier: 'hr@msms.com',
      password: 'password',
      role: 'HR'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test performance stats endpoint
    console.log('\n📊 Testing Performance Stats...');
    try {
      const statsResponse = await axios.get('http://localhost:9999/api/hr/performance-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Performance Stats - Success');
      console.log('Data keys:', Object.keys(statsResponse.data.data));
      console.log('Sample data:', JSON.stringify(statsResponse.data.data, null, 2));
    } catch (error) {
      console.log('❌ Performance Stats - Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    // Test performance reviews endpoint
    console.log('\n📋 Testing Performance Reviews...');
    try {
      const reviewsResponse = await axios.get('http://localhost:9999/api/hr/performance-reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Performance Reviews - Success');
      console.log('Data keys:', Object.keys(reviewsResponse.data));
      console.log('Array length:', reviewsResponse.data.data.length);
    } catch (error) {
      console.log('❌ Performance Reviews - Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    // Test creating a performance review
    console.log('\n➕ Testing Create Performance Review...');
    try {
      const createResponse = await axios.post('http://localhost:9999/api/hr/performance-reviews', {
        employee_id: 5, // John Doe's ID
        reviewer_id: 1, // HR admin ID
        review_type: 'ANNUAL',
        review_period_start: '2024-01-01',
        review_period_end: '2024-12-31',
        criteria_scores: [
          { criteria_id: 1, score: 4.5, comments: 'Good communication skills' },
          { criteria_id: 2, score: 4.0, comments: 'Works well with team' },
          { criteria_id: 3, score: 3.8, comments: 'Needs improvement in problem solving' }
        ],
        comments: 'Overall good performance with room for growth'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Create Performance Review - Success');
      console.log('Response:', createResponse.data);
    } catch (error) {
      console.log('❌ Create Performance Review - Failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Performance endpoints test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testPerformanceEndpoints();

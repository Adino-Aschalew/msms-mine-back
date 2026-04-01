// Test script to debug payroll upload issues
const fs = require('fs');
const path = require('path');

// Test 1: Check if server is running
async function testServerConnection() {
  try {
    const response = await fetch('http://localhost:9999/api/health');
    const data = await response.json();
    console.log('✅ Server is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

// Test 2: Test CORS preflight
async function testCorsPreflight() {
  try {
    const response = await fetch('http://localhost:9999/api/finance/payroll/upload', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ CORS preflight status:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    });
    return response.ok;
  } catch (error) {
    console.error('❌ CORS preflight failed:', error.message);
    return false;
  }
}

// Test 3: Create a sample CSV file
function createSampleCSV() {
  const csvContent = `employee_id,gross salary,saving,deduction,net salary
EMP001,5000,500,500,4000`;
  
  const filePath = path.join(__dirname, 'test-payroll.csv');
  fs.writeFileSync(filePath, csvContent);
  console.log('✅ Created test CSV file:', filePath);
  return filePath;
}

// Test 4: Test file upload with curl
async function testFileUpload() {
  const csvPath = createSampleCSV();
  
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(csvPath);
    const blob = new Blob([fileBuffer], { type: 'text/csv' });
    formData.append('payroll', blob, 'test-payroll.csv');
    
    const response = await fetch('http://localhost:9999/api/finance/payroll/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser sets it with boundary
      }
    });
    
    console.log('✅ Upload response status:', response.status);
    const data = await response.json();
    console.log('Upload response:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ File upload failed:', error.message);
    return false;
  } finally {
    // Clean up test file
    try {
      fs.unlinkSync(csvPath);
      console.log('🧹 Cleaned up test file');
    } catch (e) {}
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Starting payroll upload diagnostics...\n');
  
  console.log('1. Testing server connection...');
  const serverRunning = await testServerConnection();
  if (!serverRunning) {
    console.log('\n❌ Server is not running. Start the server first: npm start');
    return;
  }
  
  console.log('\n2. Testing CORS preflight...');
  const corsOk = await testCorsPreflight();
  
  console.log('\n3. Testing file upload...');
  const uploadOk = await testFileUpload();
  
  console.log('\n📊 Test Results:');
  console.log(`Server Connection: ${serverRunning ? '✅' : '❌'}`);
  console.log(`CORS Preflight: ${corsOk ? '✅' : '❌'}`);
  console.log(`File Upload: ${uploadOk ? '✅' : '❌'}`);
  
  if (serverRunning && corsOk && uploadOk) {
    console.log('\n🎉 All tests passed! The payroll upload should work.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - run tests
  runTests().catch(console.error);
} else {
  // Browser environment - export functions
  window.testPayrollUpload = { testServerConnection, testCorsPreflight, testFileUpload, runTests };
}

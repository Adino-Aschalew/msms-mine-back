const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Expected .env path:', path.resolve(__dirname, '../.env'));
console.log('Actual .env path:', path.resolve(process.cwd(), '.env'));

// Test loading from different paths
console.log('\n🔍 Testing different .env paths:');

// Test 1: From current working directory
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
console.log('From CWD - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Not found');

// Reset
delete process.env.JWT_SECRET;

// Test 2: From script directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('From script dir - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Not found');

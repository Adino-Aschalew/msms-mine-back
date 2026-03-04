const path = require('path');

// Simulate the exact path from auth service
console.log('Auth service __dirname:', path.resolve(__dirname, 'src/modules/auth'));
console.log('Expected .env path:', path.resolve(__dirname, 'src/modules/auth/../../.env'));
console.log('Resolved path:', path.resolve(__dirname, '.env'));

// Test loading exactly like the auth service
require('dotenv').config({ path: path.resolve(__dirname, 'src/modules/auth/../../.env') });
console.log('JWT_SECRET after loading:', process.env.JWT_SECRET);

// Test with absolute path
const absolutePath = path.resolve(__dirname, '.env');
console.log('Absolute .env path:', absolutePath);
require('dotenv').config({ path: absolutePath });
console.log('JWT_SECRET with absolute path:', process.env.JWT_SECRET);

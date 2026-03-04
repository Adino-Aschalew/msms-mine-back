const fs = require('fs');

// Read current .env content
let envContent = fs.readFileSync('.env', 'utf8');

// Replace DB_PASSWORD line
envContent = envContent.replace('DB_PASSWORD=', 'DB_PASSWORD=');

// Write back to .env
fs.writeFileSync('.env', envContent);

console.log('✅ Fixed DB_PASSWORD in .env file');
console.log('🔍 Testing .env file reading...');

require('dotenv').config({ path: './.env' });
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

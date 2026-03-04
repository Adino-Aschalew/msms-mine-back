require('dotenv').config({ path: './.env' });

console.log('🔍 Testing JWT configuration...');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

if (process.env.JWT_SECRET) {
  console.log('✅ JWT secret loaded successfully');
} else {
  console.log('❌ JWT secret not found');
}

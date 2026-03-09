require('dotenv').config({ path: './.env' });

const app = require('./src/app');

console.log('Environment PORT from .env:', process.env.PORT);
console.log('Default PORT would be:', 9999);

const PORT = process.env.PORT || 9999;

console.log('Final PORT being used:', PORT);

app.listen(PORT, () => {
  console.log(`🚀 Microfinance System Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});

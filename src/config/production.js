const dotenv = require('dotenv');
const path = require('path');


dotenv.config({ path: path.join(__dirname, '../../.env') });

const productionConfig = {
  
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    reconnectAttempts: 3,
    reconnectDelay: 2000
  },
  
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },
  
  
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http:
      credentials: true
    }
  },
  
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    sessionSecret: process.env.SESSION_SECRET
  },
  
  
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, 
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'csv,xlsx,xls').split(','),
    destination: 'uploads/'
  },
  
  
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.FROM_EMAIL
  },
  
  
  system: {
    name: process.env.SYSTEM_NAME || 'Microfinance System',
    version: process.env.SYSTEM_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  },
  
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};


const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  console.error('\nPlease set these variables in your .env file');
  process.exit(1);
}

module.exports = productionConfig;

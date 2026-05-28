require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL (this machine): http://localhost:${PORT}/api`);
  console.log(`🔗 LAN: use http://<your-pc-ip>:${PORT}/api in mobile/.env as EXPO_PUBLIC_API_URL`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = server;

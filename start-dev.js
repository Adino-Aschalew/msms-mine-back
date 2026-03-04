const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Microfinance System with Nodemon...');

const nodemon = spawn('nodemon', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env }
});

nodemon.on('close', (code) => {
  console.log(`Nodemon exited with code ${code}`);
});

nodemon.on('error', (error) => {
  console.error('Failed to start nodemon:', error);
  process.exit(1);
});

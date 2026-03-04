// test-setup.js
require('dotenv').config({ path: '../config.env' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for async DB operations
jest.setTimeout(15000);

// Optional: silence console during tests
if (process.env.NODE_ENV === 'test') {
  // console.log = jest.fn();
  // console.warn = jest.fn();
  // console.error = jest.fn();
}

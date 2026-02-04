// Test setup file
require('dotenv').config({ path: '../config.env' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test timeout
jest.setTimeout(10000);

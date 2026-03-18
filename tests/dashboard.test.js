const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/config/database');

// Mock database pool/query
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  pool: { execute: jest.fn() }
}));

// Mock middlewares
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, role: 'SUPER_ADMIN' };
    next();
  },
  roleMiddleware: () => (req, res, next) => next(),
}));

describe('Admin Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dashboard data correctly', async () => {
    // Mock the many queries in getDashboard
    query.mockResolvedValue([[{ count: 100 }]]); // totalUsers, etc.

    const response = await request(app).get('/api/admin/dashboard');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.overview.totalUsers).toBe(100);
  });
});

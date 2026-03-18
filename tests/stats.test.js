const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

// Mock database pool
jest.mock('../src/config/database', () => ({
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn(),
  },
  query: jest.fn(),
}));

// Mock middlewares
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, role: 'SUPER_ADMIN' };
    next();
  },
  roleMiddleware: () => (req, res, next) => next(),
}));

describe('Admin Statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return admin statistics correctly', async () => {
    // Mock the two queries in getAdminStatistics
    pool.execute.mockResolvedValueOnce([
      [{ total_admins: 10, active_admins: 8, inactive_admins: 2 }]
    ]);
    pool.execute.mockResolvedValueOnce([
      [{ role: 'ADMIN', count: 5, active_count: 4 }]
    ]);

    const response = await request(app).get('/api/admin/statistics');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBe(10);
    expect(response.body.data.active).toBe(8);
  });
});

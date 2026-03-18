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

describe('System Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return system stats correctly', async () => {
    // Mock the 5 queries in getSystemStats
    pool.execute.mockResolvedValueOnce([[{ role: 'ADMIN', count: 1, active: 1 }]]); // userStats
    pool.execute.mockResolvedValueOnce([[{ status: 'PENDING', count: 1, totalAmount: 1000 }]]); // loanStats
    pool.execute.mockResolvedValueOnce([[{ status: 'ACTIVE', count: 1, totalBalance: 5000 }]]); // savingsStats
    pool.execute.mockResolvedValueOnce([[{ department: 'IT', employeeCount: 1 }]]); // departmentStats
    pool.execute.mockResolvedValueOnce([[{ month: '2024-01', newUsers: 1 }]]); // monthlyGrowth

    const response = await request(app).get('/api/admin/stats');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userStats).toBeDefined();
    expect(response.body.data.userStats[0].role).toBe('ADMIN');
  });
});

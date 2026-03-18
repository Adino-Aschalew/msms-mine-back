const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

// Mock database pool
jest.mock('../src/config/database', () => ({
  pool: {
    execute: jest.fn().mockResolvedValue([[]]),
    getConnection: jest.fn(),
  },
  query: jest.fn(),
}));

// Mock middlewares to bypass authentication
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, role: 'SUPER_ADMIN' };
    next();
  },
  roleMiddleware: () => (req, res, next) => next(),
}));

jest.mock('../src/middleware/audit', () => ({
  auditMiddleware: () => (req, res, next) => next(),
}));

describe('Admin Module Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.execute.mockResolvedValue([[]]);
  });

  describe('createFinanceAdmin', () => {
    it('should use id instead of user_id when checking for existing user', async () => {
      // Mock existing user check (success, no user found)
      pool.execute.mockResolvedValueOnce([[]]); // employee_id check
      pool.execute.mockResolvedValueOnce([[]]); // email check
      pool.execute.mockResolvedValueOnce([{ insertId: 1 }]); // insert user
      pool.execute.mockResolvedValueOnce([[]]); // insert profile

      const response = await request(app)
        .post('/api/admin/finance-admins')
        .send({
          employee_id: 'FIN001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          department: 'Finance',
          job_title: 'Accountant',
          password: 'Password123'
        });

      // Verify the first call to pool.execute
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM users WHERE employee_id = ?'),
        expect.any(Array)
      );

      // Verify the second call to pool.execute
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM users WHERE email = ?'),
        expect.any(Array)
      );
    });
  });

  describe('getFinanceAdmins', () => {
    it('should use u.id instead of u.user_id in query', async () => {
      await request(app).get('/api/admin/finance-admins');

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('u.id'),
        // No second argument for this specific query
      );
      
      // Get the call and verify it doesn't contain user_id
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).not.toContain('u.user_id');
    });
  });

  describe('updateFinanceAdmin', () => {
    it('should use id instead of user_id in UPDATE where clause', async () => {
      pool.execute.mockResolvedValueOnce([[{ id: 1 }]]); // check if exists
      pool.execute.mockResolvedValueOnce([[]]); // update users
      pool.execute.mockResolvedValueOnce([[]]); // update profiles

      await request(app)
        .put('/api/admin/finance-admins/1')
        .send({ first_name: 'Updated' });

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET first_name = ? WHERE id = ?'),
        expect.any(Array)
      );
    });
  });
});

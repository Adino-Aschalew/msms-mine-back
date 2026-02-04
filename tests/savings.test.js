const request = require('supertest');
const app = require('../src/app');

describe('Savings Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        employee_id: 'ADMIN001',
        password: 'admin123'
      });
    token = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  describe('POST /api/savings/account', () => {
    it('should create savings account with valid data', async () => {
      const response = await request(app)
        .post('/api/savings/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          saving_percentage: 20
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accountId');
    });

    it('should reject invalid saving percentage', async () => {
      const response = await request(app)
        .post('/api/savings/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          saving_percentage: 10 // Below minimum of 15
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject saving percentage above maximum', async () => {
      const response = await request(app)
        .post('/api/savings/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          saving_percentage: 70 // Above maximum of 65
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/savings/account', () => {
    it('should get savings account details', async () => {
      const response = await request(app)
        .get('/api/savings/account')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('current_balance');
      expect(response.body.data).toHaveProperty('saving_percentage');
    });
  });

  describe('PUT /api/savings/account/percentage', () => {
    it('should update saving percentage', async () => {
      const response = await request(app)
        .put('/api/savings/account/percentage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          saving_percentage: 25
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/savings/transactions', () => {
    it('should get savings transactions', async () => {
      const response = await request(app)
        .get('/api/savings/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/savings/transactions?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/savings/contribute', () => {
    it('should add savings contribution', async () => {
      const response = await request(app)
        .post('/api/savings/contribute')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 500,
          reference_id: 'TEST001',
          description: 'Test contribution'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('newBalance');
    });

    it('should reject invalid amount', async () => {
      const response = await request(app)
        .post('/api/savings/contribute')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all savings endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/savings/account' },
        { method: 'get', path: '/api/savings/transactions' },
        { method: 'post', path: '/api/savings/account' },
        { method: 'put', path: '/api/savings/account/percentage' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });
  });
});

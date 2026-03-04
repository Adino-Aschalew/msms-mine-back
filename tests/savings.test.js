// tests/savings.test.js
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('./testDbSetup');

let token, userId;

beforeAll(async () => {
  await setupTestDatabase();

  // Login to get token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ employee_id: 'TEST001', password: 'password123' });

  if (!loginRes.body.data?.token) {
    console.error('Login failed:', loginRes.body);
    throw new Error('Cannot get token');
  }

  token = loginRes.body.data.token;
  userId = loginRes.body.data.user.id;
});

afterAll(async () => {
  await cleanupTestDatabase();
});

describe('Savings Endpoints', () => {
  it('should create savings account', async () => {
    const res = await request(app)
      .post('/api/savings/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ salary: 5000, percentage: 15 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid percentage', async () => {
    const res = await request(app)
      .post('/api/savings/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ salary: 5000, percentage: 10 }); // below 15%

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject above maximum percentage', async () => {
    const res = await request(app)
      .post('/api/savings/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ salary: 5000, percentage: 70 }); // above 65%

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

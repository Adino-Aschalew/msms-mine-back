const request = require('supertest');
const app = require('../src/app');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          employee_id: 'ADMIN001',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          employee_id: 'ADMIN001',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require employee_id and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employee_id: 'TEST001',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
    });

    it('should reject mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employee_id: 'TEST002',
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password123',
          confirm_password: 'different'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employee_id: 'TEST003'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          employee_id: 'ADMIN001',
          password: 'admin123'
        });
      token = loginResponse.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          employee_id: 'ADMIN001',
          password: 'admin123'
        });
      token = loginResponse.body.data.token;
    });

    it('should change password with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'admin123',
          new_password: 'newpassword123',
          confirm_password: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword123',
          confirm_password: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

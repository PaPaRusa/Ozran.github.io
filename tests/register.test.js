const request = require('supertest');

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

const mockInsert = jest.fn().mockResolvedValue({ error: null });
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: () => ({ insert: mockInsert }),
  })),
}));

function createApp() {
  jest.resetModules();
  process.env.JWT_SECRET = 'test-secret';
  process.env.SUPABASE_URL = 'https://example.com';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  return require('../server');
}

describe('POST /register', () => {
  const validData = {
    username: 'user',
    email: 'user@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  test('returns error when passwords do not match', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/register')
      .send({ ...validData, confirmPassword: 'Mismatch1!' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Passwords do not match' });
  });

  test('enforces rate limiting', async () => {
    const app = createApp();
    for (let i = 0; i < 100; i++) {
      await request(app)
        .post('/register')
        .send({
          ...validData,
          email: `user${i}@example.com`,
          username: `user${i}`,
        });
    }

    const res = await request(app)
      .post('/register')
      .send({
        ...validData,
        email: 'user101@example.com',
        username: 'user101',
      });

    expect(res.status).toBe(429);
  });
});

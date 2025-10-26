const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

// Set required environment variables before importing the app
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

const app = require('../server');

function makeRequest(headers = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/logout',
        method: 'POST',
        headers,
      };

      const req = http.request(options, (res) => {
        res.resume();
        res.on('end', () => {
          server.close();
          resolve(res);
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      req.end();
    });
  });
}

test('HTTP request does not set Secure flag', async () => {
  const res = await makeRequest();
  const cookie = res.headers['set-cookie'][0] || '';
  assert.ok(!cookie.includes('Secure'));
});

test('HTTPS request sets Secure flag', async () => {
  const res = await makeRequest({ 'X-Forwarded-Proto': 'https' });
  const cookie = res.headers['set-cookie'][0] || '';
  assert.ok(cookie.includes('Secure'));
});

  test('USE_HTTPS env forces Secure cookie', async () => {
    process.env.USE_HTTPS = 'true';
    const res = await makeRequest();
    const cookie = res.headers['set-cookie'][0] || '';
    assert.ok(cookie.includes('Secure'));
    delete process.env.USE_HTTPS;
  });

  test('logout cookie clears across all paths', async () => {
    const res = await makeRequest();
    const cookie = res.headers['set-cookie'][0] || '';
    assert.ok(cookie.includes('Path=/'));
  });

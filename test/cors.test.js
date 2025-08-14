process.env.CLIENT_URL = 'https://allowed.com';

const test = require('node:test');
const assert = require('node:assert');
const { corsOptions, allowedOrigins } = require('../config');

test('allows configured origin', () => {
  corsOptions.origin(allowedOrigins[0], (err) => {
    assert.ifError(err);
  });
});

test('rejects unexpected origin', () => {
  corsOptions.origin('https://evil.com', (err) => {
    assert.ok(err);
  });
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Redirect requests ending with .html to their extensionless counterparts
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    return res.redirect(301, req.path.slice(0, -5));
  }
  next();
});

// Serve static files with extensionless URLs
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html']
  })
);

// Rate limiter for sensitive endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Routes
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');

app.use(authRoutes);
app.use('/api', limiter, emailRoutes);

// Fallback to index.html for SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;

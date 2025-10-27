const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getDB, closeDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-secret-key-change-in-production';

// CORS configuration
const corsOptions = {
  origin: [
    'https://tradetrakr.com',
    'https://www.tradetrakr.com',
    'https://vincentlaaa.github.io',
    'http://localhost:3000' // For local testing
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Email validation regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/signup - Collect email for 7-day free trial
app.post('/api/signup', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const db = getDB();

  // Check for duplicate and insert
  db.run(
    'INSERT INTO subscribers (email) VALUES (?)',
    [trimmedEmail],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log(`Duplicate signup attempt: ${trimmedEmail}`);
          return res.status(409).json({ error: 'Already subscribed' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`New subscriber: ${trimmedEmail} (ID: ${this.lastID})`);
      res.status(200).json({ message: 'OK' });
    }
  );
});

// GET /api/list - Admin endpoint to view subscribers (protected)
app.get('/api/list', (req, res) => {
  const secret = req.headers['x-admin-secret'];

  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = getDB();

  db.all('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ 
      count: rows.length,
      subscribers: rows 
    });
  });
});

// GET /api/export - Admin endpoint to export subscribers as CSV (protected)
app.get('/api/export', (req, res) => {
  const secret = req.headers['x-admin-secret'];

  if (!secret || secret !== ADMIN_SECRET) {
    console.log(`Unauthorized export attempt from ${req.ip} at ${new Date().toISOString()}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = getDB();

  db.all('SELECT email, created_at FROM subscribers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log(`Admin CSV export accessed: ${rows.length} subscribers exported at ${new Date().toISOString()}`);

    // Convert to CSV format
    const csvHeader = 'email,created_at\n';
    const csvRows = rows.map(row => {
      const email = `"${row.email}"`;
      const created_at = `"${row.created_at}"`;
      return `${email},${created_at}`;
    }).join('\n');
    
    const csv = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tradetrakr-subscribers-${Date.now()}.csv"`);
    res.status(200).send(csv);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TradeTrakR Signup API running on port ${PORT}`);
  console.log(`📧 Signup endpoint: http://localhost:${PORT}/api/signup`);
  console.log(`🔐 Admin endpoint: http://localhost:${PORT}/api/list`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  closeDB();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  closeDB();
  process.exit(0);
});


const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });

const authRoutes = require('./routes/auth');
const claimsRoutes = require('./routes/claims');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Health Expense Reimbursement API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'เกิดข้อผิดพลาดในระบบ',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'ไม่พบ API endpoint นี้' });
});

// Export the Express app as a Cloud Function
exports.apiHealthExpense = functions.https.onRequest(app); 
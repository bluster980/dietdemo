// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// server.js - Minimal Production-Ready Setup
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import your existing modules
const { encodeImage, decodeFromImageUrl, ensureUploadsDir } = require('./Steganography');
const { jwtCreation } = require('./PhoneVerification');
const { handleGenerateUploadUrl, handleVerifyUpload } = require('./r2Upload');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// Essential Middleware (Keep These!)
// =====================================

// 1. Security headers - Prevents common vulnerabilities
app.use(helmet());

// 2. CORS - Required for your Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// 3. JSON parsing with size limit
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// 4. Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =====================================
// Initialize
// =====================================
ensureUploadsDir();

// =====================================
// Routes (All in one place - it's fine!)
// =====================================

// Health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'Diet Delta API',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime() 
  });
});

// Steganography routes
app.post('/api/encode', asyncHandler(encodeImage));
app.post('/api/decode', asyncHandler(decodeFromImageUrl));

// Auth routes
app.post('/api/auth/jwt', asyncHandler(jwtCreation));

// R2 Upload routes
app.post('/api/upload/generate-url', asyncHandler(handleGenerateUploadUrl));
app.post('/api/upload/verify', asyncHandler(handleVerifyUpload));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================
// Error Handlers
// =====================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
  });
});

// =====================================
// Start Server
// =====================================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});

module.exports = app;

const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');

//  CREATE UPLOADS DIRECTORY AUTOMATICALLY
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Upload directory created at:', uploadDir);
} else {
    console.log('✅ Upload directory exists at:', uploadDir);
}

// ── SSLCommerz callback routes MUST be BEFORE CORS ──
// These are form POSTs from SSLCommerz's payment page (browser redirect)
// and server-to-server IPN calls — they should NOT be blocked by CORS.
const paymentController = require('./controllers/payment.controller');
app.post('/api/payments/success', express.urlencoded({ extended: true }), express.json(), paymentController.sslCommerzSuccess);
app.post('/api/payments/fail', express.urlencoded({ extended: true }), express.json(), paymentController.sslCommerzFail);
app.post('/api/payments/cancel', express.urlencoded({ extended: true }), express.json(), paymentController.sslCommerzCancel);
app.post('/api/payments/ipn', express.urlencoded({ extended: true }), express.json(), paymentController.sslCommerzIpn);
// Also handle GET for browser direct access (redirect back from SSLCommerz)
app.get('/api/payments/success', paymentController.sslCommerzSuccess);
app.get('/api/payments/fail', paymentController.sslCommerzFail);
app.get('/api/payments/cancel', paymentController.sslCommerzCancel);

// ✅ CORS for all OTHER routes
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://pothik-six.vercel.app",
      // SSLCommerz callback origins (sandbox + live)
      "https://sandbox.sslcommerz.com",
      "https://securepay.sslcommerz.com",
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".sslcommerz.com")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Pothik Backend API',
        version: '1.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            verify: 'GET /api/auth/verify',
            createBlog: 'POST /api/blog/blogs'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
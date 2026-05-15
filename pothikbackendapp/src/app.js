const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');

// ✅ CREATE UPLOADS DIRECTORY AUTOMATICALLY
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Upload directory created at:', uploadDir);
} else {
    console.log('✅ Upload directory exists at:', uploadDir);
}

// ✅ CORS must be first, separate from other middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://pothik-six.vercel.app",
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
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
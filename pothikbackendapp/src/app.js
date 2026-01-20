const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');
<<<<<<< HEAD
// const morgan = require('morgan');
=======
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
>>>>>>> 60dba8ee9da8e58d56001e58b5d8276edcbc2763

// ✅ CREATE UPLOADS DIRECTORY AUTOMATICALLY
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created at:', uploadDir);
} else {
  console.log('✅ Upload directory exists at:', uploadDir);
}

app.use([cors({
    origin: 'http://localhost:5173',  //  frontend URL
    credentials: true
}), express.json()]);

app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files statically with absolute path
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
<<<<<<< HEAD
            verify: 'GET /api/auth/verify'
=======
            verify: 'GET /api/auth/verify',
            createBlog: 'POST /api/blog/blogs'
>>>>>>> 60dba8ee9da8e58d56001e58b5d8276edcbc2763
        }
    });
});

module.exports = app;
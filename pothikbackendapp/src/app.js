const express = require('express');
const routes = require('./routes');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Pothik Backend API',
        version: '1.0.0',
        endpoints: {
            register: 'POST /api/users/register',
            login: 'POST /api/users/login',
            health: 'GET /api/health'
        }
    });
});

module.exports = app;

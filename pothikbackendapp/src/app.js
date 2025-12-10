const express = require('express');
const routes = require('./routes');
const app = express();

const cors = require('cors');
const morgan = require('morgan');


// Middleware
app.use([cors(), morgan('dev'), express.json()]);

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

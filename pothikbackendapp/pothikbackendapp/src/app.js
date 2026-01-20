const express = require('express');
const routes = require('./routes');
const app = express();

const cors = require('cors');
const morgan = require('morgan');


app.use([cors({
    origin: 'http://localhost:5173',  //  frontend URL
    credentials: true
}), morgan('dev'), express.json()]);

app.use(express.urlencoded({ extended: true }));

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
            verify: 'GET /api/auth/verify'
}
    });
});

module.exports = app;

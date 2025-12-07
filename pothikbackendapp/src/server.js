require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/db');
const keepAlive = require('./jobs/keepAlive.job');
const PORT = process.env.PORT || 3000;

// Start keepalive job to prevent connection timeout
keepAlive();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

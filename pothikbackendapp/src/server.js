require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/db');
const keepAlive = require('./jobs/keepAlive.job');
const cleanupSessionsJob = require("./jobs/cleanupSessions.job");
const PORT = process.env.PORT || 5000;

// Start keepalive job to prevent connection timeout
keepAlive();
cleanupSessionsJob();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

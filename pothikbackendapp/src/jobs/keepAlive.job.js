const { sequelize } = require('../config/db');

// Keep database connection alive by pinging every 5 minutes
const keepAlive = () => {
    setInterval(async () => {
        try {
            await sequelize.query('SELECT 1');
        } catch (err) {
            console.error('Keepalive failed:', err.message);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
};

module.exports = keepAlive;

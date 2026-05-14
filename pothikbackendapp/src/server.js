require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Simple startup (SAFE)
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await sequelize.authenticate();
        console.log("DB connected successfully");
    } catch (err) {
        console.error("DB connection failed:", err.message);
    }
});
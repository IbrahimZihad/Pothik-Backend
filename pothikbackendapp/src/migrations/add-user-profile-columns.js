// Migration script to add User Profile columns (country, street_address)
// Run with: node src/migrations/add-user-profile-columns.js

require('dotenv').config();
const sequelize = require('../config/sequelize');

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        console.log('🔄 Running migration: Adding User Profile columns...');

        // Add country column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN country VARCHAR(255) NULL
            `);
            console.log('✅ Added country column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('⏭️ country column already exists, skipping...');
            } else {
                throw err;
            }
        }

        // Add street_address column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN street_address VARCHAR(255) NULL
            `);
            console.log('✅ Added street_address column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('⏭️ street_address column already exists, skipping...');
            } else {
                throw err;
            }
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('User profile fields are now available.\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrate();

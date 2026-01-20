// Migration script to add Google Auth columns
// Run with: node src/migrations/add-google-auth-columns.js

require('dotenv').config();
const sequelize = require('../config/sequelize');

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        console.log('🔄 Running migration: Adding Google Auth columns...');

        // Add auth_provider column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local'
            `);
            console.log('✅ Added auth_provider column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('⏭️ auth_provider column already exists, skipping...');
            } else {
                throw err;
            }
        }

        // Add firebase_uid column
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN firebase_uid VARCHAR(255) NULL UNIQUE
            `);
            console.log('✅ Added firebase_uid column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('⏭️ firebase_uid column already exists, skipping...');
            } else {
                throw err;
            }
        }

        // Modify password_hash to allow NULL
        try {
            await sequelize.query(`
                ALTER TABLE users 
                MODIFY COLUMN password_hash VARCHAR(255) NULL
            `);
            console.log('✅ Modified password_hash to allow NULL');
        } catch (err) {
            console.log('⚠️ Could not modify password_hash:', err.message);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('You can now use Google authentication.\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrate();

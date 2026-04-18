// Migration script to add SSLCommerz-related columns in payments table
// Run with: node src/migrations/add-sslcommerz-columns-to-payments.js

require('dotenv').config();
const sequelize = require('../config/sequelize');

const databaseName = process.env.DB_NAME;

async function columnExists(columnName) {
    const [rows] = await sequelize.query(
        `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = :databaseName
       AND TABLE_NAME = 'payments'
       AND COLUMN_NAME = :columnName
     LIMIT 1`,
        {
            replacements: { databaseName, columnName },
        }
    );

    return rows.length > 0;
}

async function addColumnIfMissing(columnName, columnDefinition) {
    if (await columnExists(columnName)) {
        console.log(`ℹ️ Column already exists: ${columnName}`);
        return;
    }

    await sequelize.query(`ALTER TABLE payments ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`✅ Added column: ${columnName}`);
}

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        console.log('🔄 Running migration: add SSLCommerz columns to payments...');

        await addColumnIfMissing('currency', "VARCHAR(10) DEFAULT 'BDT' AFTER amount");
        await addColumnIfMissing('tran_id', 'VARCHAR(100) UNIQUE NULL AFTER method');
        await addColumnIfMissing('val_id', 'VARCHAR(120) NULL AFTER tran_id');
        await addColumnIfMissing('bank_tran_id', 'VARCHAR(120) NULL AFTER val_id');
        await addColumnIfMissing('session_key', 'VARCHAR(255) NULL AFTER bank_tran_id');
        await addColumnIfMissing('gateway_response', 'LONGTEXT NULL AFTER session_key');

        await sequelize.query(
            "ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded') DEFAULT 'pending'"
        );
        console.log('✅ Updated status enum on payments table');

        console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrate();

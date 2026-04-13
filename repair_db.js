import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

const TENANT_TABLE_LIST = [
    'barcodes', 'cash_refunds', 'category_gst', 'credit_notes', 'dayout_reports',
    'edit_logs', 'item_replacements', 'login_logs', 'masterdata', 'password_resets',
    'purchase_edit_logs', 'purchases', 'replacements', 'sales_items', 'sales_users',
    'shop_config', 'stock_adjustments', 'suppliers', 'system_stock', 'users'
];

async function repairDatabase(dbName) {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    };

    const conn = await mysql.createConnection(config);

    try {
        console.log(`🔧 Repairing database: ${dbName}`);

        // 1. Get existing tables in target DB
        await conn.query(`USE \`${dbName}\``);
        const [existingRows] = await conn.execute("SHOW TABLES");
        const existingTables = existingRows.map(r => Object.values(r)[0]);

        // 2. Switch to template DB to get schemas
        await conn.query(`USE garment_db`);

        for (const table of TENANT_TABLE_LIST) {
            if (existingTables.includes(table)) {
                console.log(`✅ Table ${table} already exists.`);
                continue;
            }

            console.log(`🛠️ Creating missing table: ${table}`);
            try {
                const [schemaResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
                let createSql = schemaResult[0]['Create Table'].replace(/AUTO_INCREMENT=\d+/g, '');

                // Switch back to target DB to create
                await conn.query(`USE \`${dbName}\``);
                await conn.execute(createSql);
                await conn.query(`USE garment_db`); // Switch back for next loop
                console.log(`  └─ Done.`);
            } catch (e) {
                console.error(`  └─ ❌ Error cloning ${table}: ${e.message}`);
            }
        }

        console.log(`🏁 Repair of ${dbName} completed.`);
    } catch (err) {
        console.error("❌ Fatal Error:", err.message);
    } finally {
        await conn.end();
    }
}

// Get DB name from command line or use a default
const targetDb = process.argv[2] || 'gar_db_shah';
repairDatabase(targetDb);

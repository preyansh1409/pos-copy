import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function checkTables() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'garment_db', // Template DB
        ssl: { rejectUnauthorized: false }
    };

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute("SHOW TABLES");
        console.log("📋 Tables in garment_db:");
        console.log(rows.map(r => Object.values(r)[0]).join(', '));
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await connection.end();
    }
}

checkTables();

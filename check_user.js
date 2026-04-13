import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function checkUser() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME || 'superadmin_db',
        ssl: { rejectUnauthorized: false }
    };

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute("SELECT id, username, role FROM super_admins");
        console.log("👥 Existing Super Admins:");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await connection.end();
    }
}

checkUser();

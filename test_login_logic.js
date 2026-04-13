import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function testLogin() {
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
        const username = 'super';
        const passwordAttempt = 'admin';

        const [rows] = await connection.execute("SELECT * FROM super_admins WHERE username=?", [username]);
        if (rows.length === 0) {
            console.log("❌ User not found");
            return;
        }

        const user = rows[0];
        console.log("🔍 Found user:", user.username);
        console.log("🔍 Stored hash:", user.password);

        const isMatch = await bcrypt.compare(passwordAttempt, user.password);
        if (isMatch) {
            console.log("✅ Login MATCH successful!");
        } else {
            console.log("❌ Login FAILED: Password mismatch");
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await connection.end();
    }
}

testLogin();

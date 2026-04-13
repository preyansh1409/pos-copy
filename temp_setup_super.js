import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function setupSuper() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME || 'superadmin_db',
        ssl: { rejectUnauthorized: false }
    };

    console.log("📡 Connecting to:", dbConfig.host);
    const connection = await mysql.createConnection(dbConfig);

    try {
        const username = 'super';
        const rawPassword = 'admin';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 1. Ensure table exists (optional but safe)
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'superadmin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

        // 2. Clear existing
        await connection.execute("DELETE FROM super_admins WHERE username = ?", [username]);

        // 3. Insert Super Admin
        await connection.execute(
            "INSERT INTO super_admins (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, 'superadmin']
        );

        console.log(`✅ Super Admin created successfully!`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔐 Password: ${rawPassword}`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await connection.end();
    }
}

setupSuper();

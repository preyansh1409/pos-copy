import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function createAdmin() {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'superadmin_db',
    ssl: { rejectUnauthorized: false }
  };

  const connection = await mysql.createConnection(dbConfig);

  try {
    const username = 'Admin@123';
    const rawPassword = 'Preyansh1409';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 1. Clear existing (just in case)
    await connection.execute("DELETE FROM super_admins WHERE username = ?", [username]);

    // 2. Insert Super Admin
    await connection.execute(
      "INSERT INTO super_admins (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, 'superadmin']
    );

    console.log(`✅ Super Admin created: ${username}`);

    // 3. Create a test client if not exists
    const clientUsername = 'Preyansh';
    const clientHashedPassword = await bcrypt.hash('Preyansh1409', 10);

    await connection.execute("DELETE FROM clients WHERE username = ?", [clientUsername]);
    await connection.execute(
      "INSERT INTO clients (company_name, username, password, role, db_name) VALUES (?, ?, ?, ?, ?)",
      ['Prestige Garments', clientUsername, clientHashedPassword, 'admin', 'garment_db']
    );

    console.log(`✅ Test Client created: ${clientUsername}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await connection.end();
  }
}

createAdmin();

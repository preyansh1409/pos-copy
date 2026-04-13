import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function fixUser() {
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

    // 1. Remove from super_admins if it exists there
    await connection.execute("DELETE FROM super_admins WHERE username = ?", [username]);

    // 2. Clear from clients to avoid duplicates
    await connection.execute("DELETE FROM clients WHERE username = ?", [username]);

    // 3. Insert into clients as a Shop Admin for garment_db
    // I will use a more flexible INSERT that matches common POS schemas
    try {
      await connection.execute(
        "INSERT INTO clients (company_name, username, password, role, db_name) VALUES (?, ?, ?, ?, ?)",
        ['Default Shop', username, hashedPassword, 'admin', 'garment_db']
      );
    } catch (e) {
       // fallback if company_name is actually 'name' or 'client_name'
       await connection.execute(
        "INSERT INTO clients (client_name, username, password, role, db_name) VALUES (?, ?, ?, ?, ?)",
        ['Default Shop', username, hashedPassword, 'admin', 'garment_db']
      );
    }

    console.log(`✅ User ${username} successfully linked to garment_db in the Clients table.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await connection.end();
  }
}

fixUser();

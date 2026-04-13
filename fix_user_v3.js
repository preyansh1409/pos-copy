import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function fixUserFinalFinal() {
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

    // Get table structure to be sure
    const [columns] = await connection.execute("SHOW COLUMNS FROM clients");
    const colNames = columns.map(c => c.Field);
    console.log("Columns in clients:", colNames);

    await connection.execute("DELETE FROM super_admins WHERE username = ?", [username]);
    await connection.execute("DELETE FROM clients WHERE username = ?", [username]);

    const data = {
        username: username,
        password: hashedPassword,
        role: 'admin',
        db_name: 'garment_db',
        email: 'admin@garment.com',
        phone: '0000000000',
        business_name: 'Prestige Garments',
        client_name: 'Preyansh'
    };

    // Keep only common columns
    const finalData = {};
    Object.keys(data).forEach(key => {
        if (colNames.includes(key)) {
            finalData[key] = data[key];
        }
    });

    const keys = Object.keys(finalData);
    const values = Object.values(finalData);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO clients (${keys.join(', ')}) VALUES (${placeholders})`;
    await connection.execute(sql, values);

    console.log(`✅ Success! Admin@123 is now a Client linked to garment_db.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await connection.end();
  }
}

fixUserFinalFinal();

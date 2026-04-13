import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function importData() {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'garment_db',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  };

  const connection = await mysql.createConnection(dbConfig);
  console.log("📡 Connected to garment_db");

  try {
    const sqlFile = fs.readFileSync('backend/database.sql', 'utf8');
    
    // We only want the INSERT statements for the tenant tables
    const lines = sqlFile.split('\n');
    let currentSql = "";
    let count = 0;

    console.log("⏳ Processing SQL file...");

    for (let line of lines) {
      if (line.trim().startsWith('INSERT INTO') || currentSql !== "") {
        currentSql += line + "\n";
        if (line.trim().endsWith(';')) {
          try {
            await connection.execute(currentSql);
            count++;
            if (count % 50 === 0) console.log(`✅ Imported ${count} data batches...`);
          } catch (e) {
            // Ignore duplicate errors
            if (!e.message.includes('Duplicate entry')) {
                 // console.log("⚠️ Skip line:", e.message);
            }
          }
          currentSql = "";
        }
      }
    }

    console.log(`🎉 Finished! Successfully imported ${count} data categories/item clusters.`);

  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  } finally {
    await connection.end();
  }
}

importData();

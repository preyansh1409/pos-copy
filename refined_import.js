import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function fullDataImportRefined() {
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
  console.log("📡 Connected to garment_db for refined import");

  try {
    const sqlFile = fs.readFileSync('backend/database.sql', 'utf8');
    
    // Split into individual statements by semicolon
    const statements = sqlFile.split(/;\s*$/m);
    let count = 0;

    console.log(`⏳ Processing ${statements.length} potential SQL statements...`);

    for (let statement of statements) {
      const trimmed = statement.trim();
      if (trimmed.startsWith('INSERT INTO')) {
          try {
            await connection.execute(trimmed + ";");
            count++;
            if (count % 100 === 0) console.log(`✅ Imported ${count} data blocks...`);
          } catch (e) {
            // Ignore duplicates
          }
      }
    }

    console.log(`🎉 Finished! Successfully imported ${count} data blocks containing your categories and items.`);

  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  } finally {
    await connection.end();
  }
}

fullDataImportRefined();

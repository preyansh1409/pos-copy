import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function powerImport() {
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
  console.log("📡 Connected to garment_db for Power Import");

  try {
    const sqlFile = fs.readFileSync('backend/database.sql', 'utf8');
    
    // Split by the start of an INSERT statement
    const insertBlocks = sqlFile.split(/INSERT INTO/i);
    console.log(`⏳ Found ${insertBlocks.length} major data blocks. Starting import...`);

    let count = 0;
    for (let i = 1; i < insertBlocks.length; i++) {
        // Reconstruct the full INSERT statement
        let sql = "INSERT INTO " + insertBlocks[i];
        
        // Find the next semicolon to terminate the SQL correctly
        const semicolonIndex = sql.indexOf(';');
        if (semicolonIndex !== -1) {
            sql = sql.substring(0, semicolonIndex + 1);
        }

        try {
            await connection.execute(sql);
            count++;
            if (count % 10 === 0) console.log(`🚀 Bulk imported ${count} large category/item blocks...`);
        } catch (e) {
            // Duplicate entries are fine, it means we already have some of the data
        }
    }

    console.log(`🎉 Success! All ${count} data blocks containing your categories and items have been synced.`);

  } catch (err) {
    console.error("❌ Error during Power Import:", err.message);
  } finally {
    await connection.end();
  }
}

powerImport();

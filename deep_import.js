import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function fullDataImport() {
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
  console.log("📡 Connected to garment_db for deep import");

  try {
    const sqlFile = fs.readFileSync('backend/database.sql', 'utf8');
    
    // List of critical tables to ensure are fully imported
    const targetTables = [
      'masterdata', 
      'system_stock', 
      'purchases', 
      'purchase_items', 
      'sales', 
      'sales_items', 
      'category_gst',
      'barcodes'
    ];

    const lines = sqlFile.split('\n');
    let currentSql = "";
    let count = 0;
    let inTargetTable = false;

    console.log("⏳ Deep scanning for inventory data...");

    for (let line of lines) {
      const trimmed = line.trim();
      
      // Detect if we are starting an INSERT for a target table
      if (trimmed.startsWith('INSERT INTO')) {
          const tableNameMatch = trimmed.match(/INSERT INTO `([^`]+)`/);
          if (tableNameMatch && targetTables.includes(tableNameMatch[1])) {
              inTargetTable = true;
          } else {
              inTargetTable = false;
          }
      }

      if (inTargetTable || currentSql !== "") {
        currentSql += line + "\n";
        if (trimmed.endsWith(';')) {
          if (inTargetTable) {
            try {
              await connection.execute(currentSql);
              count++;
              if (count % 20 === 0) console.log(`✅ Progress: ${count} batches imported...`);
            } catch (e) {
              // Ignore duplicates
            }
          }
          currentSql = "";
          inTargetTable = false; // Reset until next INSERT
        }
      }
    }

    console.log(`🎉 Finished! Successfully performed a deep import of ${count} inventory batches.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await connection.end();
  }
}

fullDataImport();

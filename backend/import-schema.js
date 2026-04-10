import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 4000,
  database: "garment_db",
  ssl: {
    rejectUnauthorized: false
  }
};

async function importSchema() {
  let connection;
  try {
    console.log("🔗 Connecting to garment_db on TiDB Cloud...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!");

    console.log("📖 Reading tenant_schema_utf8.sql...");
    const content = fs.readFileSync("tenant_schema_utf8.sql", "utf8");
    
    // Split by lines
    const lines = content.split('\r\n').join('\n').split('\n');
    
    // Find where the real SQL starts
    const firstSqlIndex = lines.findIndex(line => 
      line.trim().toUpperCase().startsWith('CREATE TABLE') || 
      line.trim().toUpperCase().startsWith('DROP TABLE') || 
      line.trim().toUpperCase().startsWith('SET ')
    );
    
    if (firstSqlIndex === -1) {
        console.log("❌ No SQL found in file.");
        return;
    }

    const sqlContent = lines.slice(firstSqlIndex).join('\n');
    
    // Improved split: handle semicolons better if possible, but for simple schemas split by ; is usually okay
    // We will filter out comments too
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`🔨 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await connection.query(stmt);
            successCount++;
        } catch (stmtErr) {
            errorCount++;
            console.error(`❌ Statement ${i+1} failed:`, stmtErr.message);
            console.log("Offending SQL start:", stmt.substring(0, 100));
        }
    }

    console.log(`✨ Done. Success: ${successCount}, Errors: ${errorCount}`);

  } catch (err) {
    console.error("❌ Global Error:", err);
  } finally {
    if (connection) await connection.end();
  }
}

importSchema();

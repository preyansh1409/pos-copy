import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 4000,
  database: "garment_db",
  multipleStatements: true,
  ssl: {
    rejectUnauthorized: false
  }
};

async function forceImport() {
  let connection;
  try {
    console.log("🔗 Connecting with multipleStatements: true...");
    connection = await mysql.createConnection(dbConfig);
    
    // Read and clean
    const content = fs.readFileSync("tenant_schema_utf8.sql", "utf-8");
    const lines = content.split('\n');
    const firstSql = lines.findIndex(l => l.trim().toUpperCase().startsWith('CREATE TABLE'));
    const sql = lines.slice(firstSql).join('\n');

    console.log("🚀 Executing entire SQL block...");
    await connection.query(sql);
    console.log("✅ Success!");

    const [rows] = await connection.query("SHOW TABLES");
    console.log(`📊 Total tables: ${rows.length}`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    if (connection) await connection.end();
  }
}

forceImport();

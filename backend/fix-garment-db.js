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
  ssl: {
    rejectUnauthorized: false
  }
};

async function fixGarmentDb() {
  let connection;
  try {
    console.log("🔗 Connecting to TiDB garment_db...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!");

    console.log("📖 Reading and cleaning schema file...");
    const content = fs.readFileSync("tenant_schema_utf8.sql", "utf-8");
    const lines = content.split('\n');
    
    // Find the real start of SQL
    const firstSqlIndex = lines.findIndex(line => 
      line.trim().toUpperCase().startsWith('CREATE TABLE') || 
      line.trim().toUpperCase().startsWith('DROP TABLE') || 
      line.trim().toUpperCase().startsWith('SET ')
    );
    
    if (firstSqlIndex === -1) {
      throw new Error("Could not find start of SQL content");
    }

    const sqlContent = lines.slice(firstSqlIndex).join('\n');
    
    // Split by semicolon, carefully
    const statements = sqlContent.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`🔨 Found ${statements.length} statements. Executing...`);
    
    let successCount = 0;
    let failCount = 0;

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
        successCount++;
      } catch (err) {
        // If it's a table already exists error, we count it as a partial success
        if (err.message.includes("already exists")) {
            console.log(`ℹ️ Skipping statement: ${err.message.split('\'')[1]} already exists`);
            successCount++;
        } else {
            console.error(`❌ Failed statement: ${stmt.substring(0, 50)}...`);
            console.error(`   Error: ${err.message}`);
            failCount++;
        }
      }
    }

    console.log(`✨ Migration complete. Successes: ${successCount}, Failures: ${failCount}`);

    // Verify final table count
    const [rows] = await connection.query("SHOW TABLES");
    console.log(`📊 Total tables in garment_db now: ${rows.length}`);
    rows.forEach(r => console.log(` - ${Object.values(r)[0]}`));

  } catch (err) {
    console.error("❌ Fatal Error:", err);
  } finally {
    if (connection) await connection.end();
  }
}

fixGarmentDb();

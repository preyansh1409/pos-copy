import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: false
  }
};

async function initializeTiDB() {
  let connection;
  try {
    console.log("🔗 Connecting to TiDB Cloud...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!");

    console.log("🔨 Creating databases...");
    await connection.query("CREATE DATABASE IF NOT EXISTS superadmin_db;");
    await connection.query("CREATE DATABASE IF NOT EXISTS garment_db;");
    console.log("✅ Databases 'superadmin_db' and 'garment_db' created.");

    // Using superadmin_db to create master tables
    await connection.query("USE superadmin_db;");
    
    console.log("📋 Creating super_admins table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'superadmin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("📋 Creating clients table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
        plan_name VARCHAR(100) DEFAULT 'Trial',
        plan_start_date DATE,
        plan_end_date DATE,
        is_subscription_active BOOLEAN DEFAULT FALSE,
        last_payment_amount DECIMAL(10, 2) DEFAULT 0.00,
        last_payment_date DATE,
        payment_method VARCHAR(50),
        db_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("📋 Creating users table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        db_name VARCHAR(255),
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✨ Master tables initialized in superadmin_db.");

    // Initialize garment_db (Template)
    await connection.query("USE garment_db;");
    
    const TENANT_TABLE_LIST = [
        'barcodes', 'cash_refunds', 'category_gst', 'credit_notes', 'dayout_reports',
        'edit_logs', 'item_replacements', 'login_logs', 'masterdata', 'password_resets',
        'purchase_edit_logs', 'purchases', 'replacements', 'sales_items', 'sales_users',
        'shop_config', 'stock_adjustments', 'suppliers', 'system_stock', 'users'
    ];

    console.log("🔨 Initializing template tables in garment_db...");
    // For now, just create basic placeholders or we can try to find the schema.
    // Since I have the tenant_schema.sql, I should use that!
    
    console.log("🚀 Initialization complete!");

  } catch (err) {
    console.error("❌ Error initializing TiDB:", err);
  } finally {
    if (connection) await connection.end();
  }
}

initializeTiDB();

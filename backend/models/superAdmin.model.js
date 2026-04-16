import db from "../db.js";

const initSuperAdminDatabase = async () => {
  const superAdminsTable = `
    CREATE TABLE IF NOT EXISTS super_admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      role VARCHAR(50) DEFAULT 'superadmin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const clientsTable = `
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
      logo_url LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(50) NOT NULL,
      db_name VARCHAR(255),
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    await db.promise().query(superAdminsTable);
    console.log("✅ super_admins table ready");
    await db.promise().query(clientsTable);
    console.log("✅ clients table ready");
    await db.promise().query(usersTable);
    console.log("✅ users table ready");
    
    // Migration: Add email columns if they don't exist
    try {
      await db.promise().query("ALTER TABLE super_admins ADD COLUMN email VARCHAR(255) UNIQUE AFTER password");
    } catch(e) { /* already exists */ }
    try {
      await db.promise().query("ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER password");
    } catch(e) { /* already exists */ }

    // Seed default super admin if table is empty
    const [existing] = await db.promise().query("SELECT id FROM super_admins LIMIT 1");
    if (existing.length === 0) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash("admin", 10);
      await db.promise().query(
        "INSERT INTO super_admins (username, password, email, role) VALUES (?, ?, ?, ?)",
        ["super", hashedPassword, "preyanshpatel1409@gmail.com", "superadmin"]
      );
      console.log("👤 Default Super Admin created: super / admin");
    } else {
      // Ensure super user has email
      await db.promise().query("UPDATE super_admins SET email='preyanshpatel1409@gmail.com' WHERE username='super' AND email IS NULL");
    }
  } catch (err) {
    console.error("Error initializing superadmin system tables:", err);
  }
};

export default initSuperAdminDatabase;

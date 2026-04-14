import db from "../db.js";

const initSuperAdminDatabase = async () => {
  const superAdminsTable = `
    CREATE TABLE IF NOT EXISTS super_admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'superadmin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const clientsTable = `
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'client',
      status ENUM('pending', 'active', 'rejected') DEFAULT 'active',
      plan_detail VARCHAR(255) DEFAULT 'Trial',
      plan_expiry DATE,
      db_name VARCHAR(255) NOT NULL,
      logo_url LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      db_name VARCHAR(255),
      logo_url LONGTEXT,
      business_name VARCHAR(255),
      address TEXT,
      phone VARCHAR(50),
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

    // Seed default super admin if table is empty
    const [existing] = await db.promise().query("SELECT id FROM super_admins LIMIT 1");
    if (existing.length === 0) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash("admin", 10);
      await db.promise().query(
        "INSERT INTO super_admins (username, password, role) VALUES (?, ?, ?)",
        ["super", hashedPassword, "superadmin"]
      );
      console.log("👤 Default Super Admin created: super / admin");
    }
  } catch (err) {
    console.error("Error initializing superadmin system tables:", err);
  }
};

export default initSuperAdminDatabase;

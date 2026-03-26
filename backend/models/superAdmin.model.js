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
  `;

  try {
    await db.promise().query(superAdminsTable);
    console.log("✅ super_admins table ready");
    await db.promise().query(clientsTable);
    console.log("✅ clients table ready");
  } catch (err) {
    console.error("Error initializing superadmin system tables:", err);
  }
};

export default initSuperAdminDatabase;

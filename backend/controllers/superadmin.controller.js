import db from "../db.js";
import bcrypt from "bcryptjs";
import { setupTenantDatabase } from "../utils/multitenant.util.js";

/* ================= SUPER ADMIN LOGIN ================= */
export const superAdminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Super Admins stay in the 'super_admins' table
  const q = "SELECT * FROM super_admins WHERE username=? AND role='superadmin'";

  db.query(q, [username], async (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (data.length === 0) {
      return res.status(401).json({ message: "Invalid credentials or not a super admin" });
    }

    const user = data[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Super Admin login successful",
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
};

/* ================= REGISTER CLIENT (SHOP OWNER) ================= */
export const registerClient = async (req, res) => {
  const {
    client_name, business_name, logo_url, email, phone, address,
    username, password,
    plan_name, plan_duration_months,
    payment_amount, payment_method
  } = req.body;

  if (!client_name || !business_name || !email || !username || !password) {
    return res.status(400).json({ message: "Mandatory fields missing: Name, Business, Email, Username, Password" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate subscription dates if duration provided
    let startDate = null;
    let endDate = null;
    if (plan_duration_months) {
      startDate = new Date().toISOString().split('T')[0];
      const end = new Date();
      end.setMonth(end.getMonth() + parseInt(plan_duration_months));
      endDate = end.toISOString().split('T')[0];
    }

    const db_name = `gar_db_${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;

    const q = `
      INSERT INTO clients (
        client_name, business_name, logo_url, email, phone, address,
        username, password, status, role,
        plan_name, plan_start_date, plan_end_date, is_subscription_active,
        last_payment_amount, last_payment_date, payment_method, db_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 'admin', ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `;

    const params = [
      client_name, business_name, logo_url || null, email, phone, address || null,
      username, hashedPassword,
      plan_name || 'Trial', startDate, endDate, plan_duration_months ? 1 : 0,
      payment_amount || 0.00, payment_method || null, db_name
    ];

    db.query(q, params, async (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Email or Username already exists" });
        }
        console.error("REGISTER CLIENT ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      try {
        // 2. Setup the actual database for this client
        await setupTenantDatabase(db_name);

        // Note: We no longer need a separate 'users' table entry for the admin
        // as they login using the 'clients' table.

        res.status(201).json({
          message: "Client registered and database initialized successfully",
          clientId: result.insertId,
          db_name: db_name
        });
      } catch (setupErr) {
        console.error("DATABASE SETUP ERROR:", setupErr);
        res.status(500).json({
          message: "Client registered but database setup failed",
          error: setupErr.message,
          clientId: result.insertId
        });
      }
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ALL CLIENTS ================= */
export const getRegistrations = (req, res) => {
  const q = "SELECT id, client_name, business_name, email, phone, status, plan_name, plan_end_date, is_subscription_active, db_name FROM clients ORDER BY created_at DESC";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json({ clients: data });
  });
};

/* ================= UPDATE CLIENT STATUS ================= */
export const updateClientStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const q = "UPDATE clients SET status=? WHERE id=?";

  db.query(q, [status, id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: `Client status updated to ${status}` });
  });
};

/* ================= GET COMPLETE CLIENT PROFILE ================= */
export const getClientProfile = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM clients WHERE id=?";

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (data.length === 0) return res.status(404).json({ message: "Client not found" });

    // Send client data including password (hashed)
    res.json(data[0]);
  });
};

/* ================= UPDATE COMPLETE CLIENT PROFILE ================= */
export const updateClientProfile = (req, res) => {
  const { id } = req.params;
  const {
    client_name, business_name, logo_url, email, phone, address,
    username, role, status,
    plan_name, plan_start_date, plan_end_date, is_subscription_active,
    last_payment_amount, last_payment_date, payment_method
  } = req.body;

  let q = `
    UPDATE clients SET 
      client_name=?, business_name=?, logo_url=?, email=?, phone=?, address=?,
      username=?, role=?, status=?,
      plan_name=?, plan_start_date=?, plan_end_date=?, is_subscription_active=?,
      last_payment_amount=?, last_payment_date=?, payment_method=?,
      updated_at=CURRENT_TIMESTAMP
  `;

  const params = [
    client_name, business_name, logo_url, email, phone, address,
    username, role, status,
    plan_name, plan_start_date, plan_end_date, is_subscription_active,
    last_payment_amount, last_payment_date, payment_method
  ];

  // If password is provided and not just the old hash, hash it and update
  const { password } = req.body;
  if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    q += `, password=? `;
    params.push(hashedPassword);
  }

  q += ` WHERE id=?`;
  params.push(id);

  db.query(q, params, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "Username already exists" });
      }
      console.error("UPDATE CLIENT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Client profile updated successfully" });
  });
};

/* ================= GET DASHBOARD STATS ================= */
export const getDashboardStats = (req, res) => {
  const q = `
    SELECT 
      COUNT(*) AS total_clients,
      SUM(CASE WHEN is_subscription_active = 1 THEN 1 ELSE 0 END) AS active_subscriptions,
      SUM(CASE WHEN is_subscription_active = 0 OR is_subscription_active IS NULL THEN 1 ELSE 0 END) AS inactive_subscriptions,
      SUM(CASE WHEN plan_end_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND plan_end_date >= CURDATE() THEN 1 ELSE 0 END) AS expiring_soon
    FROM clients;
  `;

  db.query(q, (err, stats) => {
    if (err) {
      console.error("STATS ERROR:", err);
      return res.status(500).json({ message: "Server error fetching stats" });
    }

    // Recent registrations and recent payments
    const qRecent = "SELECT client_name, business_name, created_at, status, last_payment_amount FROM clients ORDER BY created_at DESC LIMIT 5";

    db.query(qRecent, (err, recent) => {
      if (err) return res.status(500).json({ message: "Server error fetching recent data" });

      res.json({
        summary: stats[0],
        recent_clients: recent
      });
    });
  });
};


/* ================= DEVELOPER: LOGIN AS SHOP ================= */
export const developerLoginAsShop = (req, res) => {
  const { id } = req.params;

  const q = "SELECT id, username, business_name, logo_url, role, db_name FROM clients WHERE id = ?";

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (data.length === 0) return res.status(404).json({ message: "Client not found" });

    const client = data[0];

    // Simulate a successful login for this client
    res.json({
      message: `Developer bypass: Logging in as ${client.business_name}`,
      user: {
        id: client.id,
        username: client.username,
        role: client.role || 'admin',
        db_name: client.db_name,
        business_name: client.business_name,
        logo_url: client.logo_url,
        is_developer_bypass: true
      }
    });
  });
};

import db from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================= AUTO-CREATE TABLES ================= */
/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "preyanshpatel1409@gmail.com",
    pass: "ftvg qrst mppb dhof", // Included spaces as provided by user
  },
  tls: {
    rejectUnauthorized: false // Helps in some restricted server environments
  }
});

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // 1. Try Super Admin Table First
    const [superData] = await db.promise().query("SELECT * FROM super_admins WHERE username=?", [username]);

    if (superData.length > 0) {
      const user = superData[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username, role: user.role, db_name: null }
        });
      }
    }

    // 2. Try Clients Table (Shop Admins)
    const [clientData] = await db.promise().query("SELECT * FROM clients WHERE username=?", [username]);

    if (clientData.length > 0) {
      const user = clientData[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            business_name: user.business_name,
            logo_url: user.logo_url,
            address: user.address,
            phone: user.phone,
            email: user.email,
            plan_name: user.plan_name,
            plan_start_date: user.plan_start_date,
            plan_end_date: user.plan_end_date,
            last_payment_amount: user.last_payment_amount,
            role: user.role || 'admin',
            db_name: user.db_name
          }
        });
      }
    }

    // 3. Try Users Table (Sub-users: Sales, Purchase, etc.)
    const [userData] = await db.promise().query("SELECT * FROM users WHERE username=?", [username]);

    if (userData.length > 0) {
      const user = userData[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Fetch client branding for sub-users
        const [clientBranding] = await db.promise().query("SELECT business_name, logo_url FROM clients WHERE db_name=?", [user.db_name]);
        const branding = clientBranding[0] || {};

        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            db_name: user.db_name,
            business_name: branding.business_name || null,
            logo_url: branding.logo_url || null
          }
        });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

/* ================= CREATE USER ================= */
export const createUser = async (req, res) => {
  const { name, username, password, role, email, created_by, db_name } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const [existing] = await db
      .promise()
      .query("SELECT id FROM users WHERE username=?", [username]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const q =
      "INSERT INTO users (name, username, password, role, email, created_by, db_name) VALUES (?,?,?,?,?,?,?)";
    const [result] = await db
      .promise()
      .query(q, [name, username, hashedPassword, role, email || null, created_by || "System", db_name || null]);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertId,
        name,
        username,
        role,
        db_name,
        created_by: created_by || "System",
        created_at: new Date(),
      },
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET USERS ================= */
export const getUsers = (req, res) => {
  // Get db_name from header (sent by frontend) or skip if superadmin
  const dbName = req.headers['x-db-name'];

  let q = "SELECT id, name, username, role, created_by, created_at FROM users WHERE role != 'superadmin'";
  const params = [];

  // If a tenant is specified, only show users for that tenant
  if (dbName) {
    q += " AND db_name = ?";
    params.push(dbName);
  }

  q += " ORDER BY id DESC";

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json({ users: data });
  });
};

/* ================= UPDATE USER ================= */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, password } = req.body;

  if (!name || !username) {
    return res.status(400).json({ message: "Name and username required" });
  }

  try {
    let q = "UPDATE users SET name=?, username=?";
    const params = [name, username];

    if (password) {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      q += ", password=?";
      params.push(hashedPassword);
    }

    q += " WHERE id=?";
    params.push(id);

    await db.promise().query(q, params);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE USER ================= */
export const deleteUser = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM users WHERE id=?";

  db.query(q, [id], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json({ message: "User deleted successfully" });
  });
};

/* ================= AUTO-CREATE TABLES ================= */
const createPasswordResetsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      username VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      INDEX idx_token (token),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating password_resets table:", err);
    else console.log("✅ password_resets table ready");
  });
};
createPasswordResetsTable(); // Ensure table exists

/* ================= FORGOT PASSWORD (SEARCH BY EMAIL) ================= */
export const forgotPassword = async (req, res) => {
  const { email, username } = req.body;
  if (!email || !username) return res.status(400).json({ message: "Username and Email are required" });

  try {
    // 1. Find User Info (Search by Username)
    let user = null;
    let role = "";
    const destinationEmail = email; // Send to the email provided in the form

    // a. Check super_admins
    const [superData] = await db.promise().query("SELECT * FROM super_admins WHERE username=?", [username]);
    if (superData.length > 0) {
      user = superData[0];
      role = "superadmin";
    } else {
      // b. Check clients
      const [clientData] = await db.promise().query("SELECT * FROM clients WHERE username=?", [username]);
      if (clientData.length > 0) {
        user = clientData[0];
        role = "client";
      } else {
        // c. Check users
        const [userData] = await db.promise().query("SELECT * FROM users WHERE username=?", [username]);
        if (userData.length > 0) {
          user = userData[0];
          role = "user";
        }
      }
    }

    if (!role) {
      console.warn(`⚠️ Forgot request failed - No account found for username: ${username}`);
      return res.status(404).json({
        success: false,
        message: "No account found with that username.",
      });
    }

    console.log(`🔍 Found ${role} account for username: ${username}. Sending link to: ${destinationEmail}`);

    const systemUsername = user.username;

    // 2. Generate Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    // 3. Save to password_resets
    await db.promise().query(
      "INSERT INTO password_resets (email, role, username, token, expires_at) VALUES (?, ?, ?, ?, ?)",
      [email, role, username, token, expires]
    );

    // 4. Construct Reset Link
    const resetLink = `https://pos-copy-nine.vercel.app/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Prestige POS System" <${transporter.options.auth.user}>`,
      to: destinationEmail, // SEND TO DETERMINED EMAIL
      subject: `🔑 Password Reset Request - Prestige Garments`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #1e3a5f;">Reset Your Password</h2>
          <p>Hello <b>${user.name || username}</b>,</p>
          <p>A request has been made to reset your password for the Prestige Garments Management Software.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #1e3a5f; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 16px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `
    };

    // Send email - MUST AWAIT on Vercel to prevent function termination
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Reset link sent to ${destinationEmail}`);
      
      return res.json({
        success: true,
        message: `A reset link has been sent to ${destinationEmail}!`,
      });
    } catch (mailErr) {
      console.error("❌ NODEMAILER RESET REQ ERROR:", mailErr);
      return res.status(500).json({ 
        success: false, 
        message: "Account found, but failed to send email. Check SMTP settings.",
        error: mailErr.message 
      });
    }

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during password reset request.",
      error: err.message,
      detail: err.code || "No code"
    });
  }
};

/* ================= RESET PASSWORD (ONLINE EXECUTION) ================= */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  try {
    // 1. Verify Token
    const [tokenData] = await db.promise().query(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (tokenData.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const { username, role } = tokenData[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Update password in correct table
    let table = "";
    if (role === "superadmin") table = "super_admins";
    else if (role === "client") table = "clients";
    else if (role === "user") table = "users";

    if (table) {
      await db.promise().query(`UPDATE ${table} SET password = ? WHERE username = ?`, [hashedPassword, username]);

      // 3. Delete used token
      await db.promise().query("DELETE FROM password_resets WHERE token = ?", [token]);

      res.json({ success: true, message: "Password updated successfully!" });
    } else {
      res.status(500).json({ message: "Database table error." });
    }

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

/* ================= GET TENANT BRANDING (PRE-LOGIN) ================= */
export const getTenantBranding = async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Check if it's a shop admin (clients table)
    const [clientData] = await db.promise().query(
      "SELECT business_name, logo_url FROM clients WHERE username = ?",
      [username]
    );

    if (clientData.length > 0) {
      return res.json(clientData[0]);
    }

    // 2. Check if it's a sub-user (users table)
    const [userData] = await db.promise().query(
      "SELECT db_name FROM users WHERE username = ?",
      [username]
    );

    if (userData.length > 0) {
      const dbName = userData[0].db_name;
      const [branding] = await db.promise().query(
        "SELECT business_name, logo_url FROM clients WHERE db_name = ?",
        [dbName]
      );
      if (branding.length > 0) {
        return res.json(branding[0]);
      }
    }

    // 3. Fallback to default
    res.json({ business_name: "Point of Sale Software", logo_url: "/logo.jpg" });

  } catch (err) {
    console.error("BRANDING ERROR:", err);
    res.status(500).json({ message: "Error fetching branding", error: err.message, stack: err.stack });
  }
};

/* ================= UPDATE CLIENT INFO (Personal Info) ================= */
export const updateClientInfo = async (req, res) => {
  const { id } = req.params;
  const { business_name, address, phone, logo_url } = req.body;

  try {
    await db.promise().query(
      "UPDATE clients SET business_name = ?, address = ?, phone = ?, logo_url = ? WHERE id = ?",
      [business_name, address, phone, logo_url, id]
    );

    res.json({ success: true, message: "Information updated successfully!" });
  } catch (err) {
    console.error("UPDATE CLIENT ERROR:", err);
    res.status(500).json({ message: "Failed to update information" });
  }
};

/* ================= DIAGNOSTIC: TEST MAIL CONNECTION ================= */
export const testMail = async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: transporter.options.auth.user,
      to: "preyanshpatel1409@gmail.com",
      subject: "Diagnostic - Pos Reset",
      text: "If you see this, the SMTP connection is working correctly."
    });
    res.json({ success: true, info });
  } catch (err) {
    console.error("DEBUG MAIL ERROR:", err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};

import db from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================= AUTO-CREATE TABLES ================= */
const createPasswordResetsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
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
// createPasswordResetsTable();

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "preyanshpatel1409@gmail.com",
    pass: process.env.SMTP_PASS || "lzbm wgjm yurc tgdo",
  },
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
            role: user.role || 'admin', 
            db_name: user.db_name 
          }
        });
      }
    }

    // 3. Fallback: Check if it's a sub-user?
    // Note: To have only 2 tables in SuperAdmin DB, sub-users (sales/purchase) 
    // must be stored in the tenant DB. Since we don't know the tenant yet,
    // we return invalid credentials. 

    return res.status(401).json({ message: "Invalid credentials" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CREATE USER ================= */
export const createUser = async (req, res) => {
  const { name, username, password, role, created_by, db_name } = req.body;

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
      "INSERT INTO users (name, username, password, role, created_by, db_name) VALUES (?,?,?,?,?,?)";

    const [result] = await db
      .promise()
      .query(q, [name, username, hashedPassword, role, created_by || "System", db_name || null]);

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

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [users] = await db.promise().query("SELECT * FROM users WHERE email=?", [email]);

    if (users.length === 0) {
      return res.json({ message: "Change password request sent" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60000);

    await db.promise().query(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)",
      [email, token, expiresAt]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Prestige ERP" <${transporter.options.auth.user}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #1e3a5f; text-align: center;">Prestige ERP Password Reset</h2>
          <p>Hi,</p>
          <p>Someone requested a link to change your password. You can do this through the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Change my password</a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Your password won't change until you access the link above and create a new one.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">This link will expire in 15 minutes.</p>
        </div>
      `
    };

    // Respond immediately, send email in background
    res.json({
      success: true,
      message: "Change password request sent",
    });

    transporter.sendMail(mailOptions).then(() => {
      console.log("✅ Reset email sent to:", email);
    }).catch((mailErr) => {
      console.error("❌ NODEMAILER ERROR:", mailErr);
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error during password reset request." });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

  try {
    const [resets] = await db.promise().query("SELECT * FROM password_resets WHERE token=?", [token]);
    if (resets.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

    const resetRequest = resets[0];
    if (new Date() > new Date(resetRequest.expires_at)) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query("UPDATE users SET password=? WHERE email=?", [hashedPassword, resetRequest.email]);

    await db.promise().query("DELETE FROM password_resets WHERE email=?", [resetRequest.email]);

    res.json({ message: "Password has been successfully reset" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

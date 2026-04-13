import db from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================= AUTO-CREATE TABLES ================= */
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

    // 3. Try Users Table (Sub-users: Sales, Purchase, etc.)
    const [userData] = await db.promise().query("SELECT * FROM users WHERE username=?", [username]);

    if (userData.length > 0) {
      const user = userData[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            db_name: user.db_name
          }
        });
      }
    }

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

/* ================= AUTO-CREATE TABLES ================= */
const createPasswordResetsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      INDEX idx_token (token),
      INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating password_resets table:", err);
    else console.log("✅ password_resets table ready");
  });
};
createPasswordResetsTable(); // Ensure table exists

/* ================= FORGOT PASSWORD (GENERATE ONLINE RESET LINK) ================= */
export const forgotPassword = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username is required" });

  try {
    // 1. Find User Info (Role/Table)
    let role = "";
    let userDetails = `Username: ${username}\n`;

    const [superData] = await db.promise().query("SELECT * FROM super_admins WHERE username=?", [username]);
    if (superData.length > 0) {
      role = "superadmin";
      userDetails += `Role: Super Admin\n`;
    } else {
      const [clientData] = await db.promise().query("SELECT * FROM clients WHERE username=?", [username]);
      if (clientData.length > 0) {
        role = "client";
        userDetails += `Role: Shop Admin\nBusiness: ${clientData[0].business_name}\nShop DB: ${clientData[0].db_name}\n`;
      } else {
        const [userData] = await db.promise().query("SELECT * FROM users WHERE username=?", [username]);
        if (userData.length > 0) {
          role = "user";
          userDetails += `Role: Sub-user (${userData[0].role})\nShop DB: ${userData[0].db_name}\nCreated By: ${userData[0].created_by}\n`;
        }
      }
    }

    if (!role) {
      // Security: Always return success message even if username not found
      return res.json({
        success: true,
        message: "Your reset request has been sent to the administrator!",
      });
    }

    // 2. Generate Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    // 3. Save to password_resets
    await db.promise().query(
      "INSERT INTO password_resets (username, role, token, expires_at) VALUES (?, ?, ?, ?)",
      [username, role, token, expires]
    );

    // 4. Construct Reset Link
    const resetLink = `https://pos-copy-nine.vercel.app/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Prestige POS System" <${transporter.options.auth.user}>`,
      to: "preyanshpatel1409@gmail.com",
      subject: `🔑 Password Reset Request - ${username}`,
      text: `Hello Administrator,

A request has been made to reset the password for the account: ${username}.

USER CONTEXT:
--------------
${userDetails}

ONLINE RESET LINK (Valid for 1 hour):
------------------------------------
${resetLink}

If you did not authorize this, please ignore this email.

Regards,
Prestige Garments Management Software`
    };

    // Send email - MUST AWAIT on Vercel to prevent function termination
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Reset request email sent for user:", username);
    } catch (mailErr) {
      console.error("❌ NODEMAILER RESET REQ ERROR:", mailErr);
      // We still return success to the user for security, 
      // but we log the error for you.
    }

    // Respond AFTER email is handled
    return res.json({
      success: true,
      message: "Your reset request has been sent to the administrator!",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error during password reset request." });
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

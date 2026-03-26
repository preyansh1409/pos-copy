import db from "../db.js";

// Auto-create dayout_reports table on startup
const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS dayout_reports (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      report_date     DATE NOT NULL,
      report_time     VARCHAR(20),
      username        VARCHAR(100),
      net_cash        DECIMAL(12,2) DEFAULT 0,
      online_collection DECIMAL(12,2) DEFAULT 0,
      grand_total     DECIMAL(12,2) DEFAULT 0,
      counted_cash    DECIMAL(12,2) DEFAULT 0,
      note_counts     LONGTEXT,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_date (report_date)
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating dayout_reports table:", err);
    else console.log("✅ dayout_reports table ready");
  });
};
// createTable();

// Save a dayout report
export const saveDayoutReport = (req, res) => {
  const { report_date, report_time, username, net_cash, online_collection, grand_total, counted_cash, note_counts } = req.body;

  if (!report_date) {
    return res.status(400).json({ error: "report_date is required" });
  }

  const sql = `INSERT INTO dayout_reports (report_date, report_time, username, net_cash, online_collection, grand_total, counted_cash, note_counts)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    report_date,
    report_time || null,
    username || "Admin",
    net_cash || 0,
    online_collection || 0,
    grand_total || 0,
    counted_cash || 0,
    JSON.stringify(note_counts || {})
  ], (err, result) => {
    if (err) {
      console.error("Error saving dayout report:", err);
      return res.status(500).json({ error: "Failed to save dayout report" });
    }
    res.json({ success: true, id: result.insertId });
  });
};

// Get all dayout reports (latest first)
export const getDayoutReports = (req, res) => {
  const sql = `SELECT * FROM dayout_reports ORDER BY report_date DESC, created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching dayout reports:", err);
      return res.status(500).json({ error: "Failed to fetch dayout reports" });
    }
    res.json({ reports: results });
  });
};

// Delete a dayout report
export const deleteDayoutReport = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM dayout_reports WHERE id = ?", [Number(id)], (err) => {
    if (err) {
      console.error("Error deleting dayout report:", err);
      return res.status(500).json({ error: "Failed to delete" });
    }
    res.json({ success: true });
  });
};

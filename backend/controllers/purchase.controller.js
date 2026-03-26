import db from "../db.js";

/* ================= SAVE PURCHASE ================= */
export const savePurchase = (req, res) => {
  const {
    supplier_name,
    gstin,
    invoice_no,
    purchase_date,
    payment_mode,
    payment_status,
    items,
    bank_name,
    bank_account,
    bank_ifsc,
    terms
  } = req.body;

  // Ensure purchase_date is in YYYY-MM-DD format
  const formatted_purchase_date = typeof purchase_date === "string" ? purchase_date.slice(0, 10) : purchase_date;

  if (!supplier_name || !invoice_no || !purchase_date) {
    return res.status(400).json({ message: "Supplier, invoice, and date are required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Add at least one item" });
  }

  const values = items.map(item => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || item.price || 0);
    const gst = Number(item.gst_percent || item.gst || 0);
    const base = qty * rate;
    const amount = base + (base * gst / 100);

    return [
      supplier_name,
      gstin || "",
      invoice_no,
      formatted_purchase_date,
      payment_mode || "Cash",
      payment_status || "Paid",
      item.category || "",
      item.item_name || item.name || "",
      item.size || "",
      item.color || "",
      qty,
      rate,
      gst,
      amount
    ];
  });

  const sql = `
    INSERT INTO purchases (
      supplier_name, gstin, invoice_no, purchase_date,
      payment_mode, payment_status,
      category, item_name, size, color,
      qty, rate, gst_percent, amount
    ) VALUES ?
  `;

  db.query(sql, [values], (err) => {
    if (err) return res.status(500).json({ message: err.message });

    // Update system_stock for each item (increase available)
    items.forEach(item => {
      const { category, item_name, color, size, qty } = item;
      db.query(
        `INSERT INTO system_stock (category, item_name, color, size, available)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE available = available + ?`,
        [category || '', item_name || '', color || '', size || '', qty, qty]
      );
    });

    res.json({ message: "Purchase saved successfully" });
  });
};

/* ================= GET ALL PURCHASES ================= */
export const getAllPurchases = (req, res) => {
  const sql = `
    SELECT * FROM purchases
    ORDER BY purchase_date DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });

    const billsMap = {};


    rows.forEach(row => {
      if (!billsMap[row.invoice_no]) {
        billsMap[row.invoice_no] = {
          invoice_no: row.invoice_no,
          supplier_name: row.supplier_name,
          supplier_gst: row.gstin || "",
          purchase_date: row.purchase_date,
          payment_mode: row.payment_mode,
          payment_status: row.payment_status,
          grand_total: 0,
          items: []
        };
      }

      const qty = Number(row.qty || 0);
      const rate = Number(row.rate || 0);
      const gst = Number(row.gst_percent || 0);
      const base = qty * rate;
      const rowAmount = (row.amount && Number(row.amount) > 0) ? Number(row.amount) : (base + (base * gst / 100));

      billsMap[row.invoice_no].items.push({
        category: row.category,
        item_name: row.item_name,
        size: row.size,
        color: row.color,
        qty: qty,
        rate: rate,
        gst: gst,
        total: rowAmount
      });

      billsMap[row.invoice_no].grand_total += rowAmount;
    });

    res.json({ bills: Object.values(billsMap) });
  });
};

// ================= GET UNIQUE SUPPLIERS =================
export const getUniqueSuppliers = (req, res) => {
  const sql = "SELECT DISTINCT supplier_name FROM purchases";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ suppliers: rows.map(r => r.supplier_name) });
  });
};

// ================= GET UNIQUE INVOICES =================
export const getUniquePurchaseInvoices = (req, res) => {
  const sql = "SELECT DISTINCT invoice_no FROM purchases";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ invoices: rows.map(r => r.invoice_no) });
  });
};

// ================= DELETE PURCHASE BILL =================
export const deletePurchaseBill = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) return res.status(400).json({ message: "Invoice number is required" });

  // 1. Fetch items to update stock before deleting
  db.query("SELECT * FROM purchases WHERE invoice_no = ?", [invoice_no], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    if (rows.length === 0) return res.status(404).json({ message: "Bill not found" });

    // 2. Reverse stock
    rows.forEach(row => {
      db.query(
        "UPDATE system_stock SET available = available - ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
        [row.qty, row.category, row.item_name, row.color, row.size]
      );
    });

    // 3. Delete from purchases
    db.query("DELETE FROM purchases WHERE invoice_no = ?", [invoice_no], (err2) => {
      if (err2) return res.status(500).json({ message: err2.message });
      res.json({ message: "Purchase bill deleted successfully" });
    });
  });
};

// ================= DELETE LOGS =================
export const deletePurchaseEditLog = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM purchase_edit_logs WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Log deleted successfully" });
  });
};

// ================= PURCHASE EDIT LOGS =================
// ... (rest of the file)
// Create purchase_edit_logs table
const createPurchaseEditLogsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS purchase_edit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no VARCHAR(50) NOT NULL,
      supplier_name VARCHAR(100),
      old_data LONGTEXT,
      new_data LONGTEXT,
      edited_by VARCHAR(100) NOT NULL,
      edit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invoice (invoice_no)
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating purchase_edit_logs table:", err);
  });

  // Alter table for existing systems
  const addColumnSafe = (sql, name) => {
    db.query(sql, (err) => {
      if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          // Silent skip
        } else {
          console.error(`Error adding column ${name}:`, err);
        }
      }
    });
  };

  addColumnSafe("ALTER TABLE purchase_edit_logs ADD COLUMN old_data LONGTEXT AFTER supplier_name", "old_data");
  addColumnSafe("ALTER TABLE purchase_edit_logs ADD COLUMN new_data LONGTEXT AFTER old_data", "new_data");
};
console.log("👉 [purchase.controller.js] Loaded (Fix applied)");
// // createPurchaseEditLogsTable();

// Get edit count for a purchase bill
export const getPurchaseEditCount = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) {
    return res.status(400).json({ error: "Missing invoice_no" });
  }
  const sql = "SELECT COUNT(*) as count FROM purchase_edit_logs WHERE invoice_no = ?";
  db.query(sql, [invoice_no], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ editCount: result[0]?.count || 0 });
  });
};

// Log a purchase edit
export const logPurchaseEdit = (req, res) => {
  const { invoice_no, supplier_name, edited_by, old_data, new_data } = req.body;
  if (!invoice_no || !edited_by) {
    return res.status(400).json({ error: "Missing invoice_no or edited_by" });
  }
  const sql = "INSERT INTO purchase_edit_logs (invoice_no, supplier_name, old_data, new_data, edited_by) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [invoice_no, supplier_name || '', old_data || '', new_data || '', edited_by], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// Get edit history for a purchase bill
export const getPurchaseEditHistory = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) {
    return res.status(400).json({ error: "Missing invoice_no" });
  }
  const sql = "SELECT invoice_no, supplier_name, old_data, new_data, edited_by, edit_time FROM purchase_edit_logs WHERE invoice_no = ? ORDER BY edit_time DESC";
  db.query(sql, [invoice_no], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ history: result });
  });
};

// Get all purchase edit logs (for admin)
export const getAllPurchaseEditLogs = (req, res) => {
  const sql = "SELECT * FROM purchase_edit_logs ORDER BY edit_time DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs: result });
  });
};

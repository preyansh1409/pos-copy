import db from "../db.js";

/* =====================================================================
   AUTO-CREATE TABLES ON STARTUP
   ===================================================================== */
const initTables = () => {
    db.query(`
    CREATE TABLE IF NOT EXISTS cash_refunds (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no    VARCHAR(50)  NOT NULL,
      client_name   VARCHAR(100),
      phone         VARCHAR(20),
      refund_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
      refund_amount DECIMAL(10,2) DEFAULT 0,
      reason        TEXT,
      processed_by  VARCHAR(100) DEFAULT 'Sales',
      INDEX idx_refund_inv (invoice_no)
    )
  `, (err) => { if (err) console.error("cash_refunds table:", err.message); });

    db.query(`
    CREATE TABLE IF NOT EXISTS replacements (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      original_invoice  VARCHAR(50) NOT NULL,
      new_invoice       VARCHAR(50),
      client_name       VARCHAR(100),
      phone             VARCHAR(20),
      replacement_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
      old_items         LONGTEXT,
      new_items         LONGTEXT,
      reason            TEXT,
      processed_by      VARCHAR(100) DEFAULT 'Sales',
      INDEX idx_rep_inv (original_invoice)
    )
  `, (err) => { if (err) console.error("replacements table:", err.message); });

    db.query(`
    CREATE TABLE IF NOT EXISTS credit_notes (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no    VARCHAR(50)  NOT NULL,
      client_name   VARCHAR(100),
      phone         VARCHAR(20),
      credit_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
      credit_amount DECIMAL(10,2) DEFAULT 0,
      reason        TEXT,
      processed_by  VARCHAR(100) DEFAULT 'Sales',
      INDEX idx_cn_inv (invoice_no)
    )
  `, (err) => { if (err) console.error("credit_notes table:", err.message); });
};
// initTables();

/* =====================================================================
   HELPERS
   ===================================================================== */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Check mutual exclusion: returns { blocked, reason } */
const checkMutualExclusion = (invoice_no, callback) => {
    const refundQ = "SELECT id FROM cash_refunds WHERE invoice_no = ? LIMIT 1";
    const replaceQ = "SELECT id FROM replacements WHERE original_invoice = ? LIMIT 1";
    const creditQ = "SELECT id FROM credit_notes WHERE invoice_no = ? LIMIT 1";

    db.query(refundQ, [invoice_no], (err, refunds) => {
        if (err) return callback(err);
        db.query(replaceQ, [invoice_no], (err2, reps) => {
            if (err2) return callback(err2);
            db.query(creditQ, [invoice_no], (err3, credits) => {
                if (err3) return callback(err3);

                if (refunds.length > 0) return callback(null, { blocked: true, reason: "This bill has already been refunded (Cash Refund)." });
                if (reps.length > 0) return callback(null, { blocked: true, reason: "This bill has already been replaced." });
                if (credits.length > 0) return callback(null, { blocked: true, reason: "This bill already has a Credit Note." });

                callback(null, { blocked: false });
            });
        });
    });
};

/** Check bill age (7-day rule). callback(err, { tooOld, saleDate }) */
const checkBillAge = (invoice_no, callback) => {
    const sql = "SELECT MIN(sale_date) as sale_date FROM sales_items WHERE invoice_no = ?";
    db.query(sql, [invoice_no], (err, rows) => {
        if (err) return callback(err);
        const saleDate = rows[0]?.sale_date;
        if (!saleDate) return callback(null, { tooOld: false, saleDate: null });
        const age = Date.now() - new Date(saleDate).getTime();
        callback(null, { tooOld: age > SEVEN_DAYS_MS, saleDate });
    });
};

/* =====================================================================
   CASH REFUND
   ===================================================================== */
export const createCashRefund = (req, res) => {
    const { invoice_no, client_name, phone, refund_amount, reason, processed_by } = req.body;
    if (!invoice_no) return res.status(400).json({ error: "invoice_no required" });

    checkMutualExclusion(invoice_no, (err, status) => {
        if (err) return res.status(500).json({ error: err.message });
        if (status.blocked) return res.status(400).json({ error: status.reason });

        const sql = `INSERT INTO cash_refunds (invoice_no, client_name, phone, refund_amount, reason, processed_by)
                 VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [invoice_no, client_name || "", phone || "", refund_amount || 0, reason || "", processed_by || "Sales"], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // Restore stock
            const fetchSql = "SELECT category, item_name, color, size, qty FROM sales_items WHERE invoice_no = ?";
            db.query(fetchSql, [invoice_no], (err3, items) => {
                if (!err3 && items.length > 0) {
                    items.forEach(item => {
                        db.query(
                            "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                            [item.qty, item.category, item.item_name, item.color, item.size]
                        );
                    });
                }
                res.json({ success: true, message: "Cash refund recorded successfully." });
            });
        });
    });
};

export const getAllCashRefunds = (req, res) => {
    db.query("SELECT * FROM cash_refunds ORDER BY refund_date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ refunds: rows });
    });
};

export const deleteCashRefund = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM cash_refunds WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Refund deleted" });
    });
};

/* =====================================================================
   REPLACEMENT
   ===================================================================== */
export const createReplacement = (req, res) => {
    const { original_invoice, new_invoice, client_name, phone, old_items, new_items, reason, processed_by } = req.body;
    if (!original_invoice) return res.status(400).json({ error: "original_invoice required" });

    checkBillAge(original_invoice, (err, ageInfo) => {
        if (err) return res.status(500).json({ error: err.message });
        if (ageInfo.tooOld) return res.status(400).json({ error: "Replacement not allowed: bill is older than 7 days." });

        checkMutualExclusion(original_invoice, (err2, status) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (status.blocked) return res.status(400).json({ error: status.reason });

            const sql = `INSERT INTO replacements (original_invoice, new_invoice, client_name, phone, old_items, new_items, reason, processed_by)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, [
                original_invoice, new_invoice || "", client_name || "", phone || "",
                JSON.stringify(old_items || []), JSON.stringify(new_items || []),
                reason || "", processed_by || "Sales"
            ], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });

                // Restore old items stock
                if (Array.isArray(old_items) && old_items.length > 0) {
                    old_items.forEach(item => {
                        db.query(
                            "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                            [item.qty || 1, item.category, item.item_name || item.name, item.color, item.size]
                        );
                    });
                }
                // Deduct new items stock
                if (Array.isArray(new_items) && new_items.length > 0) {
                    new_items.forEach(item => {
                        db.query(
                            `INSERT INTO system_stock (category, item_name, color, size, available)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE available = available - ?`,
                            [item.category, item.item_name || item.name, item.color, item.size, -(item.qty || 1), (item.qty || 1)]
                        );
                    });
                }

                res.json({ success: true, message: "Replacement recorded successfully." });
            });
        });
    });
};

export const getAllReplacements = (req, res) => {
    db.query("SELECT * FROM replacements ORDER BY replacement_date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ replacements: rows });
    });
};

export const deleteReplacement = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM replacements WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Replacement deleted" });
    });
};

/* =====================================================================
   CREDIT NOTE
   ===================================================================== */
export const createCreditNote = (req, res) => {
    const { invoice_no, client_name, phone, credit_amount, reason, processed_by } = req.body;
    if (!invoice_no) return res.status(400).json({ error: "invoice_no required" });

    checkMutualExclusion(invoice_no, (err, status) => {
        if (err) return res.status(500).json({ error: err.message });
        if (status.blocked) return res.status(400).json({ error: status.reason });

        const sql = `INSERT INTO credit_notes (invoice_no, client_name, phone, credit_amount, reason, processed_by)
                 VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [invoice_no, client_name || "", phone || "", credit_amount || 0, reason || "", processed_by || "Sales"], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, message: "Credit note recorded successfully." });
        });
    });
};

export const getAllCreditNotes = (req, res) => {
    db.query("SELECT * FROM credit_notes ORDER BY credit_date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ creditNotes: rows });
    });
};

export const deleteCreditNote = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM credit_notes WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Credit note deleted" });
    });
};

/* =====================================================================
   STATUS CHECK — Quick check for a single invoice
   ===================================================================== */
export const getRefundStatus = (req, res) => {
    const { invoice_no } = req.params;
    if (!invoice_no) return res.status(400).json({ error: "invoice_no required" });

    checkMutualExclusion(invoice_no, (err, status) => {
        if (err) return res.status(500).json({ error: err.message });

        checkBillAge(invoice_no, (err2, ageInfo) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                blocked: status.blocked,
                reason: status.reason || null,
                tooOldForReplacement: ageInfo.tooOld,
                saleDate: ageInfo.saleDate
            });
        });
    });
};

import db from "../db.js";

// ── Auto-create item_replacements table on startup ──
const createReplacementsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS item_replacements (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no      VARCHAR(50)  NOT NULL,
      client_name     VARCHAR(100),
      replacement_date DATETIME    DEFAULT CURRENT_TIMESTAMP,
      original_items  LONGTEXT     NOT NULL,
      replaced_items  LONGTEXT     NOT NULL,
      original_total  DECIMAL(10,2) DEFAULT 0,
      new_total       DECIMAL(10,2) DEFAULT 0,
      processed_by    VARCHAR(100) DEFAULT 'Staff',
      notes           TEXT,
      INDEX idx_invoice (invoice_no)
    )
  `;
    db.query(sql, (err) => {
        if (err) console.error("Error creating item_replacements table:", err);
        else console.log("✅ item_replacements table ready");
    });
};
// // createReplacementsTable();

// ── Auto-create credit_notes table on startup ──
const createCreditNotesTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS credit_notes (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      credit_note_no  VARCHAR(50)  UNIQUE NOT NULL,
      invoice_no      VARCHAR(50)  NOT NULL,
      client_name     VARCHAR(255),
      phone           VARCHAR(20),
      amount          DECIMAL(10,2) DEFAULT 0,
      issued_by       VARCHAR(100) DEFAULT 'Staff',
      issued_date     DATETIME     DEFAULT CURRENT_TIMESTAMP,
      status          VARCHAR(50)  DEFAULT 'Issued',
      INDEX idx_cn (credit_note_no),
      INDEX idx_invoice (invoice_no),
      INDEX idx_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
    db.query(sql, (err) => {
        if (err) console.error("Error creating credit_notes table:", err);
        else console.log("✅ credit_notes table ready");
    });
};
// createCreditNotesTable();

// ── Auto-create cash_refunds table on startup ──
const createCashRefundsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS cash_refunds (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no      VARCHAR(50)  NOT NULL,
      client_name     VARCHAR(255),
      phone           VARCHAR(20),
      amount          DECIMAL(10,2) DEFAULT 0,
      issued_by       VARCHAR(100) DEFAULT 'Staff',
      refund_date     DATETIME     DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invoice (invoice_no),
      INDEX idx_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
    db.query(sql, (err) => {
        if (err) console.error("Error creating cash_refunds table:", err);
        else console.log("✅ cash_refunds table ready");
    });
};
// createCashRefundsTable();

// ── Update sales_items table for cash_refunds flag ──
const updateSalesItemsSchema = () => {
    // Check for is_cash_refunded
    db.query("SHOW COLUMNS FROM sales_items LIKE 'is_cash_refunded'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding is_cash_refunded column...");
            db.query("ALTER TABLE sales_items ADD COLUMN is_cash_refunded TINYINT DEFAULT 0");
        }
    });
    // Check for is_cn_update
    db.query("SHOW COLUMNS FROM sales_items LIKE 'is_cn_update'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding is_cn_update column...");
            db.query("ALTER TABLE sales_items ADD COLUMN is_cn_update TINYINT DEFAULT 0");
        }
    });

    // Check for phone in credit_notes
    db.query("SHOW COLUMNS FROM credit_notes LIKE 'phone'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding phone column to credit_notes...");
            db.query("ALTER TABLE credit_notes ADD COLUMN phone VARCHAR(20)");
        }
    });

    // Check for phone in cash_refunds
    db.query("SHOW COLUMNS FROM cash_refunds LIKE 'phone'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding phone column to cash_refunds...");
            db.query("ALTER TABLE cash_refunds ADD COLUMN phone VARCHAR(20)");
        }
    });

    // Check for returned_items in credit_notes
    db.query("SHOW COLUMNS FROM credit_notes LIKE 'returned_items'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding returned_items column to credit_notes...");
            db.query("ALTER TABLE credit_notes ADD COLUMN returned_items LONGTEXT");
        }
    });

    // Check for returned_items in cash_refunds
    db.query("SHOW COLUMNS FROM cash_refunds LIKE 'returned_items'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding returned_items column to cash_refunds...");
            db.query("ALTER TABLE cash_refunds ADD COLUMN returned_items LONGTEXT");
        }
    });

    // Check for returned_items in item_replacements to track detailed swaps
    db.query("SHOW COLUMNS FROM item_replacements LIKE 'is_return_exchange'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding is_return_exchange column to item_replacements...");
            db.query("ALTER TABLE item_replacements ADD COLUMN is_return_exchange TINYINT DEFAULT 1");
        }
    });

    // Check for redeemed tracking in credit_notes
    db.query("SHOW COLUMNS FROM credit_notes LIKE 'redeemed_invoice_no'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE credit_notes ADD COLUMN redeemed_invoice_no VARCHAR(50)");
            db.query("ALTER TABLE credit_notes ADD COLUMN redeemed_date DATETIME");
        }
    });

    // Check for redeemed tracking in cash_refunds
    db.query("SHOW COLUMNS FROM cash_refunds LIKE 'redeemed_invoice_no'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE cash_refunds ADD COLUMN redeemed_invoice_no VARCHAR(50)");
            db.query("ALTER TABLE cash_refunds ADD COLUMN redeemed_date DATETIME");
        }
    });

    // Check for refund_mode in cash_refunds
    db.query("SHOW COLUMNS FROM cash_refunds LIKE 'refund_mode'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding refund_mode column to cash_refunds...");
            db.query("ALTER TABLE cash_refunds ADD COLUMN refund_mode VARCHAR(20) DEFAULT 'Cash'", () => {
                // Backfill existing refunds from original bill payment_mode
                db.query(`UPDATE cash_refunds cr
                    JOIN (SELECT DISTINCT invoice_no, payment_mode FROM sales_items) si ON cr.invoice_no = si.invoice_no
                    SET cr.refund_mode = si.payment_mode
                    WHERE cr.refund_mode IS NULL OR cr.refund_mode = 'Cash'`);
            });
        }
    });

    // Check for status column in credit_notes
    db.query("SHOW COLUMNS FROM credit_notes LIKE 'status'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding status column to credit_notes...");
            db.query("ALTER TABLE credit_notes ADD COLUMN status VARCHAR(20) DEFAULT 'Issued'");
        }
    });

    // Check for status column in cash_refunds
    db.query("SHOW COLUMNS FROM cash_refunds LIKE 'status'", (err, rows) => {
        if (!err && rows.length === 0) {
            console.log("Adding status column to cash_refunds...");
            db.query("ALTER TABLE cash_refunds ADD COLUMN status VARCHAR(20) DEFAULT 'Issued'");
        }
    });
};
// updateSalesItemsSchema();

// ── GET /api/returns/unified-history ──
export const getUnifiedHistory = (req, res) => {
    // We want a sorted feed: 
    // 1. Replacements (Insta-Swap)
    // 2. Issuance (Returns)
    // 3. Redemptions (Exchanges using credit)

    const sqlReplacements = `
        SELECT 'Replacement' as type, replacement_date as date, invoice_no, client_name, 
               original_items as items_in, replaced_items as items_out, 
               original_total as val_in, new_total as val_out, processed_by as staff 
        FROM item_replacements
    `;
    const sqlCNIssued = `
        SELECT 'Credit Issued' as type, issued_date as date, invoice_no, client_name,
               IFNULL(returned_items, '[]') as items_in, '[]' as items_out,
               amount as val_in, 0 as val_out, issued_by as staff
        FROM credit_notes
    `;
    const sqlCNRedeemed = `
        SELECT 'Credit Redeemed' as type, cn.redeemed_date as date, cn.redeemed_invoice_no as invoice_no, cn.client_name,
               '[]' as items_in, '[]' as items_out,
               0 as val_in, cn.amount as val_out, 'Billing' as staff
        FROM credit_notes cn
        WHERE cn.status = 'Redeemed'
    `;
    const sqlRefundIssued = `
        SELECT 'Refund Issued' as type, refund_date as date, invoice_no, client_name,
               IFNULL(returned_items, '[]') as items_in, '[]' as items_out,
               amount as val_in, 0 as val_out, issued_by as staff
        FROM cash_refunds
    `;
    const sqlRefundRedeemed = `
        SELECT 'Refund Redeemed' as type, rf.redeemed_date as date, rf.redeemed_invoice_no as invoice_no, rf.client_name,
               '[]' as items_in, '[]' as items_out,
               0 as val_in, rf.amount as val_out, 'Billing' as staff
        FROM cash_refunds rf
        WHERE rf.status = 'Redeemed'
    `;

    const unifiedSql = `
        (${sqlReplacements}) UNION ALL (${sqlCNIssued}) UNION ALL (${sqlCNRedeemed}) 
        UNION ALL (${sqlRefundIssued}) UNION ALL (${sqlRefundRedeemed})
        ORDER BY date DESC LIMIT 150
    `;

    db.query(unifiedSql, (err, rows) => {
        if (err) {
            console.error("[getUnifiedHistory] Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ history: rows });
    });
};

// ── POST /api/returns/replace ──
// Body: { invoice_no, edited_items, processed_by }
// 1. Fetch original bill items from sales_items
// 2. Re-insert edited items into sales_items (replacing old ones)
// 3. Adjust system_stock (restore old, deduct new)
// 4. Log to item_replacements
export const processReplacement = (req, res) => {
    const { invoice_no, edited_items, processed_by } = req.body;

    if (!invoice_no || !edited_items || !Array.isArray(edited_items) || edited_items.length === 0) {
        return res.status(400).json({ error: "Missing invoice_no or edited_items" });
    }

    // 1. Fetch the existing bill (to get client info + original items)
    const fetchSql = "SELECT * FROM sales_items WHERE invoice_no = ?";
    db.query(fetchSql, [invoice_no], (fetchErr, oldRows) => {
        if (fetchErr) return res.status(500).json({ error: fetchErr.message });
        if (!oldRows || oldRows.length === 0) {
            return res.status(404).json({ error: `No bill found for invoice: ${invoice_no}` });
        }

        const firstRow = oldRows[0];
        const client_name = firstRow.client_name;
        const phone = firstRow.phone;
        const sale_date = firstRow.sale_date;
        const payment_mode = firstRow.payment_mode;
        const payment_status = firstRow.payment_status;

        // --- STRICTURE CHECK: 7-Day Policy ---
        const sDate = new Date(sale_date);
        const today = new Date();
        const diffTime = Math.abs(today - sDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            return res.status(400).json({ error: "Sorry, item cannot be replaced because it already has 7 days." });
        }

        // --- STRICTURE CHECK: No Refund/CN issued ---
        if (firstRow.is_cash_refunded || firstRow.is_cn_update) {
            return res.status(400).json({ error: "Cannot replace a bill that has already been refunded or had a credit note issued." });
        }

        // Snapshot of original items for the log
        const originalItems = oldRows.map(r => ({
            category: r.category,
            item_name: r.item_name,
            size: r.size,
            color: r.color,
            qty: r.qty,
            rate: r.price,
        }));

        const originalTotal = oldRows.reduce((sum, r) => {
            const base = parseFloat(r.total || 0);
            const gst = parseFloat(r.gst_percent || 0);
            return sum + (base + base * gst / 100);
        }, 0);

        // Compute new grand total from edited_items
        const newTotal = edited_items.reduce((sum, item) => {
            const rate = parseFloat(item.rate || item.price || item.unit_price || 0);
            const qty = parseFloat(item.qty || 0);
            const gst = parseFloat(item.gst ?? item.gst_percent ?? 5);
            return sum + (rate * qty) * (1 + gst / 100);
        }, 0);

        // 2. Delete old sales_items rows for this invoice
        db.query("DELETE FROM sales_items WHERE invoice_no = ?", [invoice_no], (delErr) => {
            if (delErr) return res.status(500).json({ error: delErr.message });

            // 3. Insert new (edited) items
            const values = edited_items.map(item => {
                const rate = parseFloat(item.rate || item.price || item.unit_price || 0);
                const qty = parseFloat(item.qty || 0);
                const gst = item.gst ?? item.gst_percent ?? 5;
                return [
                    invoice_no,
                    client_name,
                    phone,
                    sale_date,
                    item.category || "",
                    item.item_name || item.name || "",
                    item.size || "",
                    item.color || "",
                    qty,
                    rate,
                    qty * rate,
                    gst,
                    Math.round(newTotal),
                    payment_mode,
                    payment_status,
                ];
            });

            const insertSql = `
        INSERT INTO sales_items
        (invoice_no, client_name, phone, sale_date, category, item_name,
         size, color, qty, price, total, gst_percent, grand_total, payment_mode, payment_status)
        VALUES ?
      `;

            db.query(insertSql, [values], (insErr) => {
                if (insErr) return res.status(500).json({ error: insErr.message });

                // 4. Restore original stock (add back what was originally sold)
                originalItems.forEach(item => {
                    db.query(
                        "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                        [item.qty, item.category, item.item_name, item.color, item.size]
                    );
                });

                // 5. Deduct new items from stock
                edited_items.forEach(item => {
                    const itemName = item.item_name || item.name || "";
                    const qty = parseFloat(item.qty || 0);
                    db.query(
                        `INSERT INTO system_stock (category, item_name, color, size, available)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE available = available - ?`,
                        [item.category || "", itemName, item.color || "", item.size || "", -qty, qty]
                    );
                });

                // 6. Save to item_replacements log
                const logSql = `
          INSERT INTO item_replacements
          (invoice_no, client_name, original_items, replaced_items, original_total, new_total, processed_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
                db.query(
                    logSql,
                    [
                        invoice_no,
                        client_name,
                        JSON.stringify(originalItems),
                        JSON.stringify(edited_items),
                        Math.round(originalTotal),
                        Math.round(newTotal),
                        processed_by || "Staff",
                    ],
                    (logErr) => {
                        if (logErr) console.error("Replacement log error:", logErr);
                        // Non-fatal — still return success
                        res.json({
                            success: true,
                            message: `Items replaced successfully for ${invoice_no}`,
                            invoice_no,
                            new_total: Math.round(newTotal),
                        });
                    }
                );
            });
        });
    });
};

// ── GET /api/returns/all — list all replacement records ──
export const getAllReplacements = (req, res) => {
    const sql = "SELECT * FROM item_replacements ORDER BY replacement_date DESC";
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ replacements: rows });
    });
};
// ── GET /api/returns/history/:invoice_no ──
export const getReplacementHistory = (req, res) => {
    const { invoice_no } = req.params;
    const sql = "SELECT * FROM item_replacements WHERE invoice_no = ? ORDER BY replacement_date DESC";
    db.query(sql, [invoice_no], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ history: rows });
    });
};

// ── POST /api/returns/issue-refund ──
export const issueRefund = (req, res) => {
    const { invoice_no, refund_type, amount, client_name, phone, issued_by, item_ids, refund_mode } = req.body;

    if (!invoice_no || !refund_type || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 0. Fetch the bill to check 7-day policy, replacement status and payment mode
    db.query("SELECT sale_date, is_replaced, payment_mode FROM sales_items WHERE invoice_no = ? LIMIT 1", [invoice_no], (billErr, billRows) => {
        if (billErr) return res.status(500).json({ error: billErr.message });
        if (billRows.length === 0) return res.status(404).json({ error: "Original bill not found" });

        const bill = billRows[0];

        // --- 7-Day Policy Check ---
        const sDate = new Date(bill.sale_date);
        const today = new Date();
        const diffTime = Math.abs(today - sDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            return res.status(400).json({ error: "Sorry, this bill is older than 7 days and cannot be refunded or have a credit note issued." });
        }

        // --- Replacement Check ---
        if (bill.is_replaced) {
            return res.status(400).json({ error: "This bill has already been replaced. A refund or credit note cannot be issued." });
        }

        // --- FETCH RETURNED ITEMS DETAILS ---
        const fetchItemsSql = (item_ids && item_ids.length > 0)
            ? "SELECT category, item_name, size, color, qty, price FROM sales_items WHERE id IN (?)"
            : "SELECT category, item_name, size, color, qty, price FROM sales_items WHERE invoice_no = ?";
        const fetchParams = (item_ids && item_ids.length > 0) ? [item_ids] : [invoice_no];

        db.query(fetchItemsSql, fetchParams, (fErr, fRows) => {
            const returnedItemsJson = JSON.stringify(fRows || []);

            if (refund_type === 'credit') {
                const cn_no = `CN-${Math.floor(100000 + Math.random() * 900000)}`;
                const sql = `
                    INSERT INTO credit_notes (credit_note_no, invoice_no, client_name, phone, amount, issued_by, returned_items)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(sql, [cn_no, invoice_no, client_name, phone || null, amount, issued_by || 'Staff', returnedItemsJson], (err) => {
                    if (err) {
                        console.error("[issueRefund] CN Insert Error:", err);
                        return res.status(500).json({ error: err.message });
                    }

                    // MARK ITEMS & UPDATE GRAND_TOTAL
                    if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
                        // 1. Restore Stock
                        fRows.forEach(item => {
                            db.query(
                                "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                                [item.qty, item.category, item.item_name, item.color, item.size]
                            );
                        });

                        // 2. Mark items as credited
                        db.query("UPDATE sales_items SET is_cn_update = 1 WHERE id IN (?)", [item_ids], (updErr) => {
                            if (updErr) console.error("[issueRefund] Mark Credited Error:", updErr);

                            // 3. Subtract from bill total so 'Already Paid' stays accurate
                            db.query("UPDATE sales_items SET grand_total = GREATEST(0, grand_total - ?) WHERE invoice_no = ?", [amount, invoice_no], (gtErr) => {
                                if (gtErr) console.error("[issueRefund] GT Update Error:", gtErr);
                                console.log(`[issueRefund] Bill ${invoice_no} reduced by ₹${amount} for CN issuance.`);
                                res.json({ success: true, message: "Credit Note Issued & Invoice Updated", credit_note_no: cn_no });
                            });
                        });
                    } else {
                        // Whole bill return/general credit
                        db.query("UPDATE sales_items SET is_cn_update = 1, grand_total = GREATEST(0, grand_total - ?) WHERE invoice_no = ?", [amount, invoice_no], (gtErr) => {
                            if (gtErr) console.error("[issueRefund] GT Update Error:", gtErr);
                            res.json({ success: true, message: "Credit Note Issued (Global)", credit_note_no: cn_no });
                        });
                    }
                });
            } else {
                // Cash Refund flow - allow multiple partials
                const actualRefundMode = refund_mode || bill.payment_mode || 'Cash';
                const sql = `
                    INSERT INTO cash_refunds (invoice_no, client_name, phone, amount, issued_by, returned_items, refund_mode)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(sql, [invoice_no, client_name, phone || null, Math.round(amount), issued_by || 'Staff', returnedItemsJson, actualRefundMode], (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Remove returned items from DB, restore stock, update invoice grand_total
                    if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
                        // 1. Restore Stock
                        fRows.forEach(item => {
                            db.query(
                                "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                                [item.qty, item.category, item.item_name, item.color, item.size]
                            );
                        });

                        // 2. Mark items as refunded
                        db.query("UPDATE sales_items SET is_cash_refunded = 1 WHERE id IN (?)", [item_ids], (updErr) => {
                            if (updErr) console.error("[issueRefund] Mark Refunded Error:", updErr);

                            // 3. Subtract from bill total
                            db.query("UPDATE sales_items SET grand_total = GREATEST(0, grand_total - ?) WHERE invoice_no = ?", [amount, invoice_no], (gtErr) => {
                                if (gtErr) console.error("[issueRefund] GT Update Error:", gtErr);
                                console.log(`[issueRefund] Bill ${invoice_no} reduced by ₹${amount} for Cash Refund.`);
                                res.json({ success: true, message: "Cash Refund Processed & Invoice Updated" });
                            });
                        });
                    } else {
                        db.query("UPDATE sales_items SET is_cash_refunded = 1, grand_total = GREATEST(0, grand_total - ?) WHERE invoice_no = ?", [amount, invoice_no], (updErr) => {
                            if (updErr) console.error("[issueRefund] GT Update Error:", updErr);
                            res.json({ success: true, message: "Cash Refund Processed (Global)" });
                        });
                    }
                });
            }
        });
    });
};

// ── GET /api/returns/search-cn/:query ──
export const searchCreditNote = (req, res) => {
    const { query } = req.params;
    // Search for exact match first, then partial match
    const sql = `
        SELECT * FROM credit_notes
        WHERE (credit_note_no = ? OR invoice_no = ? OR phone = ?)
        AND status = 'Issued'
        LIMIT 1
    `;
    db.query(sql, [query, query, query], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Credit note not found" });
        res.json({ success: true, data: rows[0] });
    });
};

// ── GET /api/returns/credit-notes ──
export const getAllCreditNotes = (req, res) => {
    const sql = "SELECT *, redeemed_date FROM credit_notes WHERE status = 'Issued' ORDER BY issued_date DESC";
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, credit_notes: rows });
    });
};

// ── DELETE /api/returns/credit-note/:cn_no ──
export const deleteCreditNote = (req, res) => {
    const { cn_no } = req.params;
    const sql = "DELETE FROM credit_notes WHERE credit_note_no = ?";
    db.query(sql, [cn_no], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Credit note not found" });
        res.json({ success: true, message: "Credit note marked as received and removed." });
    });
};

// ── GET /api/returns/search-cash/:query ──
export const searchCashRefund = (req, res) => {
    const { query } = req.params;
    const sql = "SELECT * FROM cash_refunds WHERE (invoice_no = ? OR phone = ?) AND status != 'Redeemed' LIMIT 1";
    db.query(sql, [query, query], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Cash refund not found or already redeemed" });
        res.json({ success: true, data: rows[0] });
    });
};

// ── GET /api/returns/cash-refunds ──
export const getAllCashRefunds = (req, res) => {
    const sql = "SELECT * FROM cash_refunds WHERE status != 'Redeemed' ORDER BY refund_date DESC";
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, refunds: rows });
    });
};

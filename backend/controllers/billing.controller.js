import db from "../db.js";

// ================= DELETE SALES BILL =================
export const deleteSalesBill = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) {
    return res.status(400).json({ error: "Missing invoice_no" });
  }
  // 0. Fetch items to restore stock before deleting
  const fetchItemsSql = "SELECT category, item_name, color, size, qty FROM sales_items WHERE invoice_no = ?";
  db.query(fetchItemsSql, [invoice_no], (fetchErr, itemsToRestore) => {
    if (!fetchErr && itemsToRestore.length > 0) {
      itemsToRestore.forEach(item => {
        db.query(
          "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
          [item.qty, item.category, item.item_name, item.color, item.size]
        );
      });
    }

    // Delete all items for this invoice_no
    const deleteSql = "DELETE FROM sales_items WHERE invoice_no = ?";
    db.query(deleteSql, [invoice_no], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json({ message: "Bill deleted successfully" });
    });
  });
};
// ================= UPDATE SALES BILL =================
export const updateSalesBill = (req, res) => {
  const { invoice_no } = req.params;
  const { client_name, phone, sale_date, items, grand_total, payment_mode, payment_status, edited_by } = req.body;

  // Normalize invoice_no (remove spaces, e.g., "INV - 6098" -> "INV-6098")
  const norm_invoice_no = invoice_no.replace(/\s+/g, '');

  if (!invoice_no || !client_name || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing sale data" });
  }

  // 1. Fetch old data for logging before deleting
  const fetchOldSql = "SELECT * FROM sales_items WHERE invoice_no = ? OR invoice_no = ?";
  db.query(fetchOldSql, [norm_invoice_no, invoice_no], (fetchErr, oldRows) => {
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    if (!oldRows || oldRows.length === 0) {
      console.warn(`[updateSalesBill] Bill ${invoice_no} not found for logging.`);
      // We'll proceed with the update but we can't do a clean diff if it's missing
      // Actually, it's better to log it as-is if we can't find old data, 
      // but why would it be missing? Let's just create a dummy if missing to avoid crashes.
    }

    // Calculate old grand total manually if the stored column is 0 (fallback for legacy records)
    const calculatedOldTotal = (oldRows || []).reduce((sum, r) => {
      const base = parseFloat(r.total || 0); // r.total is qty * price
      const gst = parseFloat(r.gst_percent || 0);
      return sum + (base + (base * gst / 100));
    }, 0);

    const firstRow = oldRows[0] || {};

    // --- STRICTURE CHECK: 7-Day Policy ---
    const sDate = new Date(firstRow.sale_date || new Date());
    const today = new Date();
    const diffTime = Math.abs(today - sDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Only enforce 7-day for replacements/refunds flow (is_replaced is used for replacement)
    // But since this is a general update, let's be careful.
    if (req.body.is_replaced && diffDays > 7) {
      return res.status(400).json({ error: "Sorry, this bill is older than 7 days and cannot be replaced." });
    }

    // --- STRICTURE CHECK: Replacement Blockers ---
    if (req.body.is_replaced) {
      const replacementCount = (oldRows || []).some(r => r.is_replaced === 1);
      if (replacementCount) {
        return res.status(400).json({ error: "This bill has already been replaced once." });
      }
      if (firstRow.is_cash_refunded || firstRow.is_cn_update) {
        return res.status(400).json({ error: "Cannot replace a bill that has already been refunded or had a credit note issued." });
      }
    }

    const oldData = {
      invoice_no: firstRow.invoice_no || invoice_no,
      client_name: firstRow.client_name,
      phone: firstRow.phone,
      payment_mode: firstRow.payment_mode,
      payment_status: firstRow.payment_status,
      is_replaced: firstRow.is_replaced,
      is_cn_update: firstRow.is_cn_update,
      is_cash_refunded: firstRow.is_cash_refunded,
      grand_total: (firstRow.grand_total && parseFloat(firstRow.grand_total) > 1) ? firstRow.grand_total : calculatedOldTotal,
      items: (oldRows || []).map(r => ({
        category: r.category,
        item_name: r.item_name,
        size: r.size,
        color: r.color,
        qty: r.qty,
        price: r.price
      }))
    };

    // 2. Remove all existing items for this invoice_no (space-insensitive)
    const deleteSql = "DELETE FROM sales_items WHERE REPLACE(invoice_no, ' ', '') = REPLACE(?, ' ', '')";
    db.query(deleteSql, [invoice_no], (delErr) => {
      if (delErr) {
        console.error(delErr);
        return res.status(500).json({ error: delErr.message });
      }

      // 3. Insert updated items
      const values = items.map(item => {
        const qty = Number(item.qty);
        const rate = Number(item.rate || item.price || 0);
        const gst = item.gst ?? item.gst_percent ?? 5;

        // Use updated values or fallbacks if not provided
        const final_payment_mode = payment_mode || oldData.payment_mode || "Cash";
        const final_payment_status = payment_status || oldData.payment_status || "";
        const final_grand_total = grand_total !== undefined ? grand_total : oldData.grand_total;

        return [
          invoice_no,
          client_name || oldData.client_name,
          phone || oldData.phone,
          sale_date ? new Date(sale_date) : new Date(),
          item.category,
          item.item_name || item.name,
          item.size || "",
          item.color || "",
          isNaN(qty) ? 0 : qty,
          isNaN(rate) ? 0 : rate,
          (isNaN(qty) || isNaN(rate)) ? 0 : qty * rate,
          gst,
          final_grand_total,
          final_payment_mode,
          final_payment_status,
          item.is_cn_update ?? oldData.is_cn_update ?? 0,
          req.body.is_replaced ?? oldData.is_replaced ?? 0,
          req.body.is_cash_refunded ? 1 : (oldData.is_cash_refunded ? 1 : 0)  // persist refund flag
        ];
      });

      const insertSql = `
        INSERT INTO sales_items
        (invoice_no, client_name, phone, sale_date, category, item_name, size, color, qty, price, total, gst_percent, grand_total, payment_mode, payment_status, is_cn_update, is_replaced, is_cash_refunded)
        VALUES ?
      `;

      db.query(insertSql, [values], (insErr) => {
        if (insErr) return res.status(500).json({ error: insErr.message });

        // 4. Update system_stock for each item
        // First, restore old items' quantities (add back what was sold)
        oldData.items.forEach(item => {
          db.query(
            "UPDATE system_stock SET available = available + ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
            [item.qty, item.category, item.item_name, item.color, item.size]
          );
        });

        // Then, subtract new items' quantities
        items.forEach(item => {
          const { category, name, item_name, color, size, qty } = item;
          const itemName = name || item_name;
          db.query(
            `INSERT INTO system_stock (category, item_name, color, size, available)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE available = available - ?`,
            [category, itemName, color, size, -qty, qty]
          );
        });

        // 5. Log the edit
        const normalizeDate = (d) => {
          if (!d) return "";
          const s = String(d).trim();
          // Regex for YYYY-MM-DD
          const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) return match[0];

          const date = new Date(d);
          if (isNaN(date.getTime())) return "";

          // Local parts to avoid UTC shift
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const final_client_name = (client_name || oldData.client_name || "").trim();
        const final_phone = (phone || oldData.phone || "").trim();
        const final_payment_mode = (payment_mode || oldData.payment_mode || "Cash").trim();
        const final_payment_status = (payment_status || oldData.payment_status || "").trim();
        const final_grand_total = grand_total !== undefined ? grand_total : oldData.grand_total;
        const final_sale_date = sale_date || normalizeDate(oldData.sale_date);

        const newData = {
          invoice_no: norm_invoice_no,
          client_name: final_client_name,
          phone: final_phone,
          payment_mode: final_payment_mode,
          payment_status: final_payment_status,
          grand_total: final_grand_total,
          sale_date: final_sale_date,
          items
        };

        // Accurate comparison logic
        const changedOld = {};
        const changedNew = {};

        // Compare top-level fields with strict defaults check
        const keysToCompare = ['client_name', 'phone', 'payment_mode', 'payment_status', 'grand_total', 'sale_date'];
        const defaultValues = {
          client_name: "Cash Customer",
          phone: "0000000000",
          payment_mode: "Cash",
          payment_status: "Done"
        };

        keysToCompare.forEach(key => {
          let oldVal = oldData[key];
          let newVal = newData[key];

          if (key === 'sale_date') {
            const sOld = normalizeDate(oldVal);
            const sNew = normalizeDate(newVal);

            // STRICT SKIP: Same date OR old was empty OR new is empty
            if (sOld === sNew || !sOld || !sNew) return;

            changedOld[key] = sOld;
            changedNew[key] = sNew;
          } else if (key === 'grand_total') {
            // Only log total change if there's a significant difference (more than 0.01)
            const oTotal = parseFloat(oldVal || 0);
            const nTotal = parseFloat(newVal || 0);
            if (Math.abs(oTotal - nTotal) > 0.01) {
              changedOld[key] = oTotal.toFixed(2);
              changedNew[key] = nTotal.toFixed(2);
            }
          } else {
            const sOld = String(oldVal || "").trim();
            const sNew = String(newVal || "").trim();

            if (sOld !== sNew) {
              // Ignore changes from empty/null to default value
              if ((!sOld || sOld === "-" || sOld === "undefined") && sNew === defaultValues[key]) {
                // Skip
              } else {
                changedOld[key] = sOld || "-";
                changedNew[key] = sNew || "-";
              }
            }
          }
        });

        // Compare items with normalization
        const normalizeItem = (i) => {
          const name = String(i.item_name || i.name || "").trim();
          const size = String(i.size || "").trim();
          const color = String(i.color || "").trim();
          const qty = parseFloat(i.qty || 0);
          const price = parseFloat(i.price || i.rate || 0).toFixed(2);
          return `${name}|${size}|${color}|${qty}|${price}`;
        };

        const oldItemsStr = JSON.stringify(oldData.items.map(normalizeItem).sort());
        const newItemsStr = JSON.stringify(newData.items.map(normalizeItem).sort());

        if (oldItemsStr !== newItemsStr) {
          changedOld.items = oldData.items;
          changedNew.items = newData.items;
        }

        if (req.body.is_replaced) {
          // 6. Log to item_replacements if it's a replacement flow
          // Capture the FULL SNAPSHOT: Before (All original) vs After (Retained + New)
          const originalItems = oldData.items.map(i => ({
            category: i.category,
            item_name: i.item_name,
            size: i.size,
            color: i.color,
            qty: i.qty,
            rate: i.price
          }));
          const originalTotal = oldData.grand_total;

          const replacedItems = items.map(i => ({
            category: i.category,
            item_name: i.item_name || i.name,
            size: i.size,
            color: i.color,
            qty: i.qty,
            rate: i.rate || i.price
          }));

          const logReplSql = `
            INSERT INTO item_replacements
            (invoice_no, client_name, original_items, replaced_items, original_total, new_total, processed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(logReplSql, [
            norm_invoice_no,
            final_client_name,
            JSON.stringify(originalItems),
            JSON.stringify(replacedItems),
            originalTotal,
            final_grand_total,
            edited_by || "Admin"
          ], (repErr) => {
            if (repErr) console.error("Error logging replacement:", repErr);
            return res.json({ message: "Sale updated (Replacement logged)" });
          });
        } else if (Object.keys(changedOld).length > 0) {
          // 5. Log to edit_logs ONLY for regular edits
          const logSql = "INSERT INTO edit_logs (invoice_no, client_name, old_data, new_data, edited_by) VALUES (?, ?, ?, ?, ?)";
          db.query(logSql, [
            norm_invoice_no,
            newData.client_name,
            JSON.stringify(changedOld),
            JSON.stringify(changedNew),
            edited_by || "Admin"
          ], (logErr) => {
            if (logErr) console.error("Error writing edit log:", logErr);
            return res.json({ message: "Sale updated (Edit logged)" });
          });
        } else {
          return res.json({ message: "Sale updated successfully" });
        }
      });
    });
  });
};

/* ================= SAVE SALES ================= */
export const saveSalesBill = (req, res) => {

  const { invoice_no, client_name, phone, items, grand_total, payment_mode } = req.body;

  // Log every request to /api/billing/save
  console.log("[saveSalesBill] --- New request received ---");
  console.log("[saveSalesBill] Request body:", JSON.stringify(req.body, null, 2));

  // Use defaults if missing
  const final_client_name = client_name || "Cash Customer";
  const final_phone = phone || "0000000000";

  let missingFields = [];
  if (!invoice_no) missingFields.push('invoice_no');

  // Items can be empty ONLY for CN/refund redemption where customer gets money back
  const isRedemption = req.body.is_cn_update || req.body.redeemed_refund_id;
  if (!isRedemption && (!items || !Array.isArray(items) || items.length === 0)) {
    missingFields.push('items');
  }

  if (missingFields.length > 0) {
    console.error(`[saveSalesBill] Missing required fields: ${missingFields.join(', ')}`);
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  const saleDate = new Date();

  // If no new items (pure refund/give-back scenario), skip the INSERT
  // and go straight to processing the CN/refund redemption
  if (!items || items.length === 0) {
    console.log(`[saveSalesBill] No new items — pure redemption/refund for invoice_no: ${invoice_no}`);

    if (req.body.redeemed_cn_no) {
      console.log(`[saveSalesBill] Redeeming Credit Note: ${req.body.redeemed_cn_no}`);
      const cnUpdateSql = "UPDATE credit_notes SET status = 'Redeemed', redeemed_invoice_no = ?, redeemed_date = NOW() WHERE credit_note_no = ?";
      db.query(cnUpdateSql, [invoice_no, req.body.redeemed_cn_no], (cnErr) => {
        if (cnErr) console.error("[saveSalesBill] Error updating redeemed CN:", cnErr);
        else console.log(`[saveSalesBill] Credit Note ${req.body.redeemed_cn_no} marked as redeemed.`);
      });
    }

    if (req.body.redeemed_refund_id) {
      console.log(`[saveSalesBill] Redeeming Cash Refund ID: ${req.body.redeemed_refund_id}`);
      const rfUpdateSql = "UPDATE cash_refunds SET status = 'Redeemed', redeemed_invoice_no = ?, redeemed_date = NOW() WHERE id = ?";
      db.query(rfUpdateSql, [invoice_no, req.body.redeemed_refund_id], (rfErr) => {
        if (rfErr) console.error("[saveSalesBill] Error updating redeemed Refund:", rfErr);
        else console.log(`[saveSalesBill] Cash Refund ID ${req.body.redeemed_refund_id} marked as redeemed.`);
      });
    }

    return res.json({ message: "Redemption processed — give amount back to customer", invoice_no });
  }

  const values = items.map(item => [
    invoice_no,
    final_client_name,
    final_phone,
    saleDate,
    item.category,
    item.name || item.item_name,
    item.size || "",
    item.color || "",
    item.qty,
    item.price,
    item.qty * item.price,
    item.gst ?? item.gst_percent ?? 5,
    grand_total,
    payment_mode || "Cash",
    item.payment_status || "",
    req.body.is_cn_update ? 1 : 0,
    req.body.is_replaced ? 1 : 0
  ]);

  const sql = `
    INSERT INTO sales_items
    (
      invoice_no,
      client_name,
      phone,
      sale_date,
      category,
      item_name,
      size,
      color,
      qty,
      price,
      total,
      gst_percent,
      grand_total,
      payment_mode,
      payment_status,
      is_cn_update,
      is_replaced
    )
    VALUES ?
  `;

  db.query(sql, [values], err => {
    if (err) {
      console.error("[saveSalesBill] SQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    // Update system_stock for each item (reduce available)
    items.forEach(item => {
      const { category, name, item_name, color, size, qty } = item;
      const itemName = name || item_name;
      db.query(
        `INSERT INTO system_stock (category, item_name, color, size, available)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE available = available - ?`,
        [category, itemName, color, size, -qty, qty]
      );
    });
    console.log("[saveSalesBill] Sale saved successfully for invoice_no:", invoice_no);

    // --- HANDLE CREDIT NOTE REDEMPTION ---
    if (req.body.redeemed_cn_no) {
      console.log(`[saveSalesBill] Redeeming Credit Note: ${req.body.redeemed_cn_no}`);
      const cnUpdateSql = "UPDATE credit_notes SET status = 'Redeemed', redeemed_invoice_no = ?, redeemed_date = NOW() WHERE credit_note_no = ?";
      db.query(cnUpdateSql, [invoice_no, req.body.redeemed_cn_no], (cnErr) => {
        if (cnErr) console.error("[saveSalesBill] Error updating redeemed CN:", cnErr);
        else console.log(`[saveSalesBill] Credit Note ${req.body.redeemed_cn_no} successfully marked as redeemed.`);
      });
    }

    // --- HANDLE CASH REFUND REDEMPTION ---
    if (req.body.redeemed_refund_id) {
      console.log(`[saveSalesBill] Redeeming Cash Refund ID: ${req.body.redeemed_refund_id}`);
      const rfUpdateSql = "UPDATE cash_refunds SET status = 'Redeemed', redeemed_invoice_no = ?, redeemed_date = NOW() WHERE id = ?";
      db.query(rfUpdateSql, [invoice_no, req.body.redeemed_refund_id], (rfErr) => {
        if (rfErr) console.error("[saveSalesBill] Error updating redeemed Refund:", rfErr);
        else console.log(`[saveSalesBill] Cash Refund ID ${req.body.redeemed_refund_id} successfully marked as redeemed.`);
      });
    }

    // Return invoice_no in response for frontend sync
    res.json({ message: "Sale saved successfully", invoice_no });
  });
};

/* ================= GET ALL SALES ================= */
export const getAllSales = (req, res) => {
  const sql = `
    SELECT s.*, 
    (SELECT COUNT(*) FROM item_replacements r WHERE r.invoice_no = s.invoice_no) as replacement_count 
    FROM sales_items s 
    ORDER BY s.sale_date DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    const billsMap = {};

    rows.forEach(row => {
      if (!billsMap[row.invoice_no]) {
        billsMap[row.invoice_no] = {
          invoice_no: row.invoice_no,
          client_name: row.client_name,
          phone: row.phone,
          sale_date: row.sale_date,
          grand_total: row.grand_total,
          payment_mode: row.payment_mode || "Cash",
          payment_status: row.payment_status || "",
          is_replaced: row.is_replaced === 1 || row.replacement_count > 0,
          is_cn_update: row.is_cn_update === 1,
          is_cash_refunded: row.is_cash_refunded === 1,
          items: []
        };
      }

      billsMap[row.invoice_no].items.push({
        id: row.id,
        category: row.category,
        item_name: row.item_name,
        size: row.size,
        color: row.color,
        qty: row.qty,
        price: row.price,
        total: row.total,
        gst: row.gst_percent ?? 5,
        payment_status: row.payment_status || "",
        is_cn_update: row.is_cn_update === 1 ? 1 : 0,
        is_cash_refunded: row.is_cash_refunded === 1 ? 1 : 0
      });
    });

    res.json({ bills: Object.values(billsMap) });
  });
};

/* ================= GET SINGLE BILL ================= */
export const getBillByInvoice = (req, res) => {
  const { invoice_no } = req.params;
  console.log(`[getBillByInvoice] Fetching bill for: "${invoice_no}"`);

  // Use REPLACE to be robust against space variations (e.g., "INV-1" vs "INV - 1")
  const sql = "SELECT * FROM sales_items WHERE REPLACE(invoice_no, ' ', '') = REPLACE(?, ' ', '')";

  db.query(sql, [invoice_no], (err, rows) => {
    if (err) {
      console.error("[getBillByInvoice] DB Error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      console.warn(`[getBillByInvoice] Bill not found for: "${invoice_no}"`);
      return res.status(404).json({ error: `Invoice ${invoice_no} not found in sales records` });
    }

    console.log(`[getBillByInvoice] Found ${rows.length} items for bill ${rows[0].invoice_no}`);

    const bill = {
      invoice_no: rows[0].invoice_no,
      client_name: rows[0].client_name || "Cash Customer",
      phone: rows[0].phone || "-",
      sale_date: rows[0].sale_date,
      payment_mode: rows[0].payment_mode || "Cash",
      payment_status: rows[0].payment_status || "",
      is_cn_update: rows[0].is_cn_update === 1,
      is_cash_refunded: rows[0].is_cash_refunded === 1,
      sub_total: rows[0].sub_total || 0,
      tax_amount: rows[0].tax_amount || 0,
      total_amount: rows[0].grand_total || 0,
      items: JSON.stringify(rows.map(row => ({
        category: row.category,
        item_name: row.item_name,
        size: row.size,
        color: row.color,
        qty: row.qty,
        rate: row.price,
        gst: row.gst_percent ?? 0
      })))
    };
    res.json({ success: true, bill });
  });
};

// ================= GET UNIQUE CLIENTS =================
export const getUniqueClients = (req, res) => {
  const sql = "SELECT DISTINCT client_name, phone FROM sales_items WHERE client_name != 'Cash Customer'";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ clients: rows });
  });
};

// ================= EDIT LOG FUNCTIONS =================

// Create edit_logs table if not exists
const createEditLogsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS edit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no VARCHAR(50) NOT NULL,
      client_name VARCHAR(100),
      old_data LONGTEXT,
      new_data LONGTEXT,
      edited_by VARCHAR(100) NOT NULL,
      edit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invoice (invoice_no)
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating edit_logs table:", err);
  });

  // Add columns if table already exists (for existing systems)
  // Catching ER_DUP_FIELDNAME (1060) to ignore if column already exists
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

  addColumnSafe("ALTER TABLE edit_logs ADD COLUMN client_name VARCHAR(100) AFTER invoice_no", "client_name");
  addColumnSafe("ALTER TABLE edit_logs ADD COLUMN old_data LONGTEXT AFTER client_name", "old_data");
  addColumnSafe("ALTER TABLE edit_logs ADD COLUMN new_data LONGTEXT AFTER old_data", "new_data");

  // Add is_cn_update and is_replaced to sales_items
  addColumnSafe("ALTER TABLE sales_items ADD COLUMN is_cn_update TINYINT(1) DEFAULT 0", "is_cn_update");
  addColumnSafe("ALTER TABLE sales_items ADD COLUMN is_replaced TINYINT(1) DEFAULT 0", "is_replaced");
};
console.log("👉 [billing.controller.js] Loaded (Fix applied)");
// createEditLogsTable();

// Get edit count for a bill
export const getEditCount = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) {
    return res.status(400).json({ error: "Missing invoice_no" });
  }
  const sql = "SELECT COUNT(*) as count FROM edit_logs WHERE invoice_no = ?";
  db.query(sql, [invoice_no], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ editCount: result[0]?.count || 0 });
  });
};

// Verify edit credentials (using SalesLogin credentials)
export const verifyEditCredentials = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  // Check against sales_users table or use default admin
  const sql = "SELECT * FROM sales_users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      // If table doesn't exist, check default credentials
      if (username === "admin" && password === "admin123") {
        return res.json({ valid: true, name: "Admin" });
      }
      return res.status(500).json({ error: err.message });
    }
    if (result.length > 0) {
      res.json({ valid: true, name: result[0].name || result[0].username });
    } else {
      // Fallback to default admin credentials
      if (username === "admin" && password === "admin123") {
        return res.json({ valid: true, name: "Admin" });
      }
      res.json({ valid: false });
    }
  });
};

// Log an edit
export const logEdit = (req, res) => {
  const { invoice_no, client_name, edited_by, old_data, new_data } = req.body;
  if (!invoice_no || !edited_by) {
    return res.status(400).json({ error: "Missing invoice_no or edited_by" });
  }
  // Only log changed fields
  const changedOld = {};
  const changedNew = {};
  if (old_data && new_data) {
    Object.keys(new_data).forEach(key => {
      if (old_data[key] !== new_data[key]) {
        changedOld[key] = old_data[key];
        changedNew[key] = new_data[key];
      }
    });
  }
  const sql = "INSERT INTO edit_logs (invoice_no, client_name, old_data, new_data, edited_by) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [
    invoice_no,
    client_name || '',
    JSON.stringify(changedOld),
    JSON.stringify(changedNew),
    edited_by
  ], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// Get edit history for a bill
export const getEditHistory = (req, res) => {
  const { invoice_no } = req.params;
  if (!invoice_no) {
    return res.status(400).json({ error: "Missing invoice_no" });
  }
  const sql = "SELECT invoice_no, client_name, old_data, new_data, edited_by, edit_time FROM edit_logs WHERE invoice_no = ? ORDER BY edit_time DESC";
  db.query(sql, [invoice_no], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ history: result });
  });
};

// Get all edit logs (for admin)
export const getAllEditLogs = (req, res) => {
  const sql = "SELECT * FROM edit_logs ORDER BY edit_time DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs: result });
  });
};

// ================= DELETE LOGS =================
export const deleteSalesEditLog = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM edit_logs WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Log deleted successfully" });
  });
};

// ================= GET DAILY SUMMARY =================
export const getDailySummary = (req, res) => {
  const queryDate = req.query.date; // Expecting YYYY-MM-DD
  const targetDate = queryDate || new Date().toISOString().split('T')[0];
  const afterTime = req.query.afterTime || null; // Optional: HH:MM:SS — only include records after this time

  // Build time condition for sales_items
  const salesTimeCondition = afterTime ? ` AND sale_date > CONCAT(?, ' ', ?)` : '';
  const salesTimeParams = afterTime ? [targetDate, afterTime] : [];

  // Build time condition for refunds
  const refundTimeCondition = afterTime ? ` AND refund_date > CONCAT(?, ' ', ?)` : '';
  const refundTimeParams = afterTime ? [targetDate, afterTime] : [];

  // Build time condition for credit notes
  const cnTimeCondition = afterTime ? ` AND issued_date > CONCAT(?, ' ', ?)` : '';
  const cnTimeParams = afterTime ? [targetDate, afterTime] : [];

  // Build time condition for replacements
  const replTimeCondition = afterTime ? ` AND replacement_date > CONCAT(?, ' ', ?)` : '';
  const replTimeParams = afterTime ? [targetDate, afterTime] : [];

  // 1. Sales by Payment Mode (subquery gets unique invoices first)
  const salesSql = `
    SELECT payment_mode, SUM(grand_total) as total_amount, COUNT(*) as invoice_count
    FROM (
      SELECT DISTINCT invoice_no, payment_mode, grand_total, sale_date 
      FROM sales_items 
      WHERE DATE(sale_date) = ?${salesTimeCondition}
    ) as unique_bills
    GROUP BY payment_mode
  `;

  // 2. Cash Refunds today (split by stored refund_mode)
  const refundsSql = `
    SELECT 
      IFNULL(SUM(amount), 0) as total,
      IFNULL(SUM(CASE WHEN IFNULL(refund_mode, 'Cash') = 'Cash' THEN amount ELSE 0 END), 0) as cash_total,
      IFNULL(SUM(CASE WHEN IFNULL(refund_mode, 'Cash') != 'Cash' THEN amount ELSE 0 END), 0) as online_total
    FROM cash_refunds
    WHERE DATE(refund_date) = ?${refundTimeCondition}
  `;

  // 3. Credit Notes issued today
  const cnSql = `SELECT IFNULL(SUM(amount), 0) as total FROM credit_notes WHERE DATE(issued_date) = ?${cnTimeCondition}`;

  // 4. Replacements count today
  const replSql = `SELECT COUNT(*) as count FROM item_replacements WHERE DATE(replacement_date) = ?${replTimeCondition}`;

  // 5. Detailed refund list for today (include stored refund_mode)
  const refundListSql = `
    SELECT id, invoice_no, client_name, phone, amount, refund_date, issued_by, status, redeemed_invoice_no,
           IFNULL(returned_items, '[]') as returned_items,
           IFNULL(refund_mode, 'Cash') as refund_mode
    FROM cash_refunds 
    WHERE DATE(refund_date) = ?${refundTimeCondition}
    ORDER BY refund_date DESC
  `;

  // 6. Detailed credit notes list for today
  const cnListSql = `
    SELECT id, credit_note_no, invoice_no, client_name, phone, amount, issued_date, issued_by, status, redeemed_invoice_no, redeemed_date,
           IFNULL(returned_items, '[]') as returned_items
    FROM credit_notes 
    WHERE (DATE(issued_date) = ?${cnTimeCondition}) OR (status = 'Redeemed' AND DATE(redeemed_date) = ?${cnTimeCondition})
    ORDER BY issued_date DESC, redeemed_date DESC
  `;

  // 7. Replacements details for today
  const replListSql = `
    SELECT id, invoice_no, client_name, original_items, replaced_items, 
           original_total, new_total, replacement_date, processed_by
    FROM item_replacements 
    WHERE DATE(replacement_date) = ?${replTimeCondition}
    ORDER BY replacement_date DESC
  `;

  // 8. Detailed list of ALL sales bills for today
  const todayBillsSql = `
    SELECT DISTINCT invoice_no, client_name, phone, grand_total, payment_mode, payment_status, sale_date
    FROM sales_items 
    WHERE DATE(sale_date) = ?${salesTimeCondition}
    ORDER BY sale_date DESC
  `;

  db.query(salesSql, [targetDate, ...salesTimeParams], (err, salesRows) => {
    if (err) return res.status(500).json({ error: 'Sales query failed: ' + err.message });

    db.query(refundsSql, [targetDate, ...refundTimeParams], (err2, refundRes) => {
      if (err2) return res.status(500).json({ error: 'Refunds query failed: ' + err2.message });

      db.query(cnSql, [targetDate, ...cnTimeParams], (err3, cnRes) => {
        if (err3) return res.status(500).json({ error: 'Credit notes query failed: ' + err3.message });

        db.query(replSql, [targetDate, ...replTimeParams], (err4, replRes) => {
          if (err4) return res.status(500).json({ error: 'Replacements query failed: ' + err4.message });

          db.query(refundListSql, [targetDate, ...refundTimeParams], (err5, refundList) => {
            const safeRefundList = err5 ? [] : (refundList || []);

            db.query(cnListSql, [targetDate, ...cnTimeParams, targetDate, ...cnTimeParams], (err6, cnList) => {
              const safeCnList = err6 ? [] : (cnList || []);

              db.query(replListSql, [targetDate, ...replTimeParams], (err7, replList) => {
                const safeReplList = err7 ? [] : (replList || []);

                db.query(todayBillsSql, [targetDate, ...salesTimeParams], (err8, billsList) => {
                  const safeBillsList = err8 ? [] : (billsList || []);

                  const totalSales = (salesRows || []).reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
                  const totalRefunds = Number((refundRes || [{}])[0]?.total || 0);
                  const cashRefunds = Number((refundRes || [{}])[0]?.cash_total || 0);
                  const onlineRefunds = Number((refundRes || [{}])[0]?.online_total || 0);
                  const totalCN = Number((cnRes || [{}])[0]?.total || 0);

                  // --- NEW: Fetch Exchange Items for redeemed CNs/Refunds ---
                  const redeemedInvs = [
                    ...safeCnList.map(c => c.redeemed_invoice_no),
                    ...safeRefundList.map(r => r.redeemed_invoice_no)
                  ].filter(Boolean);

                  if (redeemedInvs.length === 0) {
                    return res.json({
                      date: targetDate,
                      salesSplits: salesRows || [],
                      totalSalesAmount: totalSales,
                      totalRefunds,
                      cashRefunds,
                      onlineRefunds,
                      totalCreditNotes: totalCN,
                      replacementsCount: Number((replRes || [{}])[0]?.count || 0),
                      netCollection: totalSales - totalRefunds,
                      refundList: safeRefundList,
                      creditNoteList: safeCnList,
                      replacementList: safeReplList,
                      todayBills: safeBillsList
                    });
                  }

                  const exchangeSql = "SELECT invoice_no, item_name, size, color, qty FROM sales_items WHERE invoice_no IN (?)";
                  db.query(exchangeSql, [redeemedInvs], (err9, exchangeRows) => {
                    const exchangeMap = {};
                    (exchangeRows || []).forEach(row => {
                      if (!exchangeMap[row.invoice_no]) exchangeMap[row.invoice_no] = [];
                      exchangeMap[row.invoice_no].push(row);
                    });

                    safeCnList.forEach(c => {
                      if (c.redeemed_invoice_no) c.exchange_items = exchangeMap[c.redeemed_invoice_no] || [];
                    });
                    safeRefundList.forEach(r => {
                      if (r.redeemed_invoice_no) r.exchange_items = exchangeMap[r.redeemed_invoice_no] || [];
                    });

                    res.json({
                      date: targetDate,
                      salesSplits: salesRows || [],
                      totalSalesAmount: totalSales,
                      totalRefunds,
                      cashRefunds,
                      onlineRefunds,
                      totalCreditNotes: totalCN,
                      replacementsCount: Number((replRes || [{}])[0]?.count || 0),
                      netCollection: totalSales - totalRefunds,
                      refundList: safeRefundList,
                      creditNoteList: safeCnList,
                      replacementList: safeReplList,
                      todayBills: safeBillsList
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

import db from "../db.js";

// ================= UPDATE PURCHASE BILL =================
export const updatePurchase = (req, res) => {
  const invoice_no = req.params.invoice_no;
  const {
    supplier_name,
    gstin,
    supplier_gst,
    purchase_date,
    payment_mode,
    payment_status,
    items,
    edited_by
  } = req.body;

  const final_gstin = gstin || supplier_gst || "";

  // Robust date normalization for incoming data
  const normalizeInputDate = (d) => {
    if (!d) return "";
    if (typeof d === "string") return d.slice(0, 10); // Standard YYYY-MM-DD
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    // Use UTC parts to avoid timezone shift for DATE columns
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatted_purchase_date = normalizeInputDate(purchase_date);

  if (!supplier_name || !invoice_no || !purchase_date) {
    return res.status(400).json({ message: "Supplier, invoice, and date are required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Add at least one item" });
  }

  // 1. Fetch old data for logging & stock management
  const fetchOldSql = "SELECT * FROM purchases WHERE invoice_no = ?";
  db.query(fetchOldSql, [invoice_no], (fetchErr, oldRows) => {
    if (fetchErr) return res.status(500).json({ message: fetchErr.message });
    if (!oldRows || oldRows.length === 0) return res.status(404).json({ message: "Bill not found" });

    const oldData = {
      invoice_no,
      supplier_name: oldRows[0].supplier_name,
      gstin: oldRows[0].gstin,
      purchase_date: oldRows[0].purchase_date,
      payment_mode: oldRows[0].payment_mode,
      payment_status: oldRows[0].payment_status,
      grand_total: oldRows.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      items: oldRows.map(r => ({
        category: r.category,
        item_name: r.item_name,
        size: r.size,
        color: r.color,
        qty: r.qty,
        rate: r.rate,
        amount: r.amount
      }))
    };

    // 2. Delete old items for this invoice
    db.query("DELETE FROM purchases WHERE invoice_no = ?", [invoice_no], (err) => {
      if (err) return res.status(500).json({ message: err.message });

      // 3. Prepare new values and Calculate totals
      const values = items.map(item => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || item.price || 0);
        const gst = Number(item.gst_percent || item.gst || 0);
        const base = qty * rate;
        const amount = base + (base * gst / 100);

        return [
          supplier_name,
          final_gstin,
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

      // 4. Insert new items
      const insertSql = `INSERT INTO purchases
        (supplier_name, gstin, invoice_no, purchase_date, payment_mode, payment_status, category, item_name, size, color, qty, rate, gst_percent, amount)
        VALUES ?`;
      db.query(insertSql, [values], (err2) => {
        if (err2) return res.status(500).json({ message: err2.message });

        // 5. Update system_stock
        // Restore old stock
        oldData.items.forEach(it => {
          db.query("UPDATE system_stock SET available = available - ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?", [it.qty, it.category, it.item_name, it.color, it.size]);
        });
        // Add new stock
        items.forEach(it => {
          const qty = Number(it.qty || 0);
          const iName = it.item_name || it.name || "";
          db.query(`INSERT INTO system_stock (category, item_name, color, size, available) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE available = available + ?`, [it.category || '', iName, it.color || '', it.size || '', qty, qty]);
        });

        // 6. Log the edit
        const normalizeDateForLog = (d) => {
          if (!d) return "";
          if (typeof d === "string") return d.slice(0, 10);
          const date = new Date(d);
          if (isNaN(date.getTime())) return "";
          // CRITICAL: Use UTC to extract parts from MySQL DATE objects to avoid timezone shift
          const y = date.getUTCFullYear();
          const m = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const currentGrandTotal = values.reduce((sum, v) => sum + v[13], 0);

        const newData = {
          supplier_name,
          gstin: final_gstin,
          purchase_date: formatted_purchase_date,
          payment_mode: payment_mode || "Cash",
          payment_status: payment_status || "Paid",
          grand_total: currentGrandTotal,
          items
        };

        const changedOld = {};
        const changedNew = {};

        const keysToCompare = ['supplier_name', 'gstin', 'purchase_date', 'payment_mode', 'payment_status', 'grand_total'];
        keysToCompare.forEach(key => {
          let oVal = oldData[key];
          let nVal = newData[key];

          const sOld = key === 'purchase_date' ? normalizeDateForLog(oVal) : String(oVal || "").trim();
          const sNew = key === 'purchase_date' ? normalizeDateForLog(nVal) : String(nVal || "").trim();

          if (key === 'purchase_date') {
            if (sOld === sNew || !sOld || !sNew) return; // Skip logs for same date
            changedOld[key] = sOld;
            changedNew[key] = sNew;
          } else if (key === 'grand_total') {
            const oTotal = parseFloat(oVal || 0);
            const nTotal = parseFloat(nVal || 0);
            if (Math.abs(oTotal - nTotal) > 0.01) {
              changedOld[key] = oTotal.toFixed(2);
              changedNew[key] = nTotal.toFixed(2);
            }
          } else if (sOld !== sNew) {
            changedOld[key] = sOld || "-";
            changedNew[key] = sNew || "-";
          }
        });

        // ITEM COMPARISON LOGIC
        const normalizeItem = (i) => {
          const name = String(i.item_name || i.name || "").trim();
          const size = String(i.size || "").trim();
          const color = String(i.color || "").trim();
          const qty = parseFloat(i.qty || 0);
          const rate = parseFloat(i.rate || i.price || 0).toFixed(2);
          return `${name}|${size}|${color}|${qty}|${rate}`;
        };

        const oldItemsStr = JSON.stringify(oldData.items.map(normalizeItem));
        const newItemsStr = JSON.stringify(items.map(normalizeItem));

        if (oldItemsStr !== newItemsStr) {
          changedOld.items = oldData.items;
          changedNew.items = items;
        }

        if (Object.keys(changedOld).length > 0) {
          db.query("INSERT INTO purchase_edit_logs (invoice_no, supplier_name, old_data, new_data, edited_by) VALUES (?, ?, ?, ?, ?)", [
            invoice_no, supplier_name, JSON.stringify(changedOld), JSON.stringify(changedNew), edited_by || "Admin"
          ]);
        }
        res.json({ message: "Purchase bill updated successfully" });
      });
    });
  });
};

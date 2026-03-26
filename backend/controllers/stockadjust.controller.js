import db from "../db.js";

/* =====================================================================
   AUTO-CREATE stock_adjustments TABLE
   ===================================================================== */
const initTable = () => {
    db.query(`
    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      category      VARCHAR(255) NOT NULL,
      item_name     VARCHAR(255) NOT NULL,
      color         VARCHAR(100),
      size          VARCHAR(20),
      adjusted_qty  INT DEFAULT 0,
      reason        TEXT,
      adjusted_by   VARCHAR(100) DEFAULT 'Admin',
      adjusted_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_adj (category, item_name, color, size)
    )
  `, (err) => { if (err) console.error("stock_adjustments table:", err.message); });
};
// initTable();

/* =====================================================================
   GET STOCK WITH ADJUSTMENTS
   Returns calculated stock merged with any manual adjustments
   ===================================================================== */
export const getStockWithAdjustments = (req, res) => {
    const purchasesSql = `
    SELECT category, item_name, size, color, SUM(qty) as purchased_qty
    FROM purchases
    GROUP BY category, item_name, size, color
  `;
    const salesSql = `
    SELECT category, item_name, size, color, SUM(qty) as sold_qty
    FROM sales_items
    GROUP BY category, item_name, size, color
  `;
    const masterSql = `SELECT category, item as item_name, size, color FROM masterdata`;
    const adjustSql = `
    SELECT category, item_name, size, color, SUM(adjusted_qty) as total_adjusted
    FROM stock_adjustments
    GROUP BY category, item_name, size, color
  `;

    db.query(masterSql, (errM, masterData) => {
        if (errM) return res.status(500).json({ error: errM.message });

        db.query(purchasesSql, (errP, purchases) => {
            if (errP) return res.status(500).json({ error: errP.message });

            db.query(salesSql, (errS, sales) => {
                if (errS) return res.status(500).json({ error: errS.message });

                db.query(adjustSql, (errA, adjustments) => {
                    if (errA) return res.status(500).json({ error: errA.message });

                    const map = {};
                    const key = (r) => `${r.category}|${r.item_name}|${r.size || ''}|${r.color || ''}`;

                    const init = (r) => {
                        const k = key(r);
                        if (!map[k]) {
                            map[k] = {
                                category: r.category,
                                item_name: r.item_name,
                                size: r.size || '',
                                color: r.color || '',
                                purchased: 0,
                                sold: 0,
                                adjusted: 0,
                                available: 0
                            };
                        }
                    };

                    masterData.forEach(r => init(r));
                    purchases.forEach(r => { init(r); map[key(r)].purchased += Number(r.purchased_qty) || 0; });
                    sales.forEach(r => { init(r); map[key(r)].sold += Number(r.sold_qty) || 0; });
                    adjustments.forEach(r => { init(r); map[key(r)].adjusted += Number(r.total_adjusted) || 0; });

                    Object.values(map).forEach(row => {
                        row.available = row.purchased - row.sold + row.adjusted;
                    });

                    res.json({ stock: Object.values(map) });
                });
            });
        });
    });
};

/* =====================================================================
   SAVE STOCK ADJUSTMENT
   ===================================================================== */
export const saveStockAdjustment = (req, res) => {
    const { category, item_name, color, size, adjusted_qty, reason, adjusted_by } = req.body;
    if (!category || !item_name) return res.status(400).json({ error: "category and item_name required" });

    const sql = `
    INSERT INTO stock_adjustments (category, item_name, color, size, adjusted_qty, reason, adjusted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.query(sql,
        [category, item_name, color || '', size || '', Number(adjusted_qty) || 0, reason || '', adjusted_by || 'Admin'],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Also update system_stock for real-time accuracy
            db.query(
                `INSERT INTO system_stock (category, item_name, color, size, available)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE available = available + ?`,
                [category, item_name, color || '', size || '', Number(adjusted_qty) || 0, Number(adjusted_qty) || 0],
                (err2) => {
                    // Silent — system_stock may not always have the entry
                }
            );

            res.json({ success: true, message: "Stock adjustment saved." });
        }
    );
};

/* =====================================================================
   GET ALL ADJUSTMENTS (for history view)
   ===================================================================== */
export const getAllAdjustments = (req, res) => {
    db.query("SELECT * FROM stock_adjustments ORDER BY adjusted_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ adjustments: rows });
    });
};

/* =====================================================================
   DELETE ADJUSTMENT (undo)
   ===================================================================== */
export const deleteAdjustment = (req, res) => {
    const { id } = req.params;
    // First get the adjustment to reverse system_stock
    db.query("SELECT * FROM stock_adjustments WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Not found" });

        const adj = rows[0];
        db.query("DELETE FROM stock_adjustments WHERE id = ?", [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // Reverse the system_stock change
            db.query(
                "UPDATE system_stock SET available = available - ? WHERE category = ? AND item_name = ? AND color = ? AND size = ?",
                [adj.adjusted_qty, adj.category, adj.item_name, adj.color, adj.size]
            );

            res.json({ message: "Adjustment deleted and stock reversed." });
        });
    });
};

import db from "../db.js";

// Get all available stock from system_stock table
export const getSystemStock = (req, res) => {
  db.query("SELECT * FROM system_stock", (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
};

// Create stock adjustment
export const adjustStock = (req, res) => {
  const { category, item_name, size, color, qty, type, reason, adjusted_by } = req.body;

  if (!category || !item_name || !qty || !type || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO stock_adjustments (category, item_name, size, color, qty, type, reason, adjusted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [category, item_name, size, color, qty, type, reason, adjusted_by], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Stock adjusted successfully", id: result.insertId });
  });
};

export const getStock = (req, res) => {
  db.query("SELECT id, category, item_name, color, size, available, purchased, sold, barcode FROM stock", (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
};

// Get calculated stock (purchases - sales) grouped by category, item, size, color
export const getCalculatedStock = (req, res) => {
  const BASE_STOCK = 0;
  const STATIC_PRODUCT_DATA = {
    Men: {
      "Round Neck T-Shirts": ["Plain Round Neck", "Printed Round Neck", "Striped Round Neck"],
      "Polo T-Shirts": ["Solid Polo T-Shirt", "Striped Polo T-Shirt", "Logo Polo T-Shirt"],
      Shirts: ["Casual Shirt", "Formal Shirt", "Checked Shirt", "Printed Shirt", "Denim Shirt"],
      Jeans: ["Slim Fit Jeans", "Regular Fit Jeans", "Skinny Fit Jeans", "Stretchable Jeans"]
    },
    Women: {
      "T-Shirts & Tops": ["Round Neck T-Shirt", "V-Neck T-Shirt", "Printed T-Shirt", "Crop Top", "Long Top"],
      Shirts: ["Casual Shirt", "Checked Shirt", "Printed Shirt", "Denim Shirt"],
      Jeans: ["Skinny Jeans", "High-Waist Jeans", "Mom Fit Jeans", "Straight Fit Jeans"]
    },
    Girls: {
      Clothing: ["Top", "T-Shirt", "Dress", "Frock", "Skirt", "Jeans", "Leggings"]
    }
  };

  // 1. Get all base products from masterdata
  const masterSql = "SELECT category, item as item_name, size, color FROM masterdata";

  // 2. Get total purchased quantities
  const purchasesSql = `
    SELECT category, item_name, size, color, SUM(qty) as purchased_qty
    FROM purchases
    GROUP BY category, item_name, size, color
  `;

  // 3. Get total sold quantities
  const salesSql = `
    SELECT category, item_name, size, color, SUM(qty) as sold_qty
    FROM sales_items
    GROUP BY category, item_name, size, color
  `;

  db.query(masterSql, (errM, masterData) => {
    if (errM) return res.status(500).json({ error: errM.message });

    db.query(purchasesSql, (errP, purchasesData) => {
      if (errP) return res.status(500).json({ error: errP.message });

      db.query(salesSql, (errS, salesData) => {
        if (errS) return res.status(500).json({ error: errS.message });

        const adjustmentsSql = `
          SELECT category, item_name, size, color, 
                 SUM(CASE WHEN type='reduce' THEN qty ELSE 0 END) as reduced_qty,
                 SUM(CASE WHEN type='increase' THEN qty ELSE 0 END) as increased_qty
          FROM stock_adjustments
          GROUP BY category, item_name, size, color 
        `;

        db.query(adjustmentsSql, (errA, adjustmentsData) => {
          if (errA) return res.status(500).json({ error: errA.message });

          const stockMap = {};

          // Helper to initialize entry
          const initEntry = (cat, item, sz, col) => {
            const key = `${cat}|${item}|${sz}|${col}`;
            if (!stockMap[key]) {
              stockMap[key] = {
                category: cat || "General",
                item_name: item || "Unknown Item",
                size: sz || "XXL",
                color: col || "White",
                purchased: 0,
                sold: 0,
                adjusted: 0,
                available: BASE_STOCK
              };
            }
          };

          // 1. Initialize from Master Data (actual registered combinations)
          masterData.forEach(row => initEntry(row.category, row.item_name, row.size, row.color));

          // 2. Initialize from Transactions (purchases & sales & adjustments)
          purchasesData.forEach(row => initEntry(row.category, row.item_name, row.size, row.color));
          salesData.forEach(row => initEntry(row.category, row.item_name, row.size, row.color));
          adjustmentsData.forEach(row => initEntry(row.category, row.item_name, row.size, row.color));

          // 3. Add Static Products fallback (only if no data exists for them)
          const existingProducts = new Set(Object.values(stockMap).map(s => `${s.category}|${s.item_name}`));
          Object.values(STATIC_PRODUCT_DATA).forEach(categories => {
            Object.entries(categories).forEach(([cat, items]) => {
              items.forEach(item => {
                if (!existingProducts.has(`${cat}|${item}`)) {
                  initEntry(cat, item, "XXL", "White");
                }
              });
            });
          });

          // 3. Add actual purchased quantities
          purchasesData.forEach(row => {
            const key = `${row.category}|${row.item_name}|${row.size}|${row.color}`;
            if (stockMap[key]) {
              stockMap[key].purchased = Number(row.purchased_qty) || 0;
              stockMap[key].available += stockMap[key].purchased;
            }
          });

          // 4. Subtract actual sold quantities
          salesData.forEach(row => {
            const key = `${row.category}|${row.item_name}|${row.size}|${row.color}`;
            if (stockMap[key]) {
              stockMap[key].sold = Number(row.sold_qty) || 0;
              stockMap[key].available -= stockMap[key].sold;
            }
          });

          // 5. Apply adjusted quantities (net reduction)
          adjustmentsData.forEach(row => {
            const key = `${row.category}|${row.item_name}|${row.size}|${row.color}`;
            if (stockMap[key]) {
              const res_red = Number(row.reduced_qty) || 0;
              const res_inc = Number(row.increased_qty) || 0;
              stockMap[key].adjusted = res_red - res_inc;
              stockMap[key].available -= stockMap[key].adjusted;
            }
          });

          res.json({ stock: Object.values(stockMap) });
        });
      });
    });
  });
};

// Get unique categories from purchases AND masterdata
export const getStockCategories = (req, res) => {
  const sql = `
    SELECT DISTINCT category FROM (
      SELECT DISTINCT category FROM purchases WHERE category IS NOT NULL AND category != ''
      UNION
      SELECT DISTINCT category FROM masterdata WHERE category IS NOT NULL AND category != ''
    ) AS combined
    ORDER BY category
  `;
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: data.map(r => r.category) });
  });
};

// Get unique items for a category from purchases AND masterdata
export const getStockItems = (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Category is required' });

  const sql = `
    SELECT DISTINCT item_name FROM (
      SELECT DISTINCT item_name FROM purchases WHERE category = ? AND item_name IS NOT NULL AND item_name != ''
      UNION
      SELECT DISTINCT item AS item_name FROM masterdata WHERE category = ? AND item IS NOT NULL AND item != ''
    ) AS combined
    ORDER BY item_name
  `;
  db.query(sql, [category, category], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ items: data.map(r => r.item_name) });
  });
};

// Get unique sizes for category + item from purchases AND masterdata
export const getStockSizes = (req, res) => {
  const { category, item_name } = req.query;
  if (!category || !item_name) return res.status(400).json({ error: 'Category and item_name are required' });

  const sql = `
    SELECT DISTINCT size FROM (
      SELECT DISTINCT size FROM purchases WHERE category = ? AND item_name = ? AND size IS NOT NULL AND size != ''
      UNION
      SELECT DISTINCT size FROM masterdata WHERE category = ? AND item = ? AND size IS NOT NULL AND size != ''
    ) AS combined
    ORDER BY size
  `;
  db.query(sql, [category, item_name, category, item_name], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ sizes: data.map(r => r.size) });
  });
};

// Base stock for all products
const BASE_STOCK = 50;

// Get stock for a specific product (category + item + size + all colors)
export const getStockForProduct = (req, res) => {
  const { category, item_name, size } = req.query;
  if (!category || !item_name || !size) {
    return res.status(400).json({ error: 'category, item_name, and size are required' });
  }

  // Get purchased quantities
  const purchasesSql = `
    SELECT color, SUM(qty) as purchased_qty
    FROM purchases
    WHERE category = ? AND item_name = ? AND size = ?
    GROUP BY color
  `;

  // Get sold quantities
  const salesSql = `
    SELECT color, SUM(qty) as sold_qty
    FROM sales_items
    WHERE category = ? AND item_name = ? AND size = ?
    GROUP BY color
  `;

  db.query(purchasesSql, [category, item_name, size], (err1, purchasesData) => {
    if (err1) return res.status(500).json({ error: err1.message });

    db.query(salesSql, [category, item_name, size], (err2, salesData) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Get adjusted quantities
      const adjustmentsSql = `
        SELECT color, 
               SUM(CASE WHEN type='reduce' THEN qty ELSE 0 END) as reduced_qty,
               SUM(CASE WHEN type='increase' THEN qty ELSE 0 END) as increased_qty
        FROM stock_adjustments
        WHERE category = ? AND item_name = ? AND size = ?
        GROUP BY color
      `;

      db.query(adjustmentsSql, [category, item_name, size], (err3, adjustmentsData) => {
        if (err3) return res.status(500).json({ error: err3.message });

        const stockByColor = {};

        // Helper
        const ensureColor = (c) => {
          if (!stockByColor[c]) {
            stockByColor[c] = {
              color: c,
              purchased: 0,
              sold: 0,
              adjusted: 0,
              available: BASE_STOCK
            };
          }
        };

        // Add purchased quantities
        purchasesData.forEach(row => {
          ensureColor(row.color);
          stockByColor[row.color].purchased = Number(row.purchased_qty) || 0;
        });

        // Subtract sold quantities
        salesData.forEach(row => {
          ensureColor(row.color);
          stockByColor[row.color].sold = Number(row.sold_qty) || 0;
        });

        // Apply adjusted quantities (net reduction)
        adjustmentsData.forEach(row => {
          ensureColor(row.color);
          const res_red = Number(row.reduced_qty) || 0;
          const res_inc = Number(row.increased_qty) || 0;
          stockByColor[row.color].adjusted = res_red - res_inc;
        });

        // Calculate final available for all colors: 50 + purchased - sold - adjusted
        Object.keys(stockByColor).forEach(color => {
          stockByColor[color].available = BASE_STOCK + (stockByColor[color].purchased || 0) - (stockByColor[color].sold || 0) - (stockByColor[color].adjusted || 0);
        });

        res.json({ stock: Object.values(stockByColor) });
      });
    });
  });
};

export const getAdjustmentLogs = (req, res) => {
  const q = `
    SELECT id, category, item_name, size, color, qty, type, reason, adjustment_date AS adjusted_at, adjusted_by 
    FROM stock_adjustments
    ORDER BY adjustment_date DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs: data });
  });
};

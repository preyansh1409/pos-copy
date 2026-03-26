import db from '../db.js';

// Get the next available barcode value (for preview)
// Get the next available barcode value (for preview)
export const getNextBarcode = (req, res) => {
  // Find the max barcode number from masterdata (extract numeric part from PRD-XXXXXX)
  db.query('SELECT MAX(CAST(SUBSTRING(barcode, 5) AS UNSIGNED)) AS maxNum FROM masterdata WHERE barcode LIKE "PRD-%"', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error (barcode max)', error: err });
    const nextBarcodeNum = (results[0].maxNum || 0) + 1;
    const barcodeValue = `PRD-${nextBarcodeNum.toString().padStart(6, '0')}`;
    res.json({ nextBarcode: barcodeValue });
  });
};
// Get all distinct colors for a category
export const getColorsForCategory = (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  db.query('SELECT DISTINCT color FROM masterdata WHERE category = ? AND color IS NOT NULL AND color != ""', [category], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ colors: results.map(r => r.color) });
  });
};

// Get all distinct sizes for a category
export const getSizesForCategory = (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  db.query('SELECT DISTINCT size FROM masterdata WHERE category = ? AND size IS NOT NULL AND size != ""', [category], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ sizes: results.map(r => r.size) });
  });
};
// Get all distinct colors
export const getAllColors = (req, res) => {
  db.query('SELECT DISTINCT color FROM masterdata WHERE color IS NOT NULL AND color != ""', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ colors: results.map(r => r.color) });
  });
};


// Add a new product (category, color, item)

// Add a new product and generate a unique barcode (always next available, never duplicate)
// Now generates all size-color combinations with sequential barcodes
// Add a new product and generate a unique barcode (always next available, never duplicate)
// Now generates all size-color combinations with sequential barcodes
export const addProduct = async (req, res) => {
  const { category, color, item, items, sizes } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });

  const DEFAULT_COLORS = ["Black", "White", "Blue", "Grey"];
  const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

  const colorsArr = Array.isArray(color) && color.length > 0 ? color : DEFAULT_COLORS;
  const sizesArr = Array.isArray(sizes) && sizes.length > 0 ? sizes : DEFAULT_SIZES;
  const itemsArr = Array.isArray(items) ? items : (item ? [item] : []);

  if (itemsArr.length === 0) return res.status(400).json({ message: 'Item name(s) required' });

  const totalGenerated = [];

  try {
    for (const itemName of itemsArr) {
      // 1. Check if item exists to reuse base barcode
      const existing = await new Promise((resolve) => {
        db.query('SELECT barcode FROM masterdata WHERE category = ? AND item = ? LIMIT 1', [category, itemName], (err, rows) => {
          resolve(rows && rows.length > 0 ? rows[0].barcode : null);
        });
      });

      let baseBarcode;
      if (existing) {
        baseBarcode = existing.split('-').slice(0, 2).join('-');
      } else {
        const maxRes = await new Promise((resolve) => {
          db.query('SELECT MAX(CAST(SUBSTRING(barcode, 5) AS UNSIGNED)) AS maxNum FROM masterdata WHERE barcode LIKE "PRD-%"', (err, rows) => {
            resolve(rows[0].maxNum || 0);
          });
        });
        baseBarcode = `PRD-${(maxRes + 1).toString().padStart(6, '0')}`;
      }

      const sizesString = sizesArr.join(',');

      for (const size of sizesArr) {
        for (const col of colorsArr) {
          const fullBarcode = `${baseBarcode}-${size}-${col}`;

          await new Promise((resolve, reject) => {
            db.query('SELECT id FROM masterdata WHERE barcode = ?', [fullBarcode], (errDup, resDup) => {
              if (resDup && resDup.length > 0) return resolve(); // Skip existing

              db.query(
                'INSERT INTO masterdata (category, color, item, size, barcode, product_code, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [category, col, itemName, size, fullBarcode, baseBarcode, sizesString],
                (errI, result) => {
                  if (errI) return reject(errI);
                  totalGenerated.push(fullBarcode);
                  // Sync barcodes table
                  db.query('INSERT IGNORE INTO barcodes (product_code, barcode) VALUES (?, ?)', [result.insertId, fullBarcode], () => resolve());
                }
              );
            });
          });
        }
      }
      // Update sizes string for all variants of this item to be consistent
      db.query('UPDATE masterdata SET sizes = ? WHERE category = ? AND item = ?', [sizesString, category, itemName]);
    }

    res.json({ success: true, count: totalGenerated.length, generatedBarcodes: totalGenerated });
  } catch (error) {
    res.status(500).json({ message: 'Error adding products', error: error.message });
  }
};

// Get all categories (distinct)
export const getCategories = (req, res) => {
  db.query('SELECT DISTINCT category FROM masterdata', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ categories: results.map(r => r.category) });
  });
};


// Get all products (category, color, item, size, barcode)
export const getAllProducts = (req, res) => {
  db.query('SELECT category, color, item, size, barcode FROM masterdata', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ data: results });
  });
};

// Get items for a given category
export const getItemsByCategory = (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ message: 'Category is required' });

  // Select item and a representative barcode to extract the base PRD code
  // Use MAX to avoid picking empty strings if some variants are missing barcodes
  const sql = `
    SELECT item, MAX(barcode) as barcode 
    FROM masterdata 
    WHERE TRIM(category) = TRIM(?) 
    GROUP BY item
  `;

  db.query(sql, [category], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    const itemsWithCodes = results.map(r => {
      // Extract PRD-XXXXXX base from full barcode (e.g. PRD-000001-S-Black)
      const baseCode = r.barcode ? r.barcode.split('-').slice(0, 2).join('-') : "";
      return {
        name: r.item,
        code: baseCode
      };
    });

    res.json({ items: itemsWithCodes });
  });
};

// Get existing variants for category + item
export const getExistingVariants = (req, res) => {
  const { category, item } = req.query;
  if (!category || !item) return res.status(400).json({ message: 'Category and Item are required' });
  db.query('SELECT color, size, barcode FROM masterdata WHERE category = ? AND item = ?', [category, item], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ variants: results });
  });
};

// Modify/Add new variants to existing product(s)
export const modifyProduct = async (req, res) => {
  const { category, items, newSizes, newColors, manualBaseCode } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });

  const itemsArr = Array.isArray(items) ? items : [];
  if (itemsArr.length === 0) return res.status(400).json({ message: 'Item name(s) required' });

  const nSizes = Array.isArray(newSizes) ? newSizes : [];
  const nColors = Array.isArray(newColors) ? newColors : [];
  const totalGenerated = [];

  try {
    for (const itemName of itemsArr) {
      // 1. Fetch current state
      const currentVariants = await new Promise((resolve, reject) => {
        db.query('SELECT size, color, barcode FROM masterdata WHERE category = ? AND item = ?', [category, itemName], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      });

      let baseBarcode = "";
      let existingSizes = [];
      let existingColors = [];

      if (currentVariants.length > 0) {
        baseBarcode = currentVariants[0].barcode.split('-').slice(0, 2).join('-');
        existingSizes = Array.from(new Set(currentVariants.map(v => v.size)));
        existingColors = Array.from(new Set(currentVariants.map(v => v.color)));
      } else {
        if (manualBaseCode && itemsArr.length === 1) {
          baseBarcode = manualBaseCode;
        } else {
          const maxRes = await new Promise((resolve) => {
            db.query('SELECT MAX(CAST(SUBSTRING(barcode, 5) AS UNSIGNED)) AS maxNum FROM masterdata WHERE barcode LIKE "PRD-%"', (err, rows) => {
              resolve(rows[0].maxNum || 0);
            });
          });
          baseBarcode = `PRD-${(maxRes + 1).toString().padStart(6, '0')}`;
        }
      }

      // Expansion logic paired with existing attributes
      const combinations = [];
      // Only use default sizes/colors if nothing exists and nothing new is provided
      const effSizes = existingSizes.length > 0 ? existingSizes : (nSizes.length > 0 ? [] : ["S", "M", "L", "XL", "XXL"]);
      const effColors = existingColors.length > 0 ? existingColors : (nColors.length > 0 ? [] : []); // No 'Default' fallback

      // 1. New Colors x Existing Sizes (or defaults if new)
      nColors.forEach(nc => (effSizes.length > 0 ? effSizes : ["S", "M", "L", "XL", "XXL"]).forEach(es => combinations.push({ s: es, c: nc })));
      // 2. New Sizes x Existing Colors (or defaults if new)
      nSizes.forEach(ns => (effColors.length > 0 ? effColors : []).forEach(ec => combinations.push({ s: ns, c: ec })));
      // 3. New Size x New Color
      nSizes.forEach(ns => nColors.forEach(nc => combinations.push({ s: ns, c: nc })));

      const uniqueCombs = Array.from(new Set(combinations.map(c => `${c.s}|${c.c}`))).map(k => {
        const [s, c] = k.split('|');
        return { s, c };
      });

      const updatedSizesString = Array.from(new Set([...existingSizes, ...nSizes, ...effSizes])).join(',');

      for (const comb of uniqueCombs) {
        const fullBarcode = `${baseBarcode}-${comb.s}-${comb.c}`;
        await new Promise((resolve, reject) => {
          db.query('SELECT id FROM masterdata WHERE barcode = ?', [fullBarcode], (errDup, resDup) => {
            if (resDup && resDup.length > 0) return resolve();
            db.query(
              'INSERT INTO masterdata (category, color, item, size, barcode, product_code, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [category, comb.c, itemName, comb.s, fullBarcode, baseBarcode, updatedSizesString],
              (errI, result) => {
                if (errI) return reject(errI);
                totalGenerated.push(fullBarcode);
                db.query('INSERT IGNORE INTO barcodes (product_code, barcode) VALUES (?, ?)', [result.insertId, fullBarcode], () => resolve());
              }
            );
          });
        });
      }
      // Update sizes string for all variants of this item to be consistent
      db.query('UPDATE masterdata SET sizes = ? WHERE category = ? AND item = ?', [updatedSizesString, category, itemName]);
    }

    res.json({ success: true, count: totalGenerated.length, generatedBarcodes: totalGenerated });
  } catch (error) {
    res.status(500).json({ message: 'Error adding products', error: error.message });
  }
};
// Get product by barcode (for billing lookup)
export const getProductByBarcode = (req, res) => {
  const { barcode } = req.query;
  if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

  // Helper function to get latest price from purchases table
  const getLatestPrice = (category, itemName, size, color, callback) => {
    const sql = `
      SELECT rate FROM purchases 
      WHERE category = ? AND item_name = ? AND size = ? AND color = ?
      ORDER BY purchase_date DESC 
      LIMIT 1
    `;
    db.query(sql, [category, itemName, size, color], (err, results) => {
      if (err || results.length === 0) {
        callback(0);
      } else {
        callback(results[0].rate || 0);
      }
    });
  };

  // First try exact match in masterdata.barcode (full barcode like PRD-000001-S-Black)
  db.query('SELECT id, category, color, item, size, barcode FROM masterdata WHERE barcode = ?', [barcode], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    if (results.length > 0) {
      const product = results[0];
      // Get latest price from purchases - use product.item as item_name
      getLatestPrice(product.category, product.item, product.size, product.color, (latestPrice) => {
        return res.json({
          found: true,
          barcode: product.barcode,
          name: product.item || product.category,
          category: product.category,
          color: product.color,
          size: product.size,
          price: latestPrice
        });
      });
      return;
    }

    // Fallback: Extract base barcode and look up in barcodes table
    const baseMatch = barcode.match(/^(PRD-\d{6})/);
    if (!baseMatch) return res.status(404).json({ message: 'Product not found' });

    const baseBarcode = baseMatch[1];
    db.query('SELECT product_code FROM barcodes WHERE barcode = ? OR barcode LIKE ?', [baseBarcode, `${baseBarcode}%`], (err2, barcodeResults) => {
      if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
      if (barcodeResults.length === 0) return res.status(404).json({ message: 'Product not found' });

      const productId = barcodeResults[0].product_code;
      db.query('SELECT id, category, color, item, size, barcode FROM masterdata WHERE id = ?', [productId], (err3, productResults) => {
        if (err3) return res.status(500).json({ message: 'DB error', error: err3 });
        if (productResults.length === 0) return res.status(404).json({ message: 'Product not found in masterdata' });

        const product = productResults[0];
        // Get latest price from purchases - use product.item as item_name
        getLatestPrice(product.category, product.item, product.size, product.color, (latestPrice) => {
          res.json({
            found: true,
            barcode: product.barcode || baseBarcode,
            name: product.item || product.category,
            category: product.category,
            color: product.color,
            size: product.size,
            price: latestPrice
          });
        });
      });
    });
  });
};

// Get latest price (Prioritize Sales History -> Purchase cost -> 0)
export const getLatestPrice = (req, res) => {
  const { category, item_name, size, color } = req.query;
  if (!category || !item_name || !size || !color) {
    return res.status(400).json({ message: 'category, item_name, size, and color are required' });
  }

  // 1. Get official barcode (optional but good for reference)
  const barcodeSql = `SELECT barcode FROM masterdata WHERE category = ? AND item = ? AND size = ? AND color = ? LIMIT 1`;

  db.query(barcodeSql, [category, item_name, size, color], (err, barcodeResults) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    const officialBarcode = barcodeResults[0]?.barcode || "";

    // 2. CHECK SALES HISTORY (Selling Price)
    const salesSql = `
      SELECT price FROM sales_items 
      WHERE category = ? AND item_name = ? AND size = ? AND color = ?
      ORDER BY sale_date DESC, id DESC
      LIMIT 1
    `;

    db.query(salesSql, [category, item_name, size, color], (err2, salesResults) => {
      if (err2) return res.status(500).json({ message: 'DB error (sales lookup)', error: err2 });

      if (salesResults.length > 0) {
        return res.json({
          price: salesResults[0].price || 0,
          barcode: officialBarcode,
          source: 'sales'
        });
      }

      // 3. FALLBACK: PURCHASE HISTORY (Cost Price)
      const purchaseSql = `
        SELECT rate FROM purchases 
        WHERE category = ? AND item_name = ? AND size = ? AND color = ?
        ORDER BY purchase_date DESC 
        LIMIT 1
      `;

      db.query(purchaseSql, [category, item_name, size, color], (err3, purchaseResults) => {
        if (err3) return res.status(500).json({ message: 'DB error (purchase lookup)', error: err3 });

        if (purchaseResults.length > 0) {
          return res.json({
            price: purchaseResults[0].rate || 0,
            barcode: officialBarcode,
            source: 'purchase'
          });
        }

        // 4. FINAL FALLBACK: Any variant of same item (Sales then Purchase)
        const fallbackSalesSql = `SELECT price FROM sales_items WHERE category=? AND item_name=? ORDER BY sale_date DESC LIMIT 1`;

        db.query(fallbackSalesSql, [category, item_name], (err4, fbSales) => {
          if (fbSales && fbSales.length > 0) {
            return res.json({ price: fbSales[0].price, barcode: officialBarcode, source: 'sales_fallback' });
          }

          // If no sales fallback, try purchase fallback
          const fallbackPurchSql = `SELECT rate FROM purchases WHERE category=? AND item_name=? ORDER BY purchase_date DESC LIMIT 1`;
          db.query(fallbackPurchSql, [category, item_name], (err5, fbPurch) => {
            return res.json({
              price: fbPurch && fbPurch.length > 0 ? fbPurch[0].rate : 0,
              barcode: officialBarcode,
              source: 'final_fallback'
            });
          });
        });
      });
    });
  });
};

// Get GST for a category
export const getGstForCategory = (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  db.query('SELECT gst FROM category_gst WHERE category = ?', [category], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (results.length === 0) return res.json({ gst: 5 }); // Default GST 5%
    res.json({ gst: results[0].gst });
  });
};

// Set GST for a category (insert or update)
export const setGstForCategory = (req, res) => {
  const { category, gst } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  if (gst === undefined || gst === null) return res.status(400).json({ message: 'GST is required' });
  // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
  db.query('INSERT INTO category_gst (category, gst) VALUES (?, ?) ON DUPLICATE KEY UPDATE gst = ?', [category, gst, gst], (err) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ success: true, category, gst });
  });
};

// Get all GST configurations
export const getAllGstConfig = (req, res) => {
  db.query('SELECT category, gst FROM category_gst', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    const config = {};
    results.forEach(r => { config[r.category] = r.gst; });
    res.json({ config });
  });
};


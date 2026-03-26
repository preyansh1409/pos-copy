/**
 * SAMPLE CODE - Add these sections to Billing.jsx
 * 
 * This shows the exact code snippets to integrate barcode functionality
 * Copy and paste these into your Billing.jsx file
 */

// ============================================================
// SECTION 1: IMPORTS (Add at the top of Billing.jsx)
// ============================================================

import "./Billing.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BarcodeScannerInput from "../BarcodeLabel/BarcodeScannerInput";
import BarcodeLabel from "../BarcodeLabel/BarcodeLabel";
import { getProductByCode, isValidProductCodeFormat } from "../BarcodeLabel/barcodeUtils";

// ============================================================
// SECTION 2: ADD STATES (Add after existing state declarations)
// ============================================================

  const [showBarcodeLabel, setShowBarcodeLabel] = useState(false);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState(null);
  const [barcodeMessage, setBarcodeMessage] = useState("");

// ============================================================
// SECTION 3: ADD HANDLER FUNCTION (Add after other functions)
// ============================================================

  /**
   * Handle barcode scanning
   * Validates product code, looks up product, and adds/updates item
   */
  const handleBarcodeScanned = (productCode) => {
    // Validate product code format (PRD-XXXXXX)
    if (!isValidProductCodeFormat(productCode)) {
      setBarcodeMessage("❌ Invalid product code format. Expected: PRD-XXXXXX");
      setTimeout(() => setBarcodeMessage(""), 3000);
      return;
    }

    // Get product details from database
    const product = getProductByCode(productCode);
    if (!product) {
      setBarcodeMessage(`❌ Product not found: ${productCode}`);
      setTimeout(() => setBarcodeMessage(""), 3000);
      return;
    }

    // Check if product already exists in items
    const existingIndex = items.findIndex(
      item => item.name === product.name && item.price === product.price
    );

    if (existingIndex !== -1) {
      // Product exists - increment quantity
      const updated = [...items];
      const currentQty = Number(updated[existingIndex].qty) || 1;
      updated[existingIndex].qty = currentQty + 1;
      setItems(updated);
      setBarcodeMessage(`✓ ${product.name} - Qty: ${updated[existingIndex].qty}`);
    } else {
      // New product - add to items
      const newItem = {
        category: product.category,
        name: product.name,
        size: "M", // default size
        color: "Black", // default color
        qty: 1,
        price: product.price,
        productCode: productCode
      };
      setItems([...items, newItem]);
      setBarcodeMessage(`✓ Added: ${product.name}`);
    }

    // Clear message after 2 seconds
    setTimeout(() => setBarcodeMessage(""), 2000);
  };

  /**
   * Generate barcode label for a product
   */
  const handleGenerateLabel = (itemIndex) => {
    const item = items[itemIndex];
    if (!item.name) {
      alert("Please select a product first");
      return;
    }

    const product = {
      name: item.name,
      color: item.color,
      size: item.size,
      price: item.price,
      productCode: item.productCode || `PRD-${String(itemIndex + 1).padStart(6, '0')}`
    };

    setSelectedProductForLabel(product);
    setShowBarcodeLabel(true);
  };

// ============================================================
// SECTION 4: UPDATE ITEM ROWS (Modify table-row JSX)
// ============================================================

// In the items.map section where you render each item row, add this button:

              <button 
                className="label-btn" 
                onClick={() => handleGenerateLabel(i)}
                title="Generate barcode label for this product"
                style={{ marginLeft: '10px', padding: '6px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🏷️
              </button>

// ============================================================
// SECTION 5: ADD BARCODE SCANNER INPUT (Add in JSX return)
// ============================================================

// Add this right after the billing-header and before billing-client-info:

        {/* ================= BARCODE SCANNER INPUT ================= */}
        <BarcodeScannerInput 
          onBarcodeScanned={handleBarcodeScanned}
          disabled={false}
        />

        {/* ================= BARCODE STATUS MESSAGE ================= */}
        {barcodeMessage && (
          <div className={`barcode-message ${barcodeMessage.includes("✓") ? "success" : "error"}`}>
            {barcodeMessage}
          </div>
        )}

// ============================================================
// SECTION 6: ADD BARCODE LABEL MODAL (Add in JSX return)
// ============================================================

// Add this at the end of the return JSX, before the closing </div>:

      {/* ================= BARCODE LABEL MODAL ================= */}
      {showBarcodeLabel && (
        <BarcodeLabel 
          product={selectedProductForLabel}
          onClose={() => setShowBarcodeLabel(false)}
        />
      )}

// ============================================================
// SECTION 7: ADD CSS (Add to Billing.css)
// ============================================================

/* ================= BARCODE MESSAGES ================= */
.barcode-message {
  padding: 12px 16px;
  border-radius: 6px;
  margin: 10px 0;
  font-weight: 600;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.barcode-message.success {
  background: #dcfce7;
  color: #166534;
  border-left: 4px solid #16a34a;
}

.barcode-message.error {
  background: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #dc2626;
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Label button in item row */
.label-btn {
  padding: 6px 10px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.label-btn:hover {
  background: #d97706;
}

// ============================================================
// COMPLETE EXAMPLE - Item Row Structure
// ============================================================

{items.map((item, i) => {
  const key = item.name && item.color && item.size
    ? `${item.name}_${item.color}_${item.size}`
    : null;

  const genderGroup = Object.keys(PRODUCT_DATA).find(g => PRODUCT_DATA[g][item.category]);
  const availableStock = genderGroup && key ? stock[genderGroup]?.[key] || 0 : 0;

  return (
    <div className="table-row" key={i}>
      <select value={item.category} onChange={e => handleChange(i, "category", e.target.value)}>
        <option value="">Select</option>
        {[...new Set([
          ...Object.keys(PRODUCT_DATA.Men),
          ...Object.keys(PRODUCT_DATA.Women),
          ...Object.keys(PRODUCT_DATA.Girls)
        ])].map(c => <option key={c}>{c}</option>)}
      </select>

      <select value={item.name} disabled={!item.category} onChange={e => handleChange(i, "name", e.target.value)}>
        <option value="">Select</option>
        {item.category &&
          Object.keys(PRODUCT_DATA)
            .map(g => PRODUCT_DATA[g][item.category] || [])
            .flat()
            .map(p => <option key={p}>{p}</option>)}
      </select>

      <select value={item.size} disabled={!item.name} onChange={e => handleChange(i, "size", e.target.value)}>
        <option value="">Size</option>
        {SIZES.map(s => <option key={s}>{s}</option>)}
      </select>

      <select value={item.color} disabled={!item.size} onChange={e => handleChange(i, "color", e.target.value)}>
        <option value="">Color</option>
        {COLORS.map(c => <option key={c}>{c}</option>)}
      </select>

      <input type="number" value={item.qty} max={availableStock}
        onChange={e => handleChange(i, "qty", e.target.value > availableStock ? availableStock : e.target.value)} />

      <input type="number" value={item.price} onChange={e => handleChange(i, "price", e.target.value)} />

      <span>₹ {(item.qty * item.price || 0).toFixed(2)}</span>
      
      {/* ADD THIS BUTTON FOR LABEL GENERATION */}
      <button 
        className="label-btn" 
        onClick={() => handleGenerateLabel(i)}
        title="Generate barcode label"
      >
        🏷️
      </button>

      <button onClick={() => removeItem(i)}>❌</button>
    </div>
  );
})}

// ============================================================
// TESTING THE IMPLEMENTATION
// ============================================================

/*
Test Steps:

1. Component appears on page:
   ✓ "Scan Barcode" input field visible
   ✓ Blue highlight with scanner icon

2. Test with known product codes:
   - Focus input field
   - Type: PRD-000004
   - Press Enter
   - Should show: ✓ Added: Solid Polo T-Shirt

3. Test quantity increment:
   - Type: PRD-000004 again
   - Should show: ✓ Solid Polo T-Shirt - Qty: 2

4. Test label generation:
   - Click 🏷️ button next to added product
   - Modal should appear with label preview
   - Can see barcode, product code, name, price

5. Test error handling:
   - Type: invalid-code
   - Should show: ❌ Invalid product code format

6. Test with physical scanner:
   - Connect USB barcode scanner
   - Focus input field
   - Scan product barcode
   - Should auto-fill product details

Test Product Codes:
- PRD-000001: Plain Round Neck (₹299)
- PRD-000004: Solid Polo T-Shirt (₹449)
- PRD-000007: Casual Shirt (₹599)
- PRD-000012: Slim Fit Jeans (₹999)
*/

// ============================================================
// TROUBLESHOOTING
// ============================================================

/*
If imports fail:
- Ensure files exist in src/BarcodeLabel/ folder
- Check file names: BarcodeScannerInput.jsx, BarcodeLabel.jsx, barcodeUtils.js
- Verify import paths match your project structure

If barcode not recognized:
- Check format: PRD-XXXXXX (6 digits)
- Verify product exists in database (see barcodeUtils.js)
- Console.log the product code to verify

If quantity not incrementing:
- Ensure product name and price exactly match
- Check if first item is being added correctly
- Verify state update is working

If label modal doesn't appear:
- Check if showBarcodeLabel state is true
- Verify BarcodeLabel component is imported
- Check for console errors

Debug tip:
console.log(barcodeMessage) - see what message is shown
console.log(items) - check items array
console.log(getProductByCode('PRD-000004')) - test lookup
*/

// ============================================================
// NEXT STEPS
// ============================================================

/*
1. Copy all component files to src/BarcodeLabel/
2. Add imports and states to Billing.jsx
3. Add handler functions
4. Update JSX with BarcodeScannerInput and BarcodeLabel
5. Add CSS to Billing.css
6. Test with sample product codes
7. Connect physical barcode scanner
8. Print barcode labels
9. Train users
10. Deploy to production

For full documentation, see:
- README.md - Complete guide
- INTEGRATION_GUIDE.md - Detailed integration
- QUICK_REFERENCE.md - User guide
*/

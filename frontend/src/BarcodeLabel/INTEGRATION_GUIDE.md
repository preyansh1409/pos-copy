# Barcode Integration Guide for Billing.jsx

## Step-by-Step Integration Instructions

### 1. Import Required Components and Utilities

Add these imports at the top of `Billing.jsx`:

```javascript
import BarcodeScannerInput from "../BarcodeLabel/BarcodeScannerInput";
import BarcodeLabel from "../BarcodeLabel/BarcodeLabel";
import { getProductByCode, isValidProductCodeFormat } from "../BarcodeLabel/barcodeUtils";
```

### 2. Add State for Barcode Processing

Add these states to the component:

```javascript
  const [showBarcodeLabel, setShowBarcodeLabel] = useState(false);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState(null);
  const [barcodeMessage, setBarcodeMessage] = useState("");
```

### 3. Add Barcode Processing Function

Add this function to handle barcode scanning:

```javascript
  const handleBarcodeScanned = (productCode) => {
    // Validate product code format
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
      updated[existingIndex].qty = (Number(updated[existingIndex].qty) || 1) + 1;
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
        tax: product.tax || 5,
        productCode: productCode
      };
      setItems([...items, newItem]);
      setBarcodeMessage(`✓ Added: ${product.name}`);
    }

    // Clear message after 2 seconds
    setTimeout(() => setBarcodeMessage(""), 2000);
  };
```

### 4. Add Label Generation Function

```javascript
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
```

### 5. Update JSX Return

In the main content area, add the barcode scanner input BEFORE the current billing form:

```jsx
  return (
    <div className="billing-layout">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="stock-navbar">
        {/* ... existing sidebar content ... */}
      </aside>

      {/* ================= RIGHT BILLING PAGE ================= */}
      <div className="billing-page">
        <div className="billing-header">
          {/* ... existing header ... */}
        </div>

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

        {/* ================= CLIENT INFO ================= */}
        {/* ... existing client info section ... */}

        {/* ================= ITEMS TABLE ================= */}
        {/* ... existing items table ... */}

        {/* Add "Generate Label" button to each item row */}
        {/* In the item row JSX: */}
        <button 
          className="label-btn" 
          onClick={() => handleGenerateLabel(i)}
          title="Generate barcode label for this product"
        >
          🏷️
        </button>
      </div>

      {/* ================= BARCODE LABEL MODAL ================= */}
      {showBarcodeLabel && (
        <BarcodeLabel 
          product={selectedProductForLabel}
          onClose={() => setShowBarcodeLabel(false)}
        />
      )}
    </div>
  );
```

### 6. Add CSS for Messages

Add to `Billing.css`:

```css
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
```

## Complete Item Structure

When using barcode scanning, items will have this structure:

```javascript
{
  category: "Polo T-Shirts",
  name: "Solid Polo T-Shirt",
  size: "M",
  color: "Black",
  qty: 1,
  price: 449,
  tax: 5,
  productCode: "PRD-000004"  // New field from barcode
}
```

## How It Works

1. **Barcode Scanner Input**: User focuses on scanner input and scans product barcode
2. **Product Code Extraction**: System extracts product code from barcode (PRD-XXXXXX)
3. **Database Lookup**: System searches product database for matching code
4. **Auto-fill Details**: All product details automatically populate:
   - Product name
   - Price
   - Category
   - Tax information
5. **Smart Quantity**: 
   - If product new: Add with qty = 1
   - If product exists: Increment quantity by 1
6. **Visual Feedback**: User sees success message confirming product added
7. **Label Generation**: Click label icon to generate printable barcode label

## Testing Barcode Codes

Test with these pre-configured product codes:
- PRD-000001: Plain Round Neck (₹299)
- PRD-000004: Solid Polo T-Shirt (₹449)
- PRD-000007: Casual Shirt (₹599)
- PRD-000012: Slim Fit Jeans (₹999)

Simply type the code and press Enter to test!

## Features Enabled

✅ Fast barcode scanning
✅ Auto-fill product details
✅ Smart quantity management
✅ Error prevention
✅ Visual feedback
✅ Barcode label generation
✅ Professional label printing

## Notes

- Barcode scanning requires a physical barcode scanner or scanner app
- For testing without scanner, manually type product codes
- Labels can be printed on thermal (50mm x 25mm) or regular printer
- Product database is pre-populated with sample products
- Extend product database in `barcodeUtils.js` as needed

## Troubleshooting

**Barcode not recognized**: Check product code format (PRD-XXXXXX)
**Product not found**: Verify product exists in database
**Quantity not incrementing**: Ensure exact product name and price match
**Label not generating**: Ensure product is properly selected in table

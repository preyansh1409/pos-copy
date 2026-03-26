# Barcode-Based Billing System Documentation

## Overview
This billing system now supports automatic barcode generation and barcode scanning for faster, error-free product billing. Each product has a unique product code that automatically generates a scannable Code 128 barcode.

## Key Features

### 1. Product Code Generation
- **Format**: `PRD-XXXXXX` (e.g., `PRD-000123`)
- **Auto-generated**: System creates unique codes automatically
- **Unique**: Each product has a unique code
- **Traceable**: Easy to track and reference

### 2. Barcode Generation
- **Format**: Code 128 (industry standard)
- **Scannable**: Compatible with all standard barcode scanners
- **Printable**: High-resolution barcode labels for stickers
- **Size**: 50mm x 25mm (thermal label size)

### 3. Barcode Scanning
- **Fast Entry**: Scan product barcode instead of manual entry
- **Auto-fill**: All product details automatically populated
- **Error Prevention**: Eliminates manual data entry errors
- **Quick Billing**: Increases billing speed significantly

### 4. Smart Quantity Management
- **Auto-increment**: Scanning same barcode increases quantity automatically
- **No manual entry needed**: User only scans and presses enter
- **Real-time updates**: Instantly reflects in billing table

## Using the Barcode System

### Scanning Products
1. Focus on the "Scan Barcode" input field
2. Use a barcode scanner to scan the product barcode
3. Press Enter (scanner usually does this automatically)
4. Product details auto-fill and quantity increases by 1
5. Repeat for additional products

### Manual Entry
1. If barcode scanner unavailable, manually type the product code
2. Format: `PRD-XXXXXX` (e.g., `PRD-000001`)
3. Press Enter to add product to bill
4. Product details auto-fill

### Generating Barcode Labels
1. Select a product in the billing table
2. Click "Generate Label" button
3. Preview barcode label
4. Click "Print Label" to print thermal label
5. Paste label on physical product

### Label Contents
Each printed label includes:
```
┌─────────────────────┐
│  ║PRD-000123║      │  <- Code 128 Barcode
│  PRD-000123        │  <- Product Code
│  Black Polo        │  <- Product Name
│  T-Shirt           │
│  ₹799              │  <- Price
└─────────────────────┘
```

## Product Database

The system includes pre-configured products:

### Men's Clothing
- PRD-000001: Plain Round Neck - ₹299
- PRD-000002: Printed Round Neck - ₹349
- PRD-000003: Striped Round Neck - ₹349
- PRD-000004: Solid Polo T-Shirt - ₹449
- PRD-000005: Striped Polo T-Shirt - ₹499
- PRD-000006: Logo Polo T-Shirt - ₹549
- PRD-000007: Casual Shirt - ₹599
- PRD-000008: Formal Shirt - ₹699
- PRD-000009: Checked Shirt - ₹649
- PRD-000010: Printed Shirt - ₹649
- PRD-000011: Denim Shirt - ₹799
- PRD-000012: Slim Fit Jeans - ₹999
- PRD-000013: Regular Fit Jeans - ₹999
- PRD-000014: Skinny Fit Jeans - ₹1099
- PRD-000015: Stretchable Jeans - ₹1199

More products available in women's and girls' categories.

## Technical Details

### Components
1. **BarcodeScannerInput**: Input field for barcode scanning
2. **BarcodeLabel**: Modal for generating and printing labels
3. **barcodeUtils.js**: Utility functions for barcode operations

### Integration with Billing
- Barcode scanner input integrated above the billing table
- When barcode is scanned, system:
  1. Validates product code format
  2. Fetches product details from database
  3. Auto-fills product information
  4. Adds to billing table or increments quantity
  5. Automatically focuses for next scan

### Data Flow
```
Barcode Scanner → BarcodeScannerInput → barcodeUtils.getProductByCode()
   → Auto-fill Product Details → Add to Items Array → Update Billing Table
```

## Best Practices

1. **Print Labels Before Billing**: Print barcode labels for all products
2. **Store Securely**: Keep label printer ready for emergency label printing
3. **Scanner Placement**: Position scanner at eye level for comfortable use
4. **Network Connectivity**: Ensure system has backup for offline barcode lookups
5. **Regular Testing**: Test barcode scanner with different products

## Troubleshooting

### Barcode Not Recognized
- Check product code format: Must be `PRD-XXXXXX`
- Verify product exists in database
- Check scanner batteries/connections

### Label Printing Issues
- Ensure thermal printer is connected
- Check label size: 50mm x 25mm
- Verify printer drivers are installed

### Quantity Not Incrementing
- Ensure barcode scanning is enabled
- Check if product already in table
- Verify scanner is sending complete product code

## Future Enhancements

1. **Backend Integration**: Store products in database instead of local file
2. **Real Barcode Generation**: Integrate jsbarcode library for actual barcode images
3. **Barcode Database**: Maintain scanned barcode history
4. **Multi-location Support**: Support multiple warehouse/store locations
5. **Inventory Sync**: Auto-sync with inventory management system
6. **Color/Size Variants**: Support color and size selection via barcode
7. **Mobile Barcode Scanner**: Mobile app with built-in scanner support

## API Endpoints (Future)

```
GET /api/products/code/:productCode - Get product details
POST /api/products - Create new product with code
GET /api/barcodes/generate - Generate barcode
POST /api/barcodes/label - Print barcode label
```

## Support

For issues or questions regarding the barcode system, please:
1. Check the troubleshooting section above
2. Verify product code format
3. Test barcode scanner with known good labels
4. Contact system administrator if issues persist

// Utility to render barcode using JsBarcode
import JsBarcode from "jsbarcode";

export function renderBarcodeSVG(code, options = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, code, {
    format: "CODE128",
    displayValue: true, // Show numbers below barcode
    fontOptions: "bold",
    font: "monospace",
    fontSize: 18,
    textMargin: 4,
    width: 2,
    height: 40,
    margin: 0,
    ...options,
  });
  return svg.outerHTML;
}
/**
 * Get the next product code number for a given category (as a 6-digit string)
 * @param {string} category - The product category
 * @returns {string} - Next product code number (e.g., '000036')
 */
export const getNextProductCodeNumberForCategory = (category) => {
  // Find all product codes for this category
  const codes = Object.entries(PRODUCT_DATABASE)
    .filter(([code, data]) => data.category === category)
    .map(([code]) => code);
  // Extract the numeric part and find the max
  let maxNum = 0;
  codes.forEach(code => {
    const match = code.match(/^PRD-(\d{6})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  // Next number
  const nextNum = maxNum + 1;
  return nextNum.toString().padStart(6, '0');
};

// Available sizes and colors
const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = ["Black", "White", "Blue", "Grey"];

const PRODUCT_DATABASE = {
  "PRD-000001": {
    name: "Plain Round Neck",
    category: "Round Neck T-Shirts",
    gender: "Men",
    price: 299,
    tax: 5,
  },
  "PRD-000002": {
    name: "Printed Round Neck",
    category: "Round Neck T-Shirts",
    gender: "Men",
    price: 349,
    tax: 5,
  },
  "PRD-000003": {
    name: "Striped Round Neck",
    category: "Round Neck T-Shirts",
    gender: "Men",
    price: 349,
    tax: 5,
  },
  "PRD-000004": {
    name: "Solid Polo T-Shirt",
    category: "Polo T-Shirts",
    gender: "Men",
    price: 449,
    tax: 5,
  },
  "PRD-000005": {
    name: "Striped Polo T-Shirt",
    category: "Polo T-Shirts",
    gender: "Men",
    price: 499,
    tax: 5,
  },
  "PRD-000006": {
    name: "Logo Polo T-Shirt",
    category: "Polo T-Shirts",
    gender: "Men",
    price: 549,
    tax: 5,
  },
  "PRD-000007": {
    name: "Casual Shirt",
    category: "Shirts",
    gender: "Men",
    price: 599,
    tax: 5,
  },
  "PRD-000008": {
    name: "Formal Shirt",
    category: "Shirts",
    gender: "Men",
    price: 699,
    tax: 5,
  },
  "PRD-000009": {
    name: "Checked Shirt",
    category: "Shirts",
    gender: "Men",
    price: 649,
    tax: 5,
  },
  "PRD-000010": {
    name: "Printed Shirt",
    category: "Shirts",
    gender: "Men",
    price: 649,
    tax: 5,
  },
  "PRD-000011": {
    name: "Denim Shirt",
    category: "Shirts",
    gender: "Men",
    price: 799,
    tax: 5,
  },
  "PRD-000012": {
    name: "Slim Fit Jeans",
    category: "Jeans",
    gender: "Men",
    price: 999,
    tax: 5,
  },
  "PRD-000013": {
    name: "Regular Fit Jeans",
    category: "Jeans",
    gender: "Men",
    price: 999,
    tax: 5,
  },
  "PRD-000014": {
    name: "Skinny Fit Jeans",
    category: "Jeans",
    gender: "Men",
    price: 1099,
    tax: 5,
  },
  "PRD-000015": {
    name: "Stretchable Jeans",
    category: "Jeans",
    gender: "Men",
    price: 1199,
    tax: 5,
  },
  // Women products
  "PRD-000016": {
    name: "Round Neck T-Shirt",
    category: "T-Shirts & Tops",
    gender: "Women",
    price: 299,
    tax: 5,
  },
  "PRD-000017": {
    name: "V-Neck T-Shirt",
    category: "T-Shirts & Tops",
    gender: "Women",
    price: 349,
    tax: 5,
  },
  "PRD-000018": {
    name: "Printed T-Shirt",
    category: "T-Shirts & Tops",
    gender: "Women",
    price: 349,
    tax: 5,
  },
  "PRD-000019": {
    name: "Crop Top",
    category: "T-Shirts & Tops",
    gender: "Women",
    price: 399,
    tax: 5,
  },
  "PRD-000020": {
    name: "Long Top",
    category: "T-Shirts & Tops",
    gender: "Women",
    price: 399,
    tax: 5,
  },
  "PRD-000021": {
    name: "Casual Shirt",
    category: "Shirts",
    gender: "Women",
    price: 599,
    tax: 5,
  },
  "PRD-000022": {
    name: "Checked Shirt",
    category: "Shirts",
    gender: "Women",
    price: 649,
    tax: 5,
  },
  "PRD-000023": {
    name: "Printed Shirt",
    category: "Shirts",
    gender: "Women",
    price: 649,
    tax: 5,
  },
  "PRD-000024": {
    name: "Denim Shirt",
    category: "Shirts",
    gender: "Women",
    price: 799,
    tax: 5,
  },
  "PRD-000025": {
    name: "Skinny Jeans",
    category: "Jeans",
    gender: "Women",
    price: 999,
    tax: 5,
  },
  "PRD-000026": {
    name: "High-Waist Jeans",
    category: "Jeans",
    gender: "Women",
    price: 1099,
    tax: 5,
  },
  "PRD-000027": {
    name: "Mom Fit Jeans",
    category: "Jeans",
    gender: "Women",
    price: 999,
    tax: 5,
  },
  "PRD-000028": {
    name: "Straight Fit Jeans",
    category: "Jeans",
    gender: "Women",
    price: 999,
    tax: 5,
  },
  // Girls products
  "PRD-000029": {
    name: "Top",
    category: "Clothing",
    gender: "Girls",
    price: 199,
    tax: 5,
  },
  "PRD-000030": {
    name: "T-Shirt",
    category: "Clothing",
    gender: "Girls",
    price: 249,
    tax: 5,
  },
  "PRD-000031": {
    name: "Dress",
    category: "Clothing",
    gender: "Girls",
    price: 399,
    tax: 5,
  },
  "PRD-000032": {
    name: "Frock",
    category: "Clothing",
    gender: "Girls",
    price: 349,
    tax: 5,
  },
  "PRD-000033": {
    name: "Skirt",
    category: "Clothing",
    gender: "Girls",
    price: 299,
    tax: 5,
  },
  "PRD-000034": {
    name: "Jeans",
    category: "Clothing",
    gender: "Girls",
    price: 499,
    tax: 5,
  },
  "PRD-000035": {
    name: "Leggings",
    category: "Clothing",
    gender: "Girls",
    price: 199,
    tax: 5,
  },
};

/**
 * Generate a product code (PRD-XXXXXX format)
 * In a real system, this would be generated on the backend
 */
export const generateProductCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `PRD-${timestamp}`;
};

/**
 * Get product details by product code
 * @param {string} productCode - The product code (e.g., PRD-000001)
 * @returns {object|null} - Product details or null if not found
 */
export const getProductByCode = (productCode) => {
  return PRODUCT_DATABASE[productCode] || null;
};

/**
 * Search for products by name
 * @param {string} searchTerm - The search term
 * @returns {array} - Array of matching products with their codes
 */
export const searchProducts = (searchTerm) => {
  return Object.entries(PRODUCT_DATABASE)
    .filter(([_, product]) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(([code, product]) => ({ code, ...product }));
};

/**
 * Get all available product codes
 * @returns {array} - Array of all product codes
 */
export const getAllProductCodes = () => {
  return Object.keys(PRODUCT_DATABASE);
};

/**
 * Add a new product to the database
 * @param {string} productCode - The product code
 * @param {object} productData - The product data
 */
export const addProductToDatabase = (productCode, productData) => {
  PRODUCT_DATABASE[productCode] = productData;
  localStorage.setItem("productDatabase", JSON.stringify(PRODUCT_DATABASE));
};

/**
 * Get product database (for debugging)
 * @returns {object} - The entire product database
 */
export const getProductDatabase = () => {
  return PRODUCT_DATABASE;
};

/**
 * Generate a Code 128 barcode representation
 * In production, use jsbarcode library for actual barcode generation
 * @param {string} productCode - The product code to encode
 * @returns {string} - Simple barcode representation
 */
export const generateCode128Barcode = (productCode) => {
  // This is a placeholder - for real barcodes, use jsbarcode library
  // The barcode will contain the product code
  return productCode;
};

/**
 * Validate product code format
 * @param {string} code - The code to validate
 * @returns {boolean} - True if valid format
 */
export const isValidProductCodeFormat = (code) => {
  return /^PRD-\d{6}$/.test(code);
};

/**
 * Generate label data for printing
 * @param {object} product - The product data
 * @param {string} productCode - The product code
 * @returns {object} - Label data with all necessary information
 */
export const generateLabelData = (product, productCode) => {
  return {
    productCode,
    productName: product.name,
    category: product.category,
    size: product.size,
    color: product.color,
    price: product.price,
    tax: product.tax,
    barcode: generateCode128Barcode(productCode),
  };
};

/**
 * Generate barcode for specific size and color combination
 * @param {string} baseProductCode - The base product code (e.g., PRD-000001)
 * @param {string} size - The size (S, M, L, XL, XXL)
 * @param {string} color - The color (Black, White, Blue, Grey)
 * @returns {string} - Full barcode (e.g., PRD-000001-S-Black)
 */
export const generateSizeColorBarcode = (baseProductCode, size, color) => {
  return `${baseProductCode}-${size}-${color}`;
};

/**
 * Parse barcode to extract base product code, size, and color
 * @param {string} barcode - The full barcode (e.g., PRD-000001-S-Black)
 * @returns {object|null} - Parsed data or null if invalid format
 */
export const parseSizeColorBarcode = (barcode) => {
  const match = barcode.match(/^PRD-\d{6}-(S|M|L|XL|XXL)-(Black|White|Blue|Grey)$/);
  if (!match) return null;

  return {
    baseProductCode: match[0].split('-').slice(0, 2).join('-'),
    size: match[1],
    color: match[2],
    fullBarcode: barcode
  };
};

/**
 * Get product details by size/color barcode
 * @param {string} barcode - The full barcode (e.g., PRD-000001-S-Black)
 * @returns {object|null} - Product details with size/color or null if not found
 */
export const getProductBySizeColorBarcode = (barcode) => {
  const parsed = parseSizeColorBarcode(barcode);
  if (!parsed) return null;

  const baseProduct = getProductByCode(parsed.baseProductCode);
  if (!baseProduct) return null;

  return {
    ...baseProduct,
    size: parsed.size,
    color: parsed.color,
    fullBarcode: barcode,
    baseProductCode: parsed.baseProductCode
  };
};

/**
 * Generate all possible barcodes for a product (all size/color combinations)
 * @param {string} baseProductCode - The base product code
 * @returns {array} - Array of all possible barcodes
 */
export const generateAllBarcodesForProduct = (baseProductCode) => {
  const barcodes = [];
  AVAILABLE_SIZES.forEach(size => {
    AVAILABLE_COLORS.forEach(color => {
      barcodes.push(generateSizeColorBarcode(baseProductCode, size, color));
    });
  });
  return barcodes;
};

/**
 * Generate all barcodes for all products
 * @returns {array} - Array of all possible barcodes across all products
 */
export const generateAllBarcodes = () => {
  const allBarcodes = [];
  getAllProductCodes().forEach(baseCode => {
    allBarcodes.push(...generateAllBarcodesForProduct(baseCode));
  });
  return allBarcodes;
};

/**
 * Validate size/color barcode format
 * @param {string} barcode - The barcode to validate
 * @returns {boolean} - True if valid format
 */
export const isValidSizeColorBarcodeFormat = (barcode) => {
  return parseSizeColorBarcode(barcode) !== null;
};

/**
 * Get available sizes
 * @returns {array} - Array of available sizes
 */
export const getAvailableSizes = () => {
  return [...AVAILABLE_SIZES];
};

/**
 * Get available colors
 * @returns {array} - Array of available colors
 */
export const getAvailableColors = () => {
  return [...AVAILABLE_COLORS];
};

/**
 * Get product details by name and category
 * @param {string} category - The category
 * @param {string} name - The product name
 * @returns {object|null} - Product details or null if not found
 */
export const getProductByName = (category, name) => {
  return Object.values(PRODUCT_DATABASE).find(p => p.category === category && p.name === name) || null;
};

export default {
  generateProductCode,
  getProductByCode,
  searchProducts,
  getAllProductCodes,
  addProductToDatabase,
  getProductDatabase,
  generateCode128Barcode,
  isValidProductCodeFormat,
  generateLabelData,
  generateSizeColorBarcode,
  parseSizeColorBarcode,
  getProductBySizeColorBarcode,
  generateAllBarcodesForProduct,
  generateAllBarcodes,
  isValidSizeColorBarcodeFormat,
  getAvailableSizes,
  getAvailableColors,
  getProductByName,
};

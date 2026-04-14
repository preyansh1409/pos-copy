import API_BASE_URL from "../apiConfig";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PurchaseDashboard.css";

/* ================= HELPERS & DATA ================= */
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
const SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = ["Black", "White", "Blue", "Grey"];

export default function PurchaseDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- CORE STATE ---
  const [cart, setCart] = useState([]); // Array of Items to purchase
  const [productsMap, setProductsMap] = useState({}); // Category -> [itemNames]
  const [allProducts, setAllProducts] = useState([]); // Added to store raw variants
  const [allCategories, setAllCategories] = useState(['']);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- HEADER / META STATE ---
  const [header, setHeader] = useState({
    date: new Date().toISOString().slice(0, 10),
    supplier: "",
    gstin: "",
    invoiceNo: "",
    purchaseType: "Cash",
    paymentTerms: "",
    paymentStatus: "Paid",
    dueDate: ""
  });
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [filteredSupplierOptions, setFilteredSupplierOptions] = useState([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [filteredInvoiceOptions, setFilteredInvoiceOptions] = useState([]);
  const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);

  // --- MODALS STATE ---
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null); // {category, name}
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  // Master modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  // --- CONFIG STATE ---
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [gstConfig, setGstConfig] = useState({});
  const [nextBarcode, setNextBarcode] = useState("PRD-000001");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showCoolToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- REFS ---
  const itemsListRef = useRef(null);

  // Auto-scroll to bottom of list when cart changes
  useEffect(() => {
    if (itemsListRef.current) {
      itemsListRef.current.scrollTo({
        top: itemsListRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cart]);

  /* ================= INITIAL FETCHES ================= */
  useEffect(() => {
    // 1. Fetch Categories & Products Logic (Merged)
    const loadData = async () => {
      try {
        // Categories - only from backend (tenant's real data)
        const catRes = await fetch(`${API_BASE_URL}/masterdata/categories`);
        const catData = await catRes.json();
        const backendCats = Array.isArray(catData.categories) ? catData.categories : [];
        setAllCategories(backendCats);

        // Products - only from backend
        const prodRes = await fetch(`${API_BASE_URL}/masterdata/all-products`);
        const prodData = await prodRes.json();
        if (prodData && Array.isArray(prodData.data)) setAllProducts(prodData.data);

        const map = {};
        const colorSet = new Set(DEFAULT_COLORS);

        if (prodData && Array.isArray(prodData.data)) {
          prodData.data.forEach(row => {
            if (!row.category || !row.item) return;
            if (!map[row.category]) map[row.category] = new Set();
            map[row.category].add(row.item);
            if (row.color) colorSet.add(row.color);
          });
        }

        const finalMap = {};
        Object.keys(map).forEach(c => finalMap[c] = Array.from(map[c]));
        setProductsMap(finalMap);
        setColors(Array.from(colorSet));

      } catch (e) { console.error("Load error", e); }
    };
    loadData();

    // 2. Fetch GST Config
    fetch(`${API_BASE_URL}/masterdata/all-gst-config`)
      .then(res => res.json())
      .then(data => { if (data.config) setGstConfig(data.config); })
      .catch(() => { });

    // 3. Suppliers
    const fetchSuppliers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/purchase/unique-suppliers`);
        const data = await res.json();
        if (data.suppliers) {
          setSupplierOptions(data.suppliers);
        }
      } catch (e) { console.error("Supplier fetch error", e); }
    };
    fetchSuppliers();

    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/purchase/unique-invoices`);
        const data = await res.json();
        if (data.invoices) setInvoiceOptions(data.invoices);
      } catch (e) { }
    };
    fetchInvoices();

    const handleSupplierChange = (val) => {
      setHeader({ ...header, supplier: val });
      if (val.trim()) {
        const matches = supplierOptions.filter(s =>
          s.toLowerCase().includes(val.toLowerCase())
        );
        setFilteredSupplierOptions(matches);
        setShowSupplierSuggestions(matches.length > 0);
      } else {
        setFilteredSupplierOptions([]);
        setShowSupplierSuggestions(false);
      }
    };

    // 4. Next Barcode
    fetch(`${API_BASE_URL}/masterdata/next-barcode`)
      .then(r => r.json())
      .then(d => { if (d.nextBarcode) setNextBarcode(d.nextBarcode); }).catch(() => { });

  }, []);

  // Auto-fill Invoice logic (remains)
  useEffect(() => {
    if (header.supplier && supplierOptions.includes(header.supplier)) {
      fetch(`${API_BASE_URL}/purchase/all`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.bills)) {
            const lastBill = data.bills.find(b => b.supplier_name === header.supplier);
            if (lastBill) {
              setHeader(h => ({
                ...h,
                invoiceNo: lastBill.invoice_no || "",
                gstin: lastBill.supplier_gst || ""
              }));
            }
          }
        }).catch(() => { });
    }
  }, [header.supplier]);


  /* ================= CART CALCULATIONS ================= */
  const cartTotal = cart.reduce((sum, item) => {
    const rate = parseFloat(item.price || 0); // Changed from item.rate to item.price to match existing cart item structure
    const qty = parseFloat(item.qty || 0);
    const gstPercent = parseFloat(item.gst || 0);
    const base = rate * qty;
    const gstAmount = (base * gstPercent) / 100;
    return sum + (base + gstAmount);
  }, 0);

  /* ================= CART ACTIONS ================= */

  const addToCart = (productItem) => {
    // productItem = { category, name, size, color, rate, gst }
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.category === productItem.category &&
        item.name === productItem.name &&
        item.size === productItem.size &&
        item.color === productItem.color
      );

      if (existingIdx > -1) {
        const newCart = [...prev];
        newCart[existingIdx].qty += (productItem.qty || 1);
        // Recalculate amount for the updated item
        const item = newCart[existingIdx];
        const base = (Number(item.qty) || 0) * (Number(item.price) || 0);
        const disc = (base * (Number(item.discount) || 0)) / 100;
        const taxable = base - disc;
        const gstVal = taxable * ((Number(item.gst) || 5) / 100);
        item.amount = taxable + gstVal;
        return newCart;
      } else {
        // For new item, initialize amount based on incoming productItem.price
        const newItem = {
          ...productItem,
          qty: productItem.qty || 1,
          price: productItem.price || 0,
          discount: 0,
          amount: 0
        };
        const base = (Number(newItem.qty) || 0) * (Number(newItem.price) || 0);
        const disc = (base * (Number(newItem.discount) || 0)) / 100;
        const taxable = base - disc;
        const gstVal = taxable * ((Number(newItem.gst) || 5) / 100);
        newItem.amount = taxable + gstVal;
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartItem = (index, field, value) => {
    setCart(prev => {
      const list = [...prev];
      list[index][field] = value;
      // Recalc amount
      const item = list[index];
      const base = (Number(item.qty) || 0) * (Number(item.price) || 0);
      const disc = (base * (Number(item.discount) || 0)) / 100;
      const taxable = base - disc;
      const gstVal = taxable * ((Number(item.gst) || 5) / 100);
      item.amount = taxable + gstVal;
      return list;
    });
  };

  /* ================= PRODUCT SELECTION FLOW ================= */

  const handleProductClick = (category, itemName) => {
    setSelectedProductForVariant({ category, name: itemName });
    setShowVariantModal(true);
  };

  const handleVariantConfirm = async (selectedSizes, selectedColors, qty) => {
    if (!selectedProductForVariant) return;
    const { category, name } = selectedProductForVariant;
    const gst = gstConfig[category] || 5;

    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        const found = allProducts.find(p => p.category === category && p.item === name && p.size === size && p.color === color);
        const barcode = found ? found.barcode : "";

        let latestPrice = 0;
        try {
          const priceRes = await fetch(`${API_BASE_URL}/masterdata/latest-price?category=${encodeURIComponent(category)}&item_name=${encodeURIComponent(name)}&size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`);
          if (priceRes.ok) {
            const pData = await priceRes.json();
            latestPrice = pData.price || 0;
          }
        } catch (e) {
          console.error("Error fetching latest price:", e);
        }

        addToCart({
          category,
          name,
          size,
          color,
          barcode,
          price: latestPrice,
          gst,
          qty: qty || 1
        });
      }
    }

    setShowVariantModal(false);
    setSelectedProductForVariant(null);
  };

  /* ================= SAVE PURCHASE ================= */

  const handleSavePurchase = async () => {
    if (cart.length === 0) return alert("Items list is empty");
    if (!header.supplier) return alert("Supplier Name is required");
    if (!header.invoiceNo) return alert("Invoice No is required");


    try {
      const payload = {
        invoice_no: header.invoiceNo,
        supplier_name: header.supplier,
        gstin: header.gstin, // Added gstin
        purchase_date: header.date, // Changed from new Date() to header.date
        payment_mode: header.purchaseType, // Changed from paymentMode to header.purchaseType
        payment_status: header.paymentStatus, // Added payment_status
        terms: header.paymentTerms, // Added terms
        grand_total: grandTotal, // Changed from cartTotal to grandTotal
        items: cart.map(item => ({ // Mapped items to match backend structure
          category: item.category,
          item_name: item.name,
          color: item.color,
          size: item.size,
          qty: Number(item.qty),
          rate: Number(item.price),
          gst_percent: Number(item.gst),
          amount: item.amount
        }))
      };

      const res = await fetch(`${API_BASE_URL}/purchase/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to save purchase");
      }

      showCoolToast("Purchase Saved Successfully!");
      setCart([]);
      setHeader(h => ({ ...h, invoiceNo: "", supplier: "", gstin: "" })); // Reset header fields
    } catch (e) { showCoolToast(e.message, "error"); }
  };

  /* ================= RENDER HELPERS ================= */

  const displayedCategories = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return allCategories.filter(cat => cat.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lower);
        const bStarts = b.toLowerCase().startsWith(lower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });
  }, [allCategories, searchQuery]);

  const displayedProducts = useMemo(() => {
    let items = [];
    if (searchQuery || selectedCategory === "All") {
      items = Object.entries(productsMap).flatMap(([cat, list]) => list.map(name => ({ category: cat, name })));
    } else if (selectedCategory) {
      items = (productsMap[selectedCategory] || []).map(name => ({ category: selectedCategory, name }));
    } else {
      items = Object.entries(productsMap).flatMap(([cat, list]) => list.map(name => ({ category: cat, name })));
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(lower));
    }
    return items;
  }, [selectedCategory, productsMap, searchQuery]);

  const netAmount = cart.reduce((acc, item) => acc + ((item.qty * item.price) || 0), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (((item.qty * item.price * item.discount) / 100) || 0), 0);
  const grandTotal = cart.reduce((acc, item) => acc + (item.amount || 0), 0);


  return (
    <div className="purchase-layout">

      {/* === HEADER === */}
      <header className="purchase-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
          <img
            src={localStorage.getItem('logo_url') || '/logo.jpg'}
            alt="Logo"
            style={{ height: 45, objectFit: 'contain', borderRadius: '4px' }}
          />
        </div>
        <div className="brand-section" style={{ justifyContent: 'center' }}>
          <div className="brand-text" style={{ textAlign: 'center' }}>
            <h2>{localStorage.getItem('business_name') || 'Point of Sale Software'}</h2>
            <span>Purchase Dashboard</span>
          </div>
        </div>
        <div className="header-actions" style={{ justifyContent: 'flex-end' }}>
          {(location.state?.from === 'admin-dashboard') && (
            <button className="header-btn btn-dashboard" onClick={() => navigate('/admin-dashboard')}>Dashboard</button>
          )}
          <button className="header-btn btn-logout" onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        </div>
      </header>

      {/* === LEFT: SIDEBAR === */}
      <aside className="purchase-sidebar">
        <div className="sidebar-section-header">
          <span className="section-title">Master Data</span>
        </div>
        <div className="master-actions">
          <button className="master-btn" onClick={() => setShowMasterDropdown(!showMasterDropdown)}>
            🔧 Master <span style={{ marginLeft: 'auto', fontSize: 10 }}>{showMasterDropdown ? '▲' : '▼'}</span>
          </button>
          {showMasterDropdown && (
            <div className="master-dropdown">
              <button className="dropdown-item" onClick={() => { setShowProductModal(true); setShowMasterDropdown(false); }}>
                📦 Add Product
              </button>
              <button className="dropdown-item" onClick={() => { setShowModifyModal(true); setShowMasterDropdown(false); }}>
                ✏️ Modify Product
              </button>
              <button className="dropdown-item" onClick={() => { setShowGstModal(true); setShowMasterDropdown(false); }}>
                ⚙️ GST Config
              </button>
            </div>
          )}
          <button className="master-btn" onClick={() => navigate('/purchase-bill', { state: { from: 'purchase-dashboard' } })}>
            📊 Reports
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section-header">
          <span className="section-title">Categories</span>
        </div>

        <div className="categories-list">
          {(searchQuery ? displayedCategories : allCategories).map(cat => (
            <div
              key={cat}
              className={`category-item ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="cat-text">{cat}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* === CENTER: PRODUCT GRID === */}
      <section className="product-section">
        <div className="search-bar-container">
          <div className="manual-search-panel" style={{ flex: 1 }}>
            <label className="search-label">🔍 Search Items / Categories</label>
            <input
              className="search-input"
              placeholder="Type product or category name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {(!selectedCategory && !searchQuery) ? (
          <div className="centered-placeholder-container">
            <div className="professional-placeholder-box">
              <div className="placeholder-icon">🛍️</div>
              <h3>Please Select a Category</h3>
              <p>Choose a category from the sidebar or type above to start browsing</p>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {displayedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: 40, color: '#9ca3af' }}>
                No products found
              </div>
            ) : (
              displayedProducts.map((prod, i) => (
                <div key={i} className="product-card" onClick={() => { setSelectedProductForVariant(prod); setShowVariantModal(true); }}>
                  <div className="product-initial">{prod.name.charAt(0)}</div>
                  <div className="product-name">{prod.name}</div>
                  <div className="product-price">Add Stock</div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* === RIGHT: ENTRY FORM === */}
      <section className="entry-section">
        <div className="entry-details-toggle" onClick={() => setShowEntryDetails(!showEntryDetails)}>
          <span>📝 Purchase Details</span>
          <span className="toggle-icon">{showEntryDetails ? '▲' : '▼'}</span>
        </div>

        {showEntryDetails && (
          <div className="entry-header">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={header.date} onChange={e => setHeader({ ...header, date: e.target.value })} />
            </div>
            <div className="form-group full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Supplier Name</label>
                <button
                  type="button"
                  className="text-btn"
                  style={{ fontSize: 11, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setHeader({ ...header, supplier: "", gstin: "", invoiceNo: "" })}
                >
                  + Add Manual / New
                </button>
              </div>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  className="form-input"
                  value={header.supplier}
                  onChange={e => {
                    const val = e.target.value;
                    setHeader({ ...header, supplier: val });
                    if (val.trim()) {
                      const matches = supplierOptions.filter(s =>
                        s.toLowerCase().includes(val.toLowerCase())
                      );
                      setFilteredSupplierOptions(matches);
                      setShowSupplierSuggestions(matches.length > 0);
                    } else {
                      setFilteredSupplierOptions([]);
                      setShowSupplierSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
                  onFocus={() => {
                    if (header.supplier.trim()) {
                      const matches = supplierOptions.filter(s =>
                        s.toLowerCase().includes(header.supplier.toLowerCase())
                      );
                      setFilteredSupplierOptions(matches);
                      setShowSupplierSuggestions(matches.length > 0);
                    }
                  }}
                  placeholder="Search or Type Manual Name..."
                />
                {showSupplierSuggestions && (
                  <ul className="suggestions-list">
                    {filteredSupplierOptions.map((s, i) => (
                      <li key={i} className="suggestion-item" onClick={() => {
                        setHeader({ ...header, supplier: s });
                        setShowSupplierSuggestions(false);
                      }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Invoice No</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  className="form-input"
                  value={header.invoiceNo}
                  onChange={e => {
                    const val = e.target.value;
                    setHeader({ ...header, invoiceNo: val });
                    if (val.trim()) {
                      const matches = invoiceOptions.filter(inv =>
                        inv.toLowerCase().includes(val.toLowerCase())
                      );
                      setFilteredInvoiceOptions(matches);
                      setShowInvoiceSuggestions(matches.length > 0);
                    } else {
                      setFilteredInvoiceOptions([]);
                      setShowInvoiceSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowInvoiceSuggestions(false), 200)}
                  onFocus={() => {
                    if (header.invoiceNo.trim()) {
                      const matches = invoiceOptions.filter(inv =>
                        inv.toLowerCase().includes(header.invoiceNo.toLowerCase())
                      );
                      setFilteredInvoiceOptions(matches);
                      setShowInvoiceSuggestions(matches.length > 0);
                    }
                  }}
                  placeholder="Invoice Number"
                />
                {showInvoiceSuggestions && (
                  <ul className="suggestions-list">
                    {filteredInvoiceOptions.map((inv, i) => (
                      <li key={i} className="suggestion-item" onClick={() => {
                        setHeader({ ...header, invoiceNo: inv });
                        setShowInvoiceSuggestions(false);
                      }}>
                        {inv}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier GST</label>
              <input className="form-input" value={header.gstin} onChange={e => setHeader({ ...header, gstin: e.target.value })} placeholder="GSTIN/UIN" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={header.purchaseType} onChange={e => setHeader({ ...header, purchaseType: e.target.value })}>
                <option>Credit</option>
                <option>Cash</option>
                <option>Online</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="form-input" value={header.paymentStatus} onChange={e => setHeader({ ...header, paymentStatus: e.target.value })}>
                <option>Pending</option>
                <option>Paid</option>
              </select>
            </div>
          </div>
        )}

        <div className="items-list" ref={itemsListRef}>
          {cart.map((item, i) => (
            <div key={i} className="purchase-item">
              <div className="item-header">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-variant">
                    {item.size} • {item.color} • <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>{item.barcode}</span>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(i)}>×</button>
              </div>
              <div className="item-row">
                <div className="compact-input-group">
                  <label className="compact-label">Qty</label>
                  <input className="compact-input" type="number" value={item.qty} onChange={e => updateCartItem(i, "qty", e.target.value)} />
                </div>
                <div className="compact-input-group">
                  <label className="compact-label">Rate</label>
                  <input className="compact-input" type="number" value={item.price} onChange={e => updateCartItem(i, "price", e.target.value)} />
                </div>
                <div className="compact-input-group">
                  <label className="compact-label">Disc%</label>
                  <input className="compact-input" type="number" value={item.discount} onChange={e => updateCartItem(i, "discount", e.target.value)} />
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Total: ₹ {Math.round(item.amount)} <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af' }}>(incl. {item.gst}% GST)</span>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Select a product from the center panel to begin entry.
            </div>
          )}
        </div>

        <div className="entry-footer">
          <div className="footer-row">
            <span>Net Amount</span>
            <span>₹ {Math.round(netAmount)}</span>
          </div>
          <div className="footer-row total">
            <span>Grand Total</span>
            <span>₹ {Math.round(grandTotal)}</span>
          </div>
          <button className="save-btn" onClick={handleSavePurchase}>SAVE PURCHASE</button>
        </div>
      </section>

      {/* === VARIANT SELECTOR === */}
      {showVariantModal && selectedProductForVariant && (
        <VariantSelector
          product={selectedProductForVariant}
          sizes={SIZES}
          colors={colors}
          nextBarcode={nextBarcode}
          allProducts={allProducts}
          onConfirm={handleVariantConfirm}
          onClose={() => setShowVariantModal(false)}
        />
      )}

      {/* === MASTER: ADD PRODUCT === */}
      {showProductModal && (
        <AddProductModal
          close={() => setShowProductModal(false)}
          nextBarcode={nextBarcode}
          showCoolToast={showCoolToast}
          refreshData={() => window.location.reload()} // Simplified refresh for now
        />
      )}

      {/* === MASTER: MODIFY PRODUCT === */}
      {showModifyModal && (
        <ModifyProductModal
          close={() => setShowModifyModal(false)}
          categories={allCategories}
          showCoolToast={showCoolToast}
        />
      )}

      {/* === MASTER: GST CONFIG === */}
      {showGstModal && (
        <GstConfigModal
          close={() => setShowGstModal(false)}
          categories={allCategories}
        />
      )}

      {/* --- COOL TOAST --- */}
      {toast.show && (
        <div className={`cool-toast ${toast.type}`}>
          <div className="toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {toast.type === 'success' ? <polyline points="20 6 9 17 4 12" /> : <path d="M18 6L6 18M6 6l12 12" />}
            </svg>
          </div>
          <div className="toast-content">{toast.message}</div>
        </div>
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

function VariantSelector({ product, sizes, colors, nextBarcode, allProducts, onConfirm, onClose }) {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [qty, setQty] = useState("");

  const toggleSize = (s) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleColor = (c) => {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const relevantVariants = allProducts.filter(p =>
    p.category === product.category && p.item === product.name
  );

  const availableSizes = Array.from(new Set(relevantVariants.map(v => v.size))).sort();
  const availableColors = Array.from(new Set(relevantVariants.map(v => v.color))).sort();

  const comboCount = selectedSizes.length * selectedColors.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="modal-title">{product.name}</div>
            {comboCount > 0 && qty && (
              <div style={{ fontSize: 11, color: '#1e3a5f', fontWeight: 600, marginTop: 2 }}>
                {comboCount} variant{comboCount > 1 ? 's' : ''} × {qty} qty = {comboCount * Number(qty)} total items
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="variant-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sidebar-section-title" style={{ paddingLeft: 0 }}>Size</div>
            {availableSizes.length > 1 && (
              <span style={{ fontSize: 11, color: '#1e3a5f', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedSizes(selectedSizes.length === availableSizes.length ? [] : [...availableSizes])}>
                {selectedSizes.length === availableSizes.length ? 'Deselect All' : 'Select All'}
              </span>
            )}
          </div>
          <div className="variant-chips">
            {availableSizes.length > 0 ? availableSizes.map(s => (
              <div key={s} className={`chip ${selectedSizes.includes(s) ? 'selected' : ''}`} onClick={() => toggleSize(s)}>{s}</div>
            )) : <div style={{ fontSize: 12, color: '#94a3b8' }}>No sizes found</div>}
          </div>
        </div>
        <div className="variant-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sidebar-section-title" style={{ paddingLeft: 0 }}>Color</div>
            {availableColors.length > 1 && (
              <span style={{ fontSize: 11, color: '#1e3a5f', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedColors(selectedColors.length === availableColors.length ? [] : [...availableColors])}>
                {selectedColors.length === availableColors.length ? 'Deselect All' : 'Select All'}
              </span>
            )}
          </div>
          <div className="variant-chips">
            {availableColors.length > 0 ? availableColors.map(c => (
              <div key={c} className={`chip ${selectedColors.includes(c) ? 'selected' : ''}`} onClick={() => toggleColor(c)}>{c}</div>
            )) : <div style={{ fontSize: 12, color: '#94a3b8' }}>No colors found</div>}
          </div>
        </div>
        <div className="variant-section">
          <div className="sidebar-section-title" style={{ paddingLeft: 0 }}>Quantity (each variant)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => setQty(q => Math.max(1, (Number(q) || 1) - 1))}
              style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <input type="number" min="1" value={qty} placeholder="Qty"
              onChange={e => { const v = e.target.value; setQty(v === '' ? '' : Math.max(1, Number(v) || 0)); }}
              style={{ width: 70, textAlign: 'center', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15, fontWeight: 700 }} />
            <button type="button" onClick={() => setQty(q => (Number(q) || 0) + 1)}
              style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>
        <button className="save-btn" disabled={selectedSizes.length === 0 || selectedColors.length === 0 || !qty}
          onClick={() => onConfirm(selectedSizes, selectedColors, Number(qty) || 1)}>
          Add {comboCount > 0 ? `${comboCount} Variant${comboCount > 1 ? 's' : ''}` : ''} to Purchase
        </button>
      </div>
    </div>
  );
}

function AddProductModal({ close, nextBarcode, showCoolToast, refreshData }) {
  // Simplified version of original add product modal
  const [cat, setCat] = useState("");
  const [items, setItems] = useState([]); // Multiple items
  const [itemInput, setItemInput] = useState("");
  const [cols, setCols] = useState([]);
  const [newCol, setNewCol] = useState("");

  // Add item to list
  const handleAddItem = () => {
    const trimmed = itemInput.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setItemInput("");
    }
  };

  // Remove item from list
  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Add color to list
  const handleAddColor = () => {
    const trimmed = newCol.trim();
    if (trimmed && !cols.includes(trimmed)) {
      setCols([...cols, trimmed]);
      setNewCol("");
    }
  };

  // Remove color from list
  const handleRemoveColor = (idx) => {
    setCols(cols.filter((_, i) => i !== idx));
  };

  // Combine default colors and custom colors (no duplicates)
  const allColors = Array.from(new Set([...DEFAULT_COLORS, ...cols]));
  const colorCount = allColors.length;
  const variantCount = items.length * SIZES.length * colorCount;
  const exampleBarcode = `${nextBarcode}-S-${allColors[0] || 'Black'}`;

  const handleAdd = async () => {
    if (!cat) return alert("Category required");
    if (items.length === 0) return alert("At least one item required");
    try {
      await fetch(`${API_BASE_URL}/masterdata/add-product`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, items, color: allColors, sizes: SIZES })
      });
      showCoolToast(`Generated ${variantCount} variants successfully!`);
      close();
      if (refreshData) refreshData();
    } catch (e) { showCoolToast("Error saving product", "error"); }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Add Product</h3><button className="close-btn" onClick={close}>&times;</button></div>

        <div className="variant-section" style={{ marginBottom: 15, padding: '12px', background: '#eef2ff', borderRadius: 10, border: '1px solid #c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>📦</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#3730a3' }}>Bulk Generation Preview</span>
              <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600 }}>Will create {variantCount} total variants</span>
            </div>
          </div>
          <div style={{ padding: '6px 10px', background: 'white', borderRadius: 6, fontSize: 11, color: '#6b7280', border: '1px dashed #c7d2fe' }}>
            Example: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>{exampleBarcode}</span>
          </div>
        </div>
        <div className="form-group full" style={{ marginBottom: 10 }}>
          <label className="form-label">Category</label>
          <input className="form-input" value={cat} onChange={e => setCat(e.target.value)} placeholder="e.g. Shirts" />
        </div>
        <div className="form-group full" style={{ marginBottom: 10 }}>
          <label className="form-label">Item Names (Add multiple)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={itemInput} onChange={e => setItemInput(e.target.value)} placeholder="e.g. Casual Shirt" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); } }} />
            <button type="button" onClick={handleAddItem} style={{ padding: '6px 12px', borderRadius: 6, background: '#6366f1', color: 'white', border: 'none', fontWeight: 600 }}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {items.map((itm, i) => (
              <span key={i} style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                {itm} <button onClick={() => handleRemoveItem(i)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="form-group full" style={{ marginBottom: 10 }}>
          <label className="form-label">Colors (Type & Enter)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={newCol}
              onChange={e => setNewCol(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
              placeholder="Add specific colors..."
            />
            <button type="button" onClick={handleAddColor} style={{ padding: '6px 12px', borderRadius: 6, background: '#059669', color: 'white', border: 'none', fontWeight: 600 }}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {cols.map((c, i) => (
              <span key={i} style={{ background: '#bbf7d0', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                {c} <button onClick={() => handleRemoveColor(i)} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <button className="save-btn" onClick={handleAdd}>Save Product(s)</button>
      </div>
    </div>
  );
}

function GstConfigModal({ close, categories }) {
  const [cat, setCat] = useState("");
  const [gst, setGst] = useState("");

  const handleSave = async () => {
    if (!cat || !gst) return;
    await fetch(`${API_BASE_URL}/masterdata/set-gst`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, gst: Number(gst) })
    });
    alert("GST Saved");
    close();
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>GST Config</h3><button className="close-btn" onClick={close}>&times;</button></div>
        <div className="form-group full" style={{ marginBottom: 10 }}>
          <label className="form-label">Category</label>
          <select className="form-input" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">Select...</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group full" style={{ marginBottom: 10 }}>
          <label className="form-label">GST %</label>
          <input className="form-input" type="number" value={gst} onChange={e => setGst(e.target.value)} />
        </div>
        <button className="save-btn" onClick={handleSave}>Save GST</button>
      </div>
    </div>
  );
}

function ModifyProductModal({ close, categories, showCoolToast }) {
  const [selectedCat, setSelectedCat] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [showCatOptions, setShowCatOptions] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemInput, setItemInput] = useState("");

  const [existingVariants, setExistingVariants] = useState([]);
  const [swColors, setSwColors] = useState([]); // All colors in software

  const [newSizes, setNewSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [isAddingSize, setIsAddingSize] = useState(false);

  const [newColors, setNewColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [isAddingColor, setIsAddingColor] = useState(false);

  const [manualBaseCode, setManualBaseCode] = useState("");
  const [isEditingBaseCode, setIsEditingBaseCode] = useState(false);

  // Category-specific metadata
  const [catColors, setCatColors] = useState([]);
  const [catSizes, setCatSizes] = useState([]);
  const [nextBarcode, setNextBarcode] = useState("PRD-??????");

  const SIZES_OPTIONS = ["S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    // Fetch all existing colors in software for the color dropdown
    fetch(`${API_BASE_URL}/masterdata/colors`)
      .then(res => res.json())
      .then(data => setSwColors(data.colors || []))
      .catch(() => setSwColors([]));

    // Fetch next barcode for prediction
    fetch(`${API_BASE_URL}/masterdata/next-barcode`)
      .then(res => res.json())
      .then(data => setNextBarcode(data.nextBarcode || "PRD-??????"))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (selectedCat) {
      // 1. Fetch Items and Merge with Static
      fetch(`${API_BASE_URL}/masterdata/items-by-category?category=${encodeURIComponent(selectedCat)}`)
        .then(res => res.json())
        .then(data => {
          const backendItems = data.items || []; // Array of {name, code}

          // Get static items for this category
          const staticItemNames = [];
          Object.values(STATIC_PRODUCT_DATA).forEach(group => {
            if (group[selectedCat]) {
              group[selectedCat].forEach(name => staticItemNames.push(name));
            }
          });

          // Create combined list: Prefer backend data for codes, fallback to static name
          const finalMap = new Map();

          // Add static ones first (no code)
          staticItemNames.forEach(name => finalMap.set(name, { name, code: "" }));

          // Overlay backend ones (has code)
          backendItems.forEach(item => finalMap.set(item.name, item));

          const combinedItems = Array.from(finalMap.values());
          setItems(combinedItems);

          if (combinedItems.length === 0) setIsAddingItem(true);
          else setIsAddingItem(false);
        })
        .catch(() => {
          setItems([]);
          setIsAddingItem(true);
        });

      // 2. Fetch Colors for Category
      fetch(`${API_BASE_URL}/masterdata/colors-for-category?category=${encodeURIComponent(selectedCat)}`)
        .then(res => res.json())
        .then(data => setCatColors(data.colors || []))
        .catch(() => setCatColors([]));

      // 3. Fetch Sizes for Category
      fetch(`${API_BASE_URL}/masterdata/sizes-for-category?category=${encodeURIComponent(selectedCat)}`)
        .then(res => res.json())
        .then(data => setCatSizes(data.sizes || []))
        .catch(() => setCatSizes([]));
    } else {
      setItems([]);
      setSelectedItems([]);
      setIsAddingItem(false);
      setCatColors([]);
      setCatSizes([]);
    }
  }, [selectedCat]);

  useEffect(() => {
    if (selectedCat && selectedItems.length > 0 && !isAddingItem) {
      // Fetch variants for the first selected item for basic preview
      fetch(`${API_BASE_URL}/masterdata/existing-variants?category=${encodeURIComponent(selectedCat)}&item=${encodeURIComponent(selectedItems[0])}`)
        .then(res => res.json())
        .then(data => setExistingVariants(data.variants || []))
        .catch(() => setExistingVariants([]));
    } else {
      setExistingVariants([]);
    }
  }, [selectedCat, selectedItems, isAddingItem]);

  const handleAddSizeToList = (val) => {
    const s = (val || sizeInput).trim();
    if (s && !newSizes.includes(s)) {
      setNewSizes([...newSizes, s]);
      if (!val) setSizeInput("");
    }
  };

  const handleAddColorToList = (val) => {
    const c = (val || colorInput).trim();
    if (c && !newColors.includes(c)) {
      setNewColors([...newColors, c]);
      if (!val) setColorInput("");
    }
  };

  const handleModify = async () => {
    const finalItemsArr = isAddingItem ? (itemInput.trim() ? [itemInput.trim()] : []) : selectedItems;

    if (!selectedCat) return alert("Please select a Category first.");
    if (finalItemsArr.length === 0) return alert("Please select at least one Item.");

    if (newSizes.length === 0 && newColors.length === 0) {
      return alert("Please add at least one Size or Color to modify.");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/masterdata/modify-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCat,
          items: finalItemsArr,
          newSizes: newSizes,
          newColors: newColors,
          manualBaseCode: manualBaseCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        showCoolToast(`Success! Added ${data.count} new variants.`);
        close();
        window.location.reload();
      } else {
        alert(data.message || "Failed to modify product");
      }
    } catch (e) {
      showCoolToast("Error modifying product", "error");
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
        <div className="modal-header">
          <h3>Modify Product</h3>
          <button className="close-btn" onClick={close}>&times;</button>
        </div>

        {/* CATEGORY */}
        <div className="form-group full" style={{ marginBottom: 16, position: 'relative' }}>
          <label className="form-label">Category</label>
          <input
            className="form-input"
            value={catSearch}
            onChange={e => {
              setCatSearch(e.target.value);
              setShowCatOptions(true);
              if (e.target.value === "") setSelectedCat(""); // Clear selection if cleared
            }}
            onClick={() => setShowCatOptions(true)}
            placeholder="Type to search category..."
          />
          {showCatOptions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginTop: '4px'
            }}>
              {categories.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(c => (
                <div
                  key={c}
                  onClick={() => {
                    setSelectedCat(c);
                    setCatSearch(c);
                    setShowCatOptions(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderBottom: '1px solid #f1f5f9',
                    background: selectedCat === c ? '#eef2ff' : 'white',
                    color: selectedCat === c ? '#4f46e5' : '#1e293b'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = selectedCat === c ? '#eef2ff' : 'white'}
                >
                  {c}
                </div>
              ))}
              {categories.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No matches found</div>
              )}
            </div>
          )}
        </div>

        {selectedCat && (
          <>
            {/* ITEM */}
            <div className="form-group full" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Item Name</label>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  {isAddingItem ? "← Select Existing" : "➕ Add New"}
                </button>
              </div>
              {isAddingItem ? (
                <input className="form-input" value={itemInput} onChange={e => setItemInput(e.target.value)} placeholder="Type new item name..." autoFocus />
              ) : (
                <div className="form-input" style={{ height: 'auto', minHeight: '42px', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#ffffff', cursor: 'default' }}>
                  {items.length > 0 ? (
                    items.map(i => (
                      <button
                        key={i.name}
                        onClick={() => {
                          if (selectedItems.includes(i.name)) {
                            setSelectedItems(selectedItems.filter(item => item !== i.name));
                          } else {
                            setSelectedItems([...selectedItems, i.name]);
                          }
                        }}
                        style={{
                          background: selectedItems.includes(i.name) ? '#4f46e5' : '#f8fafc',
                          color: selectedItems.includes(i.name) ? 'white' : '#475569',
                          border: '1px solid',
                          borderColor: selectedItems.includes(i.name) ? '#4f46e5' : '#e2e8f0',
                          padding: '6px 14px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          boxShadow: selectedItems.includes(i.name) ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none',
                          minWidth: '100px'
                        }}
                      >
                        <span style={{ fontSize: '12px' }}>{i.name}</span>
                        {i.code && (
                          <span style={{
                            fontSize: '10px',
                            opacity: selectedItems.includes(i.name) ? 1 : 0.8,
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                          }}>
                            {i.code.replace('PRD-', 'PRD- ')}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', padding: '4px 0' }}>No items found in this category.</span>
                  )}
                </div>
              )}
            </div>

            {/* SIZES */}
            <div className="form-group full" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Sizes (To Add)</label>
                <button
                  onClick={() => setIsAddingSize(!isAddingSize)}
                  style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  {isAddingSize ? "← Select Standard" : "➕ Custom Size"}
                </button>
              </div>
              {isAddingSize ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="Type custom size..." style={{ flex: 1 }} autoFocus />
                  <button onClick={() => handleAddSizeToList()} style={{ padding: '0 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Add</button>
                </div>
              ) : (
                <div className="form-input" style={{ height: 'auto', minHeight: '42px', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#ffffff', cursor: 'default' }}>
                  {catSizes.length > 0 && (
                    <div style={{ width: '100%', marginBottom: '4px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Existing in Category</div>
                  )}
                  {catSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => handleAddSizeToList(s)}
                      style={{ background: newSizes.includes(s) ? '#4f46e5' : '#f8fafc', color: newSizes.includes(s) ? 'white' : '#6366f1', border: '1px solid', borderColor: newSizes.includes(s) ? '#4f46e5' : '#e2e8f0', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                {newSizes.map((s, idx) => (
                  <span key={idx} style={{ background: '#e0e7ff', padding: '3px 8px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    {s} <button onClick={() => setNewSizes(newSizes.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer' }}>&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* COLORS */}
            <div className="form-group full" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Colors (To Add)</label>
                <button
                  onClick={() => setIsAddingColor(!isAddingColor)}
                  style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  {isAddingColor ? "← Select Existing" : "➕ Custom Color"}
                </button>
              </div>
              {isAddingColor ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Type custom color..." style={{ flex: 1 }} autoFocus />
                  <button onClick={() => handleAddColorToList()} style={{ padding: '0 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Add</button>
                </div>
              ) : (
                <div className="form-input" style={{ height: 'auto', minHeight: '42px', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#ffffff', cursor: 'default' }}>
                  {catColors.length > 0 && (
                    <div style={{ width: '100%', marginBottom: '4px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Existing in Category</div>
                  )}
                  {catColors.map(c => (
                    <button
                      key={c}
                      onClick={() => handleAddColorToList(c)}
                      style={{ background: newColors.includes(c) ? '#4f46e5' : '#f8fafc', color: newColors.includes(c) ? 'white' : '#6366f1', border: '1px solid', borderColor: newColors.includes(c) ? '#4f46e5' : '#e2e8f0', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                {newColors.map((c, idx) => (
                  <span key={idx} style={{ background: '#e0e7ff', padding: '3px 8px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    {c} <button onClick={() => setNewColors(newColors.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer' }}>&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* EXISTING PREVIEW */}
            {!isAddingItem && selectedItems.length > 0 && (
              <div style={{ marginBottom: 20, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Preview: "{selectedItems[0]}" inventory {selectedItems.length > 1 && `(+${selectedItems.length - 1} more)`}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from(new Set(existingVariants.map(v => v.color))).map(c => <span key={c} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{c}</span>)}
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  {Array.from(new Set(existingVariants.map(v => v.size))).map(s => <span key={s} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
            )}

            {/* NEW VARIANTS PREVIEW */}
            {(newSizes.length > 0 || newColors.length > 0) && (function () {
              const itemsToProcess = isAddingItem
                ? [{ name: itemInput, code: nextBarcode }]
                : selectedItems.map(itName => items.find(i => i.name === itName)).filter(Boolean);

              const totalPreview = [];
              const baseCodesSet = new Set();

              itemsToProcess.forEach(itemObj => {
                let autoBaseCode = (itemObj && itemObj.code && itemObj.code.length > 5)
                  ? itemObj.code
                  : nextBarcode;

                const baseCode = (itemsToProcess.length === 1 && manualBaseCode) ? manualBaseCode : autoBaseCode;
                baseCodesSet.add(baseCode);

                const baseSizes = catSizes.length > 0 ? catSizes : ["S", "M", "L", "XL", "XXL"];
                const baseColors = catColors.length > 0 ? catColors : ["Default"];

                const combinations = [];
                // 1. (New Color) x (All category sizes)
                newColors.forEach(c => baseSizes.forEach(s => combinations.push({ s, c })));
                // 2. (New Size) x (All category colors)
                newSizes.forEach(s => baseColors.forEach(c => combinations.push({ s, c })));
                // 3. (New Size) x (New Color)
                newColors.forEach(c => newSizes.forEach(s => combinations.push({ s, c })));

                // Dedup
                const seen = new Set();
                combinations.forEach(cb => {
                  const key = `${cb.s}|${cb.c}`;
                  if (!seen.has(key)) {
                    totalPreview.push(`${baseCode}-${cb.s}-${cb.c}`);
                    seen.add(key);
                  }
                });
              });

              const baseCodesList = Array.from(baseCodesSet);

              return (
                <div style={{ marginBottom: 20, padding: 12, background: '#ecfdf5', borderRadius: 10, border: '1px solid #6ee7b7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>🚀 New Variants To Be Generated:</div>
                    <div style={{ fontSize: 10, fontWeight: 700, background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: 4 }}>
                      {totalPreview.length} New Codes
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: '#064e3b', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600 }}>{baseCodesList.length > 1 ? "Base Codes:" : "Base Code:"}</span>
                      {baseCodesList.length === 1 && isEditingBaseCode ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            value={manualBaseCode || baseCodesList[0]}
                            onChange={e => setManualBaseCode(e.target.value)}
                            style={{ width: 100, padding: '2px 4px', fontSize: 11, border: '1px solid #10b981', borderRadius: 4 }}
                            autoFocus
                          />
                          <button onClick={() => setIsEditingBaseCode(false)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>OK</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {baseCodesList.map(bc => (
                            <span
                              key={bc}
                              style={{ fontWeight: 800, fontFamily: 'monospace', cursor: itemsToProcess.length === 1 ? 'pointer' : 'default', borderBottom: itemsToProcess.length === 1 ? '1px dashed #059669' : 'none' }}
                              onClick={() => itemsToProcess.length === 1 && setIsEditingBaseCode(true)}
                              title={itemsToProcess.length === 1 ? "Click to edit base code" : ""}
                            >
                              {bc}{itemsToProcess.length === 1 ? " ✎" : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#064e3b' }}>
                      <span style={{ fontWeight: 600 }}>Category:</span> {selectedCat} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> <span style={{ fontWeight: 600 }}>Items:</span> {isAddingItem ? itemInput : selectedItems.join(', ')}
                    </div>
                    <div style={{ fontSize: 12, color: '#064e3b' }}>
                      <span style={{ fontWeight: 600 }}>Logic:</span>
                      {newSizes.length > 0 ? newSizes.join(', ') : 'All Sizes'}
                      <span style={{ color: '#059669', margin: '0 4px', fontWeight: 800 }}>×</span>
                      {newColors.length > 0 ? newColors.join(', ') : 'All Colors'}
                    </div>
                  </div>

                  {/* Code List */}
                  <div style={{
                    maxHeight: '100px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #d1fae5',
                    borderRadius: 6,
                    padding: '6px'
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {totalPreview.map((code, idx) => (
                        <span key={idx} style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: '#047857',
                          background: '#d1fae5',
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid #a7f3d0'
                        }}>
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        <button className="save-btn" onClick={handleModify} disabled={!selectedCat || (selectedItems.length === 0 && !itemInput)}>
          {isAddingItem ? "Generate New Product" : `Update ${selectedItems.length} Products`}
        </button>
      </div>
    </div>
  );
}

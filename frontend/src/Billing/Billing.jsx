import API_BASE_URL from "../apiConfig";
import "./Billing.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BarcodeScannerInput from "../BarcodeLabel/BarcodeScannerInput";
import BarcodeLabel from "../BarcodeLabel/BarcodeLabel";
import { getProductByCode, getProductBySizeColorBarcode, isValidSizeColorBarcodeFormat, getProductByName } from "../BarcodeLabel/barcodeUtils";

/* ================= LOW STOCK TOAST NOTIFICATION ================= */
const LowStockToast = ({ alerts, onClose, onDismissAll }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="low-stock-toast-container">
            <div className="low-stock-toast">
                <div className="toast-header">
                    <span className="toast-icon">⚠️</span>
                    <span className="toast-title">Low Stock Alert</span>
                    <button className="toast-close-all" onClick={onDismissAll}>Dismiss All</button>
                </div>
                <div className="toast-body">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className="toast-alert-item">
                            <div className="alert-product">
                                <strong>{alert.category}</strong> → {alert.item} → <span className="alert-size">{alert.size}</span>
                            </div>
                            <div className="alert-colors">
                                {alert.lowColors.map((c, i) => (
                                    <span key={i} className={`alert - color - badge ${c.available <= 5 ? 'critical' : 'warning'} `}>
                                        {c.color}: {c.available}
                                    </span>
                                ))}
                            </div>
                            <button className="toast-item-close" onClick={() => onClose(idx)}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ================= HELPER DATA ================= */
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

export default function Billing() {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem("role");

    // --- CORE STATE ---
    const [cart, setCart] = useState([]); // Array of items
    const [productsMap, setProductsMap] = useState({}); // Category -> [Items]
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // --- CONFIG / META STATE ---
    const [colors, setColors] = useState(DEFAULT_COLORS); // eslint-disable-line no-unused-vars
    const [gstConfig, setGstConfig] = useState({});
    const [invoiceNo, setInvoiceNo] = useState(() => `INV-${Math.floor(1000 + Math.random() * 9000)}`);
    const [date] = useState(new Date().toLocaleDateString("en-IN"));

    // --- CUSTOMER STATE ---
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [paymentStatus] = useState("Received"); // eslint-disable-line no-unused-vars

    // --- UI MODALS STATE ---
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null); // { category, name }
    const [showPaymentPanel, setShowPaymentPanel] = useState(false);
    const [showDailySummary, setShowDailySummary] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);

    // --- ALERTS / TOASTS ---
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const lowStockCheckedRef = useRef(false); // eslint-disable-line no-unused-vars

    // --- BARCODE LABEL ---
    const [showBarcodeLabel, setShowBarcodeLabel] = useState(false); // eslint-disable-line no-unused-vars
    const [selectedProductForLabel, setSelectedProductForLabel] = useState(null); // eslint-disable-line no-unused-vars

    // --- STOCK MATRIX VIEW STATE ---
    const [showStockView, setShowStockView] = useState(false); // eslint-disable-line no-unused-vars
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isFromCnFlow, setIsFromCnFlow] = useState(false);
    const [isFromReturnFlow, setIsFromReturnFlow] = useState(false);
    const [stockData, setStockData] = useState([]); // eslint-disable-line no-unused-vars
    const [stockLoading, setStockLoading] = useState(false); // eslint-disable-line no-unused-vars
    const [stockSearch, setStockSearch] = useState(""); // eslint-disable-line no-unused-vars
    const [stockCategory, setStockCategory] = useState("All"); // eslint-disable-line no-unused-vars
    const [itemsToRefund, setItemsToRefund] = useState([]);
    const [isFromRefundIssuance, setIsFromRefundIssuance] = useState(false);
    const [refundModeState, setRefundModeState] = useState('Cash');
    const [allBackendProducts, setAllBackendProducts] = useState([]);
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [filteredClientSuggestions, setFilteredClientSuggestions] = useState([]);
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [redeemedCnAmount, setRedeemedCnAmount] = useState(0);
    const [redeemedCnNumber, setRedeemedCnNumber] = useState("");
    const [redeemedRefundId, setRedeemedRefundId] = useState(null);
    const [creditedItems, setCreditedItems] = useState([]); // eslint-disable-line no-unused-vars
    const [totalAlreadyPaid, setTotalAlreadyPaid] = useState(0); // For replacements/updates
    const [originalBill, setOriginalBill] = useState(null);      // Original bill for replacement print
    const [exchangeSlotsNeeded, setExchangeSlotsNeeded] = useState(0); // eslint-disable-line no-unused-vars
    const exchangeSlotsRef = useRef(0); // ref avoids stale closure in addToCart

    // Ref to the product grid and category list for auto-focus
    const productGridRef = useRef(null);
    const categoryListRef = useRef(null);

    // Smart Tab wrap: last product → next category → its first product
    const handleGridKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const cards = productGridRef.current?.querySelectorAll('button.product-card');
        if (!cards || cards.length === 0) return;

        const cats = searchQuery ? displayedCategories : allCategories;
        const currentCatIdx = cats.indexOf(selectedCategory);

        if (!e.shiftKey && document.activeElement === cards[cards.length - 1]) {
            // Tab past last product → go to next category
            const nextCatIdx = currentCatIdx + 1;
            if (nextCatIdx < cats.length) {
                e.preventDefault();
                const nextCat = cats[nextCatIdx];
                setSelectedCategory(nextCat);
                setTimeout(() => {
                    // Focus the next category button in the sidebar
                    const catBtns = categoryListRef.current?.querySelectorAll('button.category-item');
                    if (catBtns?.[nextCatIdx]) catBtns[nextCatIdx].focus();
                    // Then immediately focus the first product card
                    setTimeout(() => {
                        const first = productGridRef.current?.querySelector('button.product-card');
                        if (first) first.focus();
                    }, 60);
                }, 80);
            }
        } else if (e.shiftKey && document.activeElement === cards[0]) {
            // Shift+Tab on first product → go back to current category button
            e.preventDefault();
            const catBtns = categoryListRef.current?.querySelectorAll('button.category-item');
            if (catBtns?.[currentCatIdx]) catBtns[currentCatIdx].focus();
        }
    };


    /* ================= INITIALIZATION ================= */

    useEffect(() => {
        // 1. Fetch Categories - only from backend (tenant's real data)
        fetch(`${API_BASE_URL}/masterdata/categories`)
            .then(res => res.json())
            .then(data => {
                const backendCats = Array.isArray(data.categories) ? data.categories : [];
                setAllCategories(backendCats);
            }).catch(() => { });

        // 2. Fetch All Products - only from backend
        fetch(`${API_BASE_URL}/masterdata/all-products`)
            .then(res => res.json())
            .then(data => {
                const map = {};
                const colorSet = new Set(DEFAULT_COLORS);

                if (data && Array.isArray(data.data)) {
                    data.data.forEach(row => {
                        if (!row.category || !row.item) return;
                        if (!map[row.category]) map[row.category] = new Set();
                        map[row.category].add(row.item);
                        if (row.color) colorSet.add(row.color);
                    });
                }

                const finalMap = {};
                Object.keys(map).forEach(cat => {
                    finalMap[cat] = Array.from(map[cat]);
                });

                setProductsMap(finalMap);
                setColors(Array.from(colorSet));
                setAllBackendProducts(data.data || []);
            }).catch(() => { });

        // 3. Fetch GST Config
        fetch(`${API_BASE_URL}/masterdata/all-gst-config`)
            .then(res => res.json())
            .then(data => { if (data.config) setGstConfig(data.config); })
            .catch(() => { });

        // 4. Fetch Client Suggestions
        fetch(`${API_BASE_URL}/billing/unique-clients`)
            .then(res => res.json())
            .then(data => { if (data.clients) setClientSuggestions(data.clients); })
            .catch(() => { });

    }, []);

    useEffect(() => {
        if (!location.state) return;

        const { bill, items, isFromReturn, isFromCn, isFromRefund, isFromRefundIssuance: isIssuanceFromState, cnAmount, cnNumber, refundAmount, refundId, refundMode: refundModeFromState } = location.state;

        // --- 1. HANDLE PURE REDEMPTION (No original bill object) ---
        if (location.state.isFromCnRedeem) {
            setRedeemedCnAmount(location.state.cnAmount || 0);
            setRedeemedCnNumber(location.state.cnNumber || "");
            setClientName(location.state.clientName || "");
            setClientPhone(location.state.clientPhone || "");
            setCart([]);
            setIsUpdateMode(false);
            window.history.replaceState({}, document.title);
            return;
        }

        if (location.state.isFromRefundRedeem) {
            setRedeemedCnAmount(location.state.refundAmount || 0);
            setRedeemedRefundId(location.state.refundId || null);
            setClientName(location.state.clientName || "");
            setClientPhone(location.state.clientPhone || "");
            setCart([]);
            setIsUpdateMode(false);
            window.history.replaceState({}, document.title);
            return;
        }

        // --- 2. HANDLE BILL-BASED FLOWS (Requires bill object) ---
        if (bill) {
            // Always set customer info
            setClientName(bill.client_name || "");
            setClientPhone(bill.phone || "");

            if (isFromReturn) {
                // REPLACEMENT: pre-fill invoice, mark as update, fill cart with replacement items
                const normInv = (bill.invoice_no || "").replace(/\s+/g, '');
                setInvoiceNo(normInv);
                setIsUpdateMode(true);
                setIsFromReturnFlow(true);
                setOriginalBill(bill); // ← cache full original bill

                // Items passed from ReturnReplace are tagged: isReturned or isRetained
                const itemsToUse = items || bill.items || [];
                const prefilledCart = itemsToUse.map(item => ({
                    category: item.category,
                    name: item.item_name || item.name,
                    size: item.size,
                    color: item.color,
                    rate: Number(item.unit_price || item.price || item.rate) || 0,
                    price: Number(item.unit_price || item.price || item.rate) || 0,
                    qty: Number(item.qty) || 1,
                    gst: Number(item.gst_percent || item.gst) || 5,
                    barcode: item.barcode || item.productCode || "",
                    isOriginalBillItem: !!item.isReturned, // Red highlight
                    isRetainedItem: !!item.isRetained      // Custom tag for keeping
                }));
                setCart(prefilledCart);
                // The "already paid" amount is the FULL total of the original bill
                setTotalAlreadyPaid(Number(location.state.originalFullTotal || bill.grand_total) || 0);

            } else if (isFromCn) {
                // CREDIT NOTE REDEMPTION: pre-fill ALL bill items, highlight credited ones
                setIsFromCnFlow(true);
                setRedeemedCnAmount(cnAmount || 0);
                setRedeemedCnNumber(cnNumber || "");
                setIsUpdateMode(false);
                // Use ORIGINAL invoice so exchange item is appended, not a new bill
                setInvoiceNo((bill.invoice_no || "").replace(/\s+/g, ''));

                const cItems = location.state.creditedItems || [];
                const cItemIds = new Set(cItems.map(ci => ci.id));
                setCreditedItems(cItems);

                // Pre-fill cart with ALL original bill items — mark as original so they don't get double-saved
                const allBillItems = bill.items || [];
                const prefilledCart = allBillItems.map(item => ({
                    category: item.category,
                    name: item.item_name || item.name,
                    size: item.size,
                    color: item.color,
                    rate: Number(item.price || item.unit_price || item.rate) || 0,
                    price: Number(item.price || item.unit_price || item.rate) || 0,
                    qty: Number(item.qty) || 1,
                    gst: Number(item.gst_percent || item.gst) || 5,
                    barcode: item.barcode || item.productCode || "",
                    isOriginalBillItem: true,   // ← flag: already paid, don't re-save
                    isCredited: cItemIds.has(item.id) || !!item.is_cn_update
                }));
                setCart(prefilledCart);

            } else if (isFromRefund || location.state.isFromRefundIssuance) {
                // REDEMPTION or NEW ISSUANCE via Billing
                const isIssuance = isIssuanceFromState || location.state.isFromRefundIssuance;
                setIsFromRefundIssuance(isIssuance);
                if (refundModeFromState) setRefundModeState(refundModeFromState);
                setIsFromCnFlow(true); // Treat like CN flow (redemption)
                setRedeemedCnAmount(isIssuance ? 0 : (refundAmount || 0));
                setRedeemedRefundId(refundId || null);
                setIsUpdateMode(true); // Always update the original invoice

                // Use ORIGINAL invoice
                setInvoiceNo((bill.invoice_no || "").replace(/\s+/g, ''));

                const rItems = location.state.refundedItems || [];
                const rItemIds = new Set(rItems.map(ri => ri.id));
                setItemsToRefund(rItems);

                const allBillItems = bill.items || [];
                const prefilledCart = allBillItems.map(item => ({
                    category: item.category,
                    name: item.item_name || item.name,
                    size: item.size,
                    color: item.color,
                    rate: Number(item.price || item.unit_price || item.rate) || 0,
                    price: Number(item.price || item.unit_price || item.rate) || 0,
                    qty: Number(item.qty) || 1,
                    gst: Number(item.gst_percent || item.gst) || 5,
                    barcode: item.barcode || item.productCode || "",
                    id: item.id,
                    isOriginalBillItem: true, // was already paid
                    isToRefund: rItemIds.has(item.id) || !!item.is_cash_refunded, // Mark specifically for removal/refund
                    isCredited: false // Don't show credit highlight on items staying on bill
                }));
                setCart(prefilledCart);
            }

            // Note: isFromReturn excluded here — it sets totalAlreadyPaid = returnedTotal (selected items only) above
            if (isFromCn || isFromRefund || location.state.isFromRefundIssuance) {
                setTotalAlreadyPaid(Number(bill.grand_total) || 0);
            }

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleClientNameChange = (val) => {
        setClientName(val);
        const list = Array.isArray(clientSuggestions) ? clientSuggestions : [];
        if (val.trim()) {
            const matches = list.filter(c =>
                c && c.client_name && c.client_name.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredClientSuggestions(matches);
            setShowClientSuggestions(matches.length > 0);
        } else {
            setFilteredClientSuggestions([]);
            setShowClientSuggestions(false);
        }
    };

    /* ================= STOCK DATA FETCHING ================= */
    const fetchStockData = async () => {
        setStockLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/stock/calculated`);
            const data = await res.json();
            if (res.ok) setStockData(data.stock || []);
        } catch (e) { console.error(e); }
        setStockLoading(false);
    };

    useEffect(() => {
        if (showStockView) fetchStockData();
    }, [showStockView]);


    /* ================= CART CALCULATIONS ================= */

    const subTotalWithTax = Math.round(cart.reduce((sum, item) => {
        // Exclude items being refunded from the 'New Bill Total'
        if (item.isToRefund) return sum;

        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const gstPercent = Number(item.gst) || 0;
        const priceWithGst = price + (price * gstPercent / 100);
        return sum + (qty * priceWithGst);
    }, 0));

    // Sum ONLY the new items added in this session (not original pre-filled bill items)
    // This correctly handles: exchange same price = ₹0, buy extra = pay extra
    // eslint-disable-next-line no-unused-vars
    const newItemsTotal = Math.round(cart.filter(i => !i.isOriginalBillItem).reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const gstPercent = Number(item.gst) || 0;
        return sum + qty * (price + price * gstPercent / 100);
    }, 0));

    // Still compute exchangeItemTotal for the checkout display label
    // eslint-disable-next-line no-unused-vars
    const exchangeItemTotal = Math.round(cart.filter(i => i.isCredited && !i.isOriginalBillItem).reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const gstPercent = Number(item.gst) || 0;
        return sum + qty * (price + price * gstPercent / 100);
    }, 0));

    // For replacement: "After" total is (Retained Items + New Exchange Items)
    const effectiveCartTotal = isFromReturnFlow
        ? Math.round(cart.filter(i => !i.isOriginalBillItem).reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.qty) || 0;
            const gst = Number(item.gst) || 0;
            const gstPercent = isNaN(gst) ? 5 : gst;
            return sum + qty * (price + price * gstPercent / 100);
        }, 0))
        : subTotalWithTax;

    const cnNetAmount = (isFromReturnFlow ? effectiveCartTotal : subTotalWithTax) - totalAlreadyPaid - redeemedCnAmount;
    const grandTotal = Math.max(cnNetAmount, 0);

    const balance = Math.max(grandTotal - Math.round(paidAmount), 0);
    const changeReturn = Math.max(Math.round(paidAmount) - grandTotal, 0);

    /* ================= CART ACTIONS ================= */

    const addToCart = (productItem) => {
        // productItem = { category, name, size, color, price, productCode, gst }
        setCart(prev => {
            const existingIdx = prev.findIndex(item =>
                item.category === productItem.category &&
                item.name === productItem.name &&
                item.size === productItem.size &&
                item.color === productItem.color &&
                !item.isOriginalBillItem // Only merge with other NEW items
            );

            if (existingIdx > -1) {
                const newCart = [...prev];
                newCart[existingIdx].qty += (productItem.qty || 1);
                return newCart;
            } else {
                // Use ref (not state) to avoid stale closure — ref is always current
                const needsSlot = exchangeSlotsRef.current > 0;
                if (needsSlot) {
                    exchangeSlotsRef.current -= 1;
                    setExchangeSlotsNeeded(s => s - 1);
                }
                return [...prev, {
                    ...productItem,
                    qty: 1,
                    gst: productItem.gst || 5,
                    barcode: productItem.productCode,
                    isOriginalBillItem: false,  // new item added during session
                    isCredited: isFromCnFlow || isFromReturnFlow || needsSlot // Highlight as exchange in return flows
                }];
            }
        });
    };

    const removeFromCart = (index) => {
        const removedItem = cart[index]; // read directly — no stale closure
        if (removedItem?.isCredited) {
            // Open an exchange slot for the next item the salesperson picks
            exchangeSlotsRef.current += 1;
            setExchangeSlotsNeeded(s => s + 1);
        }
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateCartItem = (index, field, value) => {
        setCart(prev => {
            const newCart = [...prev];
            newCart[index][field] = value;
            return newCart;
        });
    };

    /* ================= PRODUCT SELECTION FLOW ================= */

    const handleProductClick = (category, itemName) => {
        // Find existing variants from allProducts (fetched on mount)
        // or we could do a fresh fetch if we want to be super safe
        // But let's use the local state first for performance
        setSelectedProductForVariant({ category, name: itemName });
        setShowVariantModal(true);
    };

    const handleVariantConfirm = async (size, color) => {
        if (!selectedProductForVariant) return;

        const { category, name } = selectedProductForVariant;
        let finalPrice = 0;
        let finalBarcode = "";

        // Fetch latest price from backend
        try {
            const res = await fetch(`${API_BASE_URL}/masterdata/latest-price?category=${encodeURIComponent(category)}&item_name=${encodeURIComponent(name)}&size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`);
            const data = await res.json();
            finalPrice = Number(data.price) || 0;
            finalBarcode = data.barcode || "";
        } catch (e) { console.error(e); }

        // Fallback to static database if price is 0
        if (finalPrice === 0) {
            const staticProd = getProductByName(category, name);
            if (staticProd) {
                finalPrice = staticProd.price;
            }
        }

        addToCart({
            category,
            name,
            size,
            color,
            price: finalPrice,
            productCode: finalBarcode,
            gst: gstConfig[category] || 5
        });

        setShowVariantModal(false);
        setSelectedProductForVariant(null);
    };

    /* ================= BARCODE HANDLER (Legacy Integrated) ================= */

    const handleBarcodeScanned = async (barcode) => {
        // ... (Keep existing complex logic but adapt to addToCart)
        // Reuse the previous logic but call addToCart instead of manipulating `items` directly

        let product, size, color, productCode;
        // eslint-disable-next-line no-unused-vars
        let latestPrice = 0;

        // 1. Regex Parse
        let parsedSize = null, parsedColor = null;
        const fullMatch = barcode.match(/^(PRD-\d{6})-(S|M|L|XL|XXL)-(.+)$/);
        if (fullMatch) {
            parsedSize = fullMatch[2];
            parsedColor = fullMatch[3];
        }

        // 2. Fetch Backend
        try {
            const res = await fetch(`${API_BASE_URL}/masterdata/product-by-barcode?barcode=${encodeURIComponent(barcode)}`);
            const data = await res.json();
            if (data.found) {
                product = { name: data.name, category: data.category, price: data.price || 0 };
                size = parsedSize || data.size || "XXL";
                color = parsedColor || data.color || "White";
                productCode = data.barcode;

                if (product.price === 0) {
                    // Try fetch price
                    const pRes = await fetch(`${API_BASE_URL}/masterdata/latest-price?category=${encodeURIComponent(product.category)}&item_name=${encodeURIComponent(product.name)}&size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`);
                    const pData = await pRes.json();
                    if (pData.price > 0) product.price = pData.price;
                }
            }
        } catch { /* ignore */ }

        // 3. Fallback Static
        if (!product) {
            if (isValidSizeColorBarcodeFormat(barcode)) {
                const full = getProductBySizeColorBarcode(barcode);
                if (full) {
                    product = full;
                    size = full.size;
                    color = full.color;
                    productCode = full.baseProductCode;
                }
            } else if (/^PRD-\d{6}$/.test(barcode)) {
                product = getProductByCode(barcode);
                if (product) {
                    size = "XXL";
                    color = "White";
                    productCode = barcode;
                }
            }
        }

        if (product) {
            addToCart({
                category: product.category,
                name: product.name,
                size: size || "XXL",
                color: color || "White",
                price: product.price || 0,
                gst: gstConfig[product.category] || 5,
                productCode
            });
            /* Show tiny toast? */
        } else {
            alert("Product not found: " + barcode);
        }
    };

    /* ================= SAVE & PRINT ================= */

    const handleSave = async (print = false) => {
        // Skip check if we just want to see the print layout
        if (cart.length === 0 && !print) return alert("Cart is empty");

        try {
            if (cart.length > 0) {
                // For Replacement: we save the NEW full bill (Retained items + Exchange items)
                const itemsToSave = isFromReturnFlow
                    ? cart.filter(item => !item.isOriginalBillItem)
                    : (isUpdateMode || isFromRefundIssuance || !isFromCnFlow)
                        ? cart.filter(item => !item.isToRefund)
                        : cart.filter(item => !item.isOriginalBillItem);

                const payload = {
                    invoice_no: invoiceNo,
                    client_name: clientName,
                    phone: clientPhone,
                    payment_mode: paymentMode,
                    payment_status: "Received",
                    sale_date: new Date(),
                    // grand_total here is what goes into sales table. 
                    // For replacement, it's the full total of the new combination.
                    grand_total: isFromReturnFlow ? effectiveCartTotal : (isFromRefundIssuance ? subTotalWithTax : (isFromCnFlow ? Math.abs(cnNetAmount) : grandTotal)),
                    redeemed_cn_no: redeemedCnNumber,
                    redeemed_refund_id: redeemedRefundId,
                    redeemed_cn_amount: redeemedCnAmount,
                    is_cn_update: isFromRefundIssuance ? false : isFromCnFlow,
                    is_cash_refunded: isFromRefundIssuance ? true : false,
                    is_replaced: isFromReturnFlow,
                    // For logging the comparison in item_replacements
                    returned_items: isFromReturnFlow ? cart.filter(i => i.isOriginalBillItem) : [],
                    returned_total: isFromReturnFlow ? totalAlreadyPaid : 0,
                    items: itemsToSave.map(item => ({ ...item, payment_status: "Received", is_cn_update: (isFromCnFlow && !isFromRefundIssuance) ? 1 : 0, is_replaced: isFromReturnFlow ? 1 : 0 }))
                };

                // --- SPECIAL CASE: REFUND ISSUANCE ---
                if (isFromRefundIssuance && itemsToRefund.length > 0) {
                    const refundPayload = {
                        invoice_no: invoiceNo,
                        refund_type: "cash",
                        amount: Math.abs(cnNetAmount), // The amount being given back
                        client_name: clientName,
                        issued_by: window.localStorage.getItem('username') || 'Admin',
                        refund_mode: refundModeState,
                        item_ids: itemsToRefund.map(it => it.id)
                    };
                    await fetch(`${API_BASE_URL}/returns/issue-refund`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(refundPayload)
                    });
                }

                // Update Stock (Local)
                const localStock = JSON.parse(localStorage.getItem("detailedStock")) || {};
                cart.forEach(item => {
                    const group = Object.keys(STATIC_PRODUCT_DATA).find(g =>
                        Object.keys(STATIC_PRODUCT_DATA[g]).includes(item.category)
                    );
                    if (group) {
                        if (!localStock[group]) localStock[group] = {};
                        const key = `${item.name}_${item.color}_${item.size}`;
                        localStock[group][key] = (localStock[group][key] || 100) - item.qty;
                    }
                });
                localStorage.setItem("detailedStock", JSON.stringify(localStock));

                // Save to Backend
                const normInvoice = invoiceNo.replace(/\s+/g, '');
                const endpoint = isUpdateMode
                    ? `${API_BASE_URL}/billing/update/${normInvoice}`
                    : `${API_BASE_URL}/billing/save`;

                const method = isUpdateMode ? "PUT" : "POST";

                const res = await fetch(endpoint, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, invoice_no: normInvoice })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || errorData.message || "Failed to save");
                }
            }

            if (print) {
                // Exclude items being returned/refunded — only print what the customer carries out
                const printItems = isFromReturnFlow
                    ? cart.filter(item => !item.isOriginalBillItem)
                    : cart.filter(item => !item.isToRefund);

                const printTotal = isFromRefundIssuance ? subTotalWithTax : (isFromReturnFlow ? effectiveCartTotal : undefined);
                const billType = isFromRefundIssuance ? 'refund' : isFromCnFlow ? 'credit' : isFromReturnFlow ? 'replacement' : 'normal';

                let replacementPrintData = {};
                if (isFromReturnFlow) {
                    const returnedItems = cart.filter(i => i.isOriginalBillItem);
                    const exchangeItems = cart.filter(i => !i.isOriginalBillItem);
                    const originalItemsFull = originalBill?.items || [];
                    const returnedKeys = new Set(returnedItems.map(i => `${i.name}_${i.size}_${i.color}`));
                    const nonReplacedItems = originalItemsFull.filter(i => {
                        const key = `${i.item_name || i.name}_${i.size}_${i.color}`;
                        return !returnedKeys.has(key);
                    });

                    replacementPrintData = {
                        originalBillItems: originalItemsFull,
                        originalBillTotal: originalBill?.grand_total || 0,
                        returnedItems: returnedItems,
                        exchangeItems: exchangeItems,
                        nonReplacedItems: nonReplacedItems,
                        returnedTotal: totalAlreadyPaid,
                        exchangeTotal: effectiveCartTotal,
                    };
                }

                navigate("/print", {
                    state: {
                        clientName: clientName || "Cash Customer",
                        clientPhone: clientPhone || "0000000000",
                        invoiceNo,
                        date,
                        items: printItems,
                        paymentMode,
                        overrideTotal: printTotal,
                        billType,
                        ...replacementPrintData
                    }
                });

            } else {
                alert(isUpdateMode ? "Updated Successfully!" : "Saved Successfully!");
                // Reset
                setCart([]);
                setClientName("");
                setClientPhone("");
                setIsUpdateMode(false);
                setInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
            }
        } catch (e) {
            alert("Backend Error: " + e.message);
        }
    };

    /* ================= RENDER HELPERS ================= */

    const displayedCategories = useMemo(() => {
        if (!searchQuery) return [];
        const lower = searchQuery.toLowerCase();
        // Sort: categories starting with the query first
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
        // If searching, look across ALL categories
        if (searchQuery || selectedCategory === "All") {
            items = Object.entries(productsMap).flatMap(([cat, list]) =>
                list.map(name => ({ category: cat, name }))
            );
        } else if (selectedCategory) {
            items = (productsMap[selectedCategory] || []).map(name => ({ category: selectedCategory, name }));
        }

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(lower));
        }
        return items;
    }, [selectedCategory, productsMap, searchQuery]);


    return (
        <div className="billing-layout">
            <LowStockToast alerts={lowStockAlerts} onClose={() => { }} onDismissAll={() => setLowStockAlerts([])} />

            {/* === HEADER === */}
            <header className="billing-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
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
                        <span>Billing Terminal</span>
                    </div>
                </div>
                <div className="header-actions" style={{ justifyContent: 'flex-end' }}>
                    {(userRole === "admin" || userRole === "manager") && (
                        <button className="header-btn btn-dashboard" onClick={() => navigate('/admin-dashboard')}>Dashboard</button>
                    )}
                    <button className="header-btn btn-logout" onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
                </div>
            </header>

            {/* === LEFT: CATEGORIES === */}
            <aside className="category-sidebar">

                <div className="sidebar-section-header">
                    <span className="section-title">QUICK ACTIONS</span>
                </div>
                <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                        className="master-btn"
                        onClick={() => navigate('/sales-bill', { state: { from: 'billing' } })}
                    >
                        📊 Reports
                    </button>
                    <button
                        className="master-btn"
                        style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', color: '#fff' }}
                        onClick={() => navigate('/daily-collection')}
                    >
                        📈 Daily Report
                    </button>
                    <button
                        className="master-btn master-btn-return"
                        onClick={() => navigate('/return-replace')}
                    >
                        🔄 Refund / Return
                    </button>
                </div>

                <div className="sidebar-divider" />

                <div className="sidebar-section-header">
                    <span className="section-title">CATEGORIES</span>
                </div>
                <div className="categories-list" ref={categoryListRef}>
                    {(searchQuery ? displayedCategories : allCategories).map(cat => (
                        <button
                            key={cat}
                            className={`category-item ${selectedCategory === cat ? "active" : ""}`}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setTimeout(() => {
                                    const first = productGridRef.current?.querySelector('button.product-card');
                                    if (first) first.focus();
                                }, 80);
                            }}
                        >
                            <span className="cat-text">{cat}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* === CENTER: PRODUCTS === */}
            <section className="product-section">
                <div className="search-bar-container">
                    <div className="barcode-panel">
                        <BarcodeScannerInput onBarcodeScanned={handleBarcodeScanned} />
                    </div>
                    <div className="manual-search-panel">
                        <label className="search-label">🔍 Search Items Manually</label>
                        <input
                            className="search-input"
                            placeholder="Type product name to filter grid..."
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
                            <p>Choose a category from the sidebar or type below to start browsing</p>
                        </div>
                    </div>
                ) : (
                    <div className="product-grid" ref={productGridRef} onKeyDown={handleGridKeyDown}>
                        {displayedProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: 40, color: '#9ca3af' }}>
                                No items found
                            </div>
                        ) : (
                            displayedProducts.map((prod, i) => (
                                <button key={`prod-${i}`} className="product-card" onClick={() => handleProductClick(prod.category, prod.name)}>
                                    <div className="product-initial">{prod.name.charAt(0)}</div>
                                    <div className="product-name">{prod.name}</div>
                                    <div className="product-price">Select Size</div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </section>

            {/* === RIGHT: CART === */}
            <aside className="cart-section">
                <div className="customer-details">
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input
                            className="cart-input"
                            placeholder="Client Name"
                            value={clientName}
                            onChange={e => handleClientNameChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                            onFocus={() => {
                                if (clientName.trim()) {
                                    const list = Array.isArray(clientSuggestions) ? clientSuggestions : [];
                                    const matches = list.filter(c =>
                                        c && c.client_name && c.client_name.toLowerCase().includes(clientName.toLowerCase())
                                    );
                                    setFilteredClientSuggestions(matches);
                                    setShowClientSuggestions(matches.length > 0);
                                }
                            }}
                        />
                        {showClientSuggestions && (
                            <ul className="suggestions-list">
                                {filteredClientSuggestions.map((client, i) => (
                                    <li key={i} className="suggestion-item" onMouseDown={() => {
                                        setClientName(client.client_name);
                                        setClientPhone(client.phone || "");
                                        setShowClientSuggestions(false);
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px' }}>
                                            <strong>{client.client_name}</strong>
                                            <span style={{ color: '#64748b' }}>{client.phone}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="input-group">
                        <input className="cart-input" placeholder="Phone Number" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#666', alignItems: 'center' }}>
                        <span>Invoice: <strong>{invoiceNo}</strong></span>
                        <span>Date: <strong>{date}</strong></span>
                        {isUpdateMode && (
                            <span style={{
                                marginLeft: 'auto',
                                background: '#fee2e2',
                                color: '#ef4444',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                fontSize: '10px',
                                animation: 'pulse 2s infinite'
                            }}>
                                CREDIT NOTE BILL
                            </span>
                        )}
                        {isFromCnFlow && (
                            <span style={{
                                padding: '3px 10px', background: '#fee2e2', color: '#ef4444',
                                borderRadius: 6, fontSize: 9, fontWeight: 800, border: '1px solid #fecaca',
                                letterSpacing: '0.5px', animation: 'pulse 2s infinite'
                            }}>
                                CREDIT NOTE UPDATED BILL
                            </span>
                        )}
                        {isFromReturnFlow && (
                            <span style={{
                                padding: '3px 10px', background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', color: '#fff',
                                borderRadius: 6, fontSize: 10, fontWeight: 900, border: 'none',
                                letterSpacing: '0.8px', animation: 'pulse 2s infinite',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                textTransform: 'uppercase'
                            }}>
                                REPLACEMENT BILL
                            </span>
                        )}
                    </div>
                </div>

                <div className="cart-items-container">
                    {cart.map((item, idx) => {
                        const price = Number(item.price) || 0;
                        const gst = Number(item.gst) || 0;
                        const total = item.qty * (price + (price * gst / 100));

                        // Highlighting logic
                        const isSourceItem = !!item.isToRefund || (isFromReturnFlow && item.isOriginalBillItem) || (isFromCnFlow && !isFromRefundIssuance && item.isCredited);
                        const isRetainedItem = isFromReturnFlow && item.isRetainedItem;
                        const isExchangeTarget = (!!item.isCredited && !item.isOriginalBillItem && !isFromRefundIssuance) || (isFromReturnFlow && !item.isOriginalBillItem && !item.isRetainedItem);
                        const isSpecialType = isSourceItem || isExchangeTarget || isRetainedItem;

                        // Visual style per type
                        const borderColor = isExchangeTarget ? '#10b981' : isSourceItem ? '#ef4444' : isRetainedItem ? '#3b82f6' : 'transparent';
                        const bgColor = isExchangeTarget
                            ? 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)'
                            : isSourceItem
                                ? 'linear-gradient(90deg, #fef2f2 0%, #ffffff 100%)'
                                : isRetainedItem
                                    ? 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)'
                                    : undefined;

                        return (
                            <div key={idx} className="cart-item" style={{
                                borderLeft: `3px solid ${borderColor}`,
                                background: bgColor,
                                borderRadius: isSpecialType ? '0 8px 8px 0' : undefined,
                            }}>
                                <div className="item-info">
                                    <div className="item-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {item.name}
                                        {isExchangeTarget && (
                                            <span style={{
                                                fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                                                background: '#10b981',
                                                color: '#fff', borderRadius: '4px', letterSpacing: '0.5px'
                                            }}>EXCHANGE</span>
                                        )}
                                        {isRetainedItem && (
                                            <span style={{
                                                fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                                                background: '#3b82f6',
                                                color: '#fff', borderRadius: '4px', letterSpacing: '0.5px'
                                            }}>RETAINED</span>
                                        )}
                                        {isSourceItem && (
                                            <span style={{
                                                fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                                                background: '#ef4444', color: '#fff', borderRadius: '4px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {item.isToRefund ? 'TO REFUND' : (isFromReturnFlow ? 'RETURNED' : 'CREDITED')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="item-variant" style={{
                                        color: isExchangeTarget ? '#065f46' : isSourceItem ? '#991b1b' : isRetainedItem ? '#1e40af' : undefined
                                    }}>{item.size} • {item.color}</div>
                                    <div className="item-meta">₹{price} (+ {gst}% GST)</div>
                                </div>
                                <div className="item-controls">
                                    <div className="qty-control">
                                        <button className="qty-btn" onClick={() => {
                                            if (item.qty > 1) updateCartItem(idx, 'qty', item.qty - 1);
                                            else removeFromCart(idx);
                                        }}>-</button>
                                        <div className="qty-val">{item.qty}</div>
                                        <button className="qty-btn" onClick={() => updateCartItem(idx, 'qty', item.qty + 1)}>+</button>
                                    </div>
                                    <div className="item-total" style={{ color: isExchangeTarget ? '#2563eb' : isSourceItem ? '#dc2626' : undefined }}>₹{Math.round(total)}</div>
                                </div>
                            </div>
                        );
                    })}
                    {cart.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#cbd5e1' }}>
                            Cart is empty
                        </div>
                    )}
                </div>

                <div className="cart-footer">
                    <div className="bill-summary-row">
                        <span>Items</span>
                        <span>{cart.length}</span>
                    </div>

                    {(redeemedCnAmount > 0 || totalAlreadyPaid > 0) ? (
                        <>
                            {/* Current Bill Subtotal */}
                            <div className="bill-summary-row" style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                                <span>{isFromReturnFlow ? "Selected Exchange Items" : "Cart Subtotal"}</span>
                                <span>₹ {isFromReturnFlow ? effectiveCartTotal : subTotalWithTax}</span>
                            </div>

                            {/* Deductions: Already Paid + Credit Note */}
                            {totalAlreadyPaid > 0 && (
                                <div className="bill-summary-row" style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>
                                    <span>{isFromReturnFlow ? "↩️ Return Value (Selected)" : "💵 Original Bill Total"}</span>
                                    <span>- ₹ {totalAlreadyPaid}</span>
                                </div>
                            )}
                            {redeemedCnAmount > 0 && (
                                <div className="bill-summary-row" style={{ color: '#059669', fontWeight: 800, background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', margin: '8px 0', border: '1px dashed #bbf7d0', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                                    <span>🎟️ Credit Limit {redeemedCnNumber ? `(${redeemedCnNumber})` : ''}</span>
                                    <span>₹ {redeemedCnAmount}</span>
                                </div>
                            )}

                            {/* Net result calculation line */}
                            <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginBottom: '4px', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                                {isFromReturnFlow
                                    ? `Calculation: (Exch: ₹${effectiveCartTotal}) - (Ret: ₹${totalAlreadyPaid}) = (Net: ₹${cnNetAmount})`
                                    : `Calculation: (Current: ₹${subTotalWithTax}) - (Total Credits: ₹${Number(totalAlreadyPaid) + Number(redeemedCnAmount)})`
                                }
                            </div>

                            <div className="grand-total-row" style={{
                                borderTop: '2px solid #e2e8f0',
                                padding: '12px 0',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s'
                            }}>
                                {cnNetAmount > 0 ? (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Due</span>
                                            <span style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '22px' }}>Collect Cash</span>
                                        </div>
                                        <span style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '26px' }}>₹ {Math.abs(Math.round(cnNetAmount))}</span>
                                    </>
                                ) : cnNetAmount < 0 ? (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining</span>
                                            <span style={{ color: '#059669', fontWeight: 800, fontSize: '20px' }}>Balance Credit</span>
                                        </div>
                                        <span style={{ color: '#059669', fontWeight: 900, fontSize: '26px' }}>₹ {Math.abs(Math.round(cnNetAmount))}</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '20px' }}>✅ Fully Balanced</span>
                                        <span style={{ color: '#10b981', fontWeight: 900, fontSize: '26px' }}>₹ 0</span>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="grand-total-row">
                            <span>Grand Total</span>
                            <span>₹ {grandTotal}</span>
                        </div>
                    )}

                    <div className="footer-actions">
                        <button className="action-btn btn-primary" onClick={() => setShowPaymentPanel(true)}>
                            <span>₹</span> Pay & Check Out
                        </button>
                    </div>
                </div>
            </aside >

            {/* === VARIANT MODAL === */}
            {
                showVariantModal && selectedProductForVariant && (function () {
                    // Filter all variations from backend data for this specific product
                    // Need to ensure Billing state has the raw variants list
                    // (It's currently in productsMap but let's assume we have it in a separate state or just use global for now if refactoring is restricted)
                    // Actually Billing has 'allProducts' state? Let me check.
                    // Wait, Billing does NOT have an allProducts state yet, it just processes them into productsMap.
                    // Let's add allProducts state to Billing.

                    return (
                        <VariantSelectorModal
                            product={selectedProductForVariant}
                            allProductsData={allBackendProducts} // We will add this state
                            onConfirm={handleVariantConfirm}
                            onClose={() => setShowVariantModal(false)}
                        />
                    );
                })()
            }

            {/* === PAYMENT MODAL === */}
            {
                showPaymentPanel && (
                    <div className="payment-panel-overlay" onClick={() => setShowPaymentPanel(false)}>
                        <div className="payment-panel" onClick={e => e.stopPropagation()}>
                            <h2>Checkout</h2>

                            {(redeemedCnAmount > 0 || totalAlreadyPaid > 0) ? (
                                /* Return/Exchange/CN Flow: Show detailed breakdown */
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', margin: '16px 0' }}>
                                    {/* Row 1: New Cart Total */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Bill Total</span>
                                        <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>₹ {subTotalWithTax}</span>
                                    </div>
                                    {/* Row 2: Deductions (Already Paid + CN) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0', background: '#fff1f2', borderRadius: 6, paddingLeft: 8, paddingRight: 8, margin: '4px -8px' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {totalAlreadyPaid > 0 && redeemedCnAmount > 0 ? '🎫 Total Account Credit' : totalAlreadyPaid > 0 ? '💵 Amount Already Paid' : '🎫 Credit Note Amount'}
                                        </span>
                                        <span style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>- ₹ {Number(totalAlreadyPaid) + Number(redeemedCnAmount)}</span>
                                    </div>
                                    {/* Row 3: Result */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 0' }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: cnNetAmount >= 0 ? '#1e3a5f' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {cnNetAmount > 0 ? '💰 Collect Difference' : cnNetAmount < 0 ? '↩ Give to Customer' : '✅ Net Balanced'}
                                        </span>
                                        <span style={{ fontSize: 28, fontWeight: 900, color: cnNetAmount >= 0 ? '#1e3a5f' : '#dc2626' }}>
                                            ₹ {Math.abs(Math.round(cnNetAmount))}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="payment-amount-display">
                                        <div className="pay-label">Subtotal (incl. GST)</div>
                                        <div className="pay-amount">₹ {subTotalWithTax}</div>
                                    </div>

                                    <div className="payment-amount-display" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '10px' }}>
                                        <div className="pay-label">To be Paid</div>
                                        <div className="pay-amount" style={{ color: '#1e3a5f' }}>₹ {grandTotal}</div>
                                    </div>
                                </>
                            )}

                            <div className="payment-form">
                                <div>
                                    <label className="variant-label">Payment Mode</label>
                                    <div className="variant-options">
                                        {['Cash', 'Online', 'Card'].map(m => (
                                            <div
                                                key={m}
                                                className={`variant-chip ${paymentMode === m ? 'selected' : ''}`}
                                                onClick={() => setPaymentMode(m)}
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="variant-label">Tendered Amount</label>
                                    <input
                                        className="search-input"
                                        type="number"
                                        autoFocus
                                        value={paidAmount || ''}
                                        onChange={e => setPaidAmount(e.target.value)}
                                        placeholder="Enter amount received"
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                                    <div>
                                        <div className="pay-label" style={{ color: '#dc2626' }}>Balance</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>₹ {balance}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="pay-label" style={{ color: '#16a34a' }}>Change</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹ {changeReturn}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-footer-actions">
                                <button
                                    className="action-btn btn-success"
                                    onClick={() => { setShowPaymentPanel(false); handleSave(true); }}
                                >
                                    Save & Print
                                </button>
                                <button
                                    className="action-btn btn-primary"
                                    onClick={() => { setShowPaymentPanel(false); handleSave(false); }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* === DAILY SUMMARY MODAL === */}
            {showDailySummary && (
                <DailySummaryModal
                    onClose={() => setShowDailySummary(false)}
                />
            )}
        </div >
    );
}

// Sub-component for clarity
function VariantSelectorModal({ product, allProductsData, onConfirm, onClose }) {
    const [size, setSize] = useState("");
    const [color, setColor] = useState("");
    const modalRef = useRef(null);

    // Filter available sizes and colors for THIS specific product
    const relevantVariants = allProductsData.filter(p =>
        p.category === product.category && p.item === product.name
    );

    const availableSizes = Array.from(new Set(relevantVariants.map(v => v.size))).sort();
    const availableColors = Array.from(new Set(relevantVariants.map(v => v.color))).sort();

    // Auto-focus first focusable element when modal opens
    useEffect(() => {
        const timer = setTimeout(() => {
            const first = modalRef.current?.querySelector('button:not([disabled])');
            if (first) first.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Focus trap: keep Tab inside the modal; Escape closes
    const handleModalKeyDown = (e) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key !== 'Tab') return;

        const focusable = Array.from(
            modalRef.current?.querySelectorAll('button:not([disabled])') || []
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                onKeyDown={handleModalKeyDown}
            >
                <div className="modal-header">
                    <div className="modal-title">{product.name}</div>
                    <button className="close-modal-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="variant-group">
                    <label className="variant-label">Select Size</label>
                    <div className="variant-options">
                        {availableSizes.length > 0 ? availableSizes.map(s => (
                            <button
                                key={s}
                                className={`variant-chip ${size === s ? 'selected' : ''}`}
                                onClick={() => setSize(s)}
                            >
                                {s}
                            </button>
                        )) : <div style={{ fontSize: 12, color: '#94a3b8' }}>No sizes found for this item</div>}
                    </div>
                </div>

                <div className="variant-group">
                    <label className="variant-label">Select Color</label>
                    <div className="variant-options">
                        {availableColors.length > 0 ? availableColors.map(c => (
                            <button
                                key={c}
                                className={`variant-chip ${color === c ? 'selected' : ''}`}
                                onClick={() => setColor(c)}
                            >
                                {c}
                            </button>
                        )) : <div style={{ fontSize: 12, color: '#94a3b8' }}>No colors found for this item</div>}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="action-btn btn-secondary" onClick={onClose} style={{ padding: '8px 20px' }}>Cancel</button>
                    <button
                        className="action-btn btn-primary"
                        disabled={!size || !color}
                        style={{ opacity: (!size || !color) ? 0.5 : 1, padding: '8px 20px' }}
                        onClick={() => onConfirm(size, color)}
                    >
                        Add to Bill
                    </button>
                </div>
            </div>
        </div>
    );
}

function DailySummaryModal({ onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            fetch(`${API_BASE_URL}/billing/daily-summary`)
                .then(r => r.json())
                .then(d => setData(d))
                .finally(() => setLoading(false));
        };
        load();
    }, []);

    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', padding: '60px' }}>
                <div className="rr-loading-spinner" />
                <p style={{ marginTop: 20, color: '#64748b', fontWeight: 600 }}>Calculating Daily Collection...</p>
            </div>
        </div>
    );

    const totalInvoices = data?.salesSplits?.reduce((sum, s) => sum + s.invoice_count, 0) || 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content ds-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550, padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #1e3a5f 0%, #163754 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>Daily Collection</h2>
                            <p style={{ margin: 0, fontSize: 13, opacity: 0.8, fontWeight: 500 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', width: 40, height: 40, borderRadius: '50%' }}>&times;</button>
                    </div>
                </div>

                <div style={{ padding: '32px' }}>
                    {/* Top Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                        <div className="ds-card">
                            <span className="ds-card-label">Total Collection</span>
                            <span className="ds-card-val">₹{Math.round(data?.totalSalesAmount || 0)}</span>
                        </div>
                        <div className="ds-card">
                            <span className="ds-card-label">Total Invoices</span>
                            <span className="ds-card-val">{totalInvoices}</span>
                        </div>
                    </div>

                    {/* Breakdown Sections */}
                    <div className="ds-section">
                        <h4 className="ds-section-title">💰 PAYMENT BREAKDOWN</h4>
                        {data?.salesSplits?.map((s, i) => (
                            <div key={i} className="ds-row">
                                <span className="ds-row-l">{s.payment_mode} ({s.invoice_count} Bills)</span>
                                <span className="ds-row-v">₹{Math.round(s.total_amount)}</span>
                            </div>
                        ))}
                        {(!data?.salesSplits || data.salesSplits.length === 0) && <p style={{ fontSize: 12, color: '#94a3b8' }}>No sales recorded today.</p>}
                    </div>

                    <div className="ds-section">
                        <h4 className="ds-section-title">🔄 RETURNS & ADJUSTS</h4>
                        <div className="ds-row ds-row-neg">
                            <span className="ds-row-l">Total Cash Refunds (Paid back)</span>
                            <span className="ds-row-v">- ₹{Math.round(data?.totalRefunds || 0)}</span>
                        </div>
                        <div className="ds-row">
                            <span className="ds-row-l">Credit Notes Issued</span>
                            <span className="ds-row-v">₹{Math.round(data?.totalCreditNotes || 0)}</span>
                        </div>
                        <div className="ds-row" style={{ borderBottom: 'none' }}>
                            <span className="ds-row-l">Items Replaced (Exchange)</span>
                            <span className="ds-row-v">{data?.replacementsCount || 0} Cases</span>
                        </div>
                    </div>

                    {/* Final Net Calculation */}
                    <div style={{ marginTop: 24, padding: '20px', background: '#f8fafc', borderRadius: 16, border: '1.5px solid #edf2f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>NET CASH ON HAND</span>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#1e3a5f' }}>
                                ₹{Math.round((data?.salesSplits?.find(s => s.payment_mode === 'Cash')?.total_amount || 0) - (data?.cashRefunds || 0))}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                            (Cash Sales ₹{Math.round(data?.salesSplits?.find(s => s.payment_mode === 'Cash')?.total_amount || 0)}) - (Cash Refunds ₹{Math.round(data?.cashRefunds || 0)})
                        </p>
                    </div>
                </div>

                <div style={{ padding: '16px 32px', background: '#f1f5f9', textAlign: 'center' }}>
                    <button className="ds-close-btn" onClick={onClose}>Close Summary</button>
                </div>
            </div>
        </div>
    );
}

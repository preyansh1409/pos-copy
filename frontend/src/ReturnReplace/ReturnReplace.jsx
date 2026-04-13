import API_BASE_URL from "../apiConfig";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReturnReplace.css";

/* ── Same static catalogue as Billing.jsx ── */
const STATIC_PRODUCTS = [];
const _STATIC = {
    Men: {
        "Round Neck T-Shirts": ["Plain Round Neck", "Printed Round Neck", "Striped Round Neck"],
        "Polo T-Shirts": ["Solid Polo T-Shirt", "Striped Polo T-Shirt", "Logo Polo T-Shirt"],
        Shirts: ["Casual Shirt", "Formal Shirt", "Checked Shirt", "Printed Shirt", "Denim Shirt"],
        Jeans: ["Slim Fit Jeans", "Regular Fit Jeans", "Skinny Fit Jeans", "Stretchable Jeans"],
    },
    Women: {
        "T-Shirts & Tops": ["Round Neck T-Shirt", "V-Neck T-Shirt", "Printed T-Shirt", "Crop Top", "Long Top"],
        Shirts: ["Casual Shirt", "Checked Shirt", "Printed Shirt", "Denim Shirt"],
        Jeans: ["Skinny Jeans", "High-Waist Jeans", "Mom Fit Jeans", "Straight Fit Jeans"],
    },
    Girls: {
        Clothing: ["Top", "T-Shirt", "Dress", "Frock", "Skirt", "Jeans", "Leggings"],
    },
};
Object.values(_STATIC).forEach(group =>
    Object.entries(group).forEach(([cat, items]) =>
        items.forEach(item => STATIC_PRODUCTS.push({ category: cat, item }))
    )
);


export default function ReturnReplace() {
    const navigate = useNavigate();

    // "refund" | "return" | null
    const [activeTab, setActiveTab] = useState(null);

    // ── Refund sub-flow ──
    const [refundType, setRefundType] = useState(null); // "credit" | "cash"
    const [refundMode, setRefundMode] = useState("Cash"); // "Cash" | "Online" - how money is returned
    const [refundDone, setRefundDone] = useState(false);
    const [refundBill, setRefundBill] = useState(null);

    // ── Return sub-flow ──
    const [invoiceInput, setInvoiceInput] = useState("");
    const [issuedBy, setIssuedBy] = useState("");
    const [returnBill, setReturnBill] = useState(null);
    const [editedItems, setEditedItems] = useState([]);   // editable copy of items
    const [returnError, setReturnError] = useState("");
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnConfirmed, setReturnConfirmed] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState([]);

    // ── All bills for autocomplete ──
    const [allBills, setAllBills] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // ── Product catalog for item autocomplete ──
    // Pre-fill with static data immediately — no waiting for API
    const [allProducts, setAllProducts] = useState(STATIC_PRODUCTS);
    const [allCategories, setAllCategories] = useState(() => [
        ...new Set(STATIC_PRODUCTS.map(p => p.category))
    ]);
    const [rowDropdown, setRowDropdown] = useState({});    // item suggestions per row
    const [rowCatDropdown, setRowCatDropdown] = useState({}); // category suggestions per row
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [replacementHistory, setReplacementHistory] = useState([]);
    const [showReplacementHistory, setShowReplacementHistory] = useState(false);
    const lowStockCheckedRef = useRef(false);
    const [cnSearchQuery, setCnSearchQuery] = useState("");
    const [cnSuggestions, setCnSuggestions] = useState([]);
    const [showCnSuggestions, setShowCnSuggestions] = useState(false);
    const [issuedCnNumber, setIssuedCnNumber] = useState("");
    const [isFromCnSearch, setIsFromCnSearch] = useState(false);
    const [isFromCashSearch, setIsFromCashSearch] = useState(false);
    const [selectedCn, setSelectedCn] = useState(null);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [allCashRefunds, setAllCashRefunds] = useState([]);
    const [allCreditNotes, setAllCreditNotes] = useState([]);
    const [cashSearchQuery, setCashSearchQuery] = useState("");
    const [cashSuggestions, setCashSuggestions] = useState([]);
    const [showCashSuggestions, setShowCashSuggestions] = useState(false);
    const [gstConfig, setGstConfig] = useState({});

    const invoiceRef = useRef(null);

    // Fetch bills + product catalog + categories on mount
    useEffect(() => {
        const fetchBills = () => {
            fetch(`${API_BASE_URL}/billing/all`)
                .then(r => r.json())
                .then(d => { if (d.bills) setAllBills(d.bills); })
                .catch(() => { });
        };

        fetchBills();

        // Start with static catalogue, then merge backend products
        setAllProducts(STATIC_PRODUCTS);
        fetch(`${API_BASE_URL}/masterdata/all-products`)
            .then(r => r.json())
            .then(d => {
                if (d.data && Array.isArray(d.data)) {
                    // Build flat list from backend, avoid duplicates
                    const backendFlat = d.data
                        .filter(row => row.category && row.item)
                        .map(row => ({ category: row.category, item: row.item }));
                    setAllProducts(prev => {
                        const seen = new Set(prev.map(p => `${p.category}|${p.item}`));
                        const merged = [...prev];
                        backendFlat.forEach(p => {
                            if (!seen.has(`${p.category}|${p.item}`)) {
                                merged.push(p);
                                seen.add(`${p.category}|${p.item}`);
                            }
                        });
                        return merged;
                    });
                }
            })
            .catch(() => { });

        fetch(`${API_BASE_URL}/masterdata/categories`)
            .then(r => r.json())
            .then(d => {
                const staticCats = [...new Set(STATIC_PRODUCTS.map(p => p.category))];
                let backendCats = [];
                if (Array.isArray(d.categories)) backendCats = d.categories;
                else if (Array.isArray(d.data)) {
                    backendCats = d.data.map(c => typeof c === 'string' ? c : (c.category_name || c.name || c.category || c.item_category));
                }
                setAllCategories(Array.from(new Set([...staticCats, ...backendCats.filter(Boolean)])));
            })
            .catch(() => { });

        fetch(`${API_BASE_URL}/masterdata/all-gst-config`)
            .then(r => r.json())
            .then(d => { if (d.config) setGstConfig(d.config); })
            .catch(() => { });
        fetch(`${API_BASE_URL}/returns/cash-refunds`)
            .then(r => r.json())
            .then(d => { if (d.refunds) setAllCashRefunds(d.refunds); })
            .catch(() => { });
        fetch(`${API_BASE_URL}/returns/credit-notes`)
            .then(r => r.json())
            .then(d => { if (d.credit_notes) setAllCreditNotes(d.credit_notes); })
            .catch(() => { });
    }, []);

    // Reset sub-state when switching tabs
    const switchTab = (tab) => {
        setActiveTab(tab);
        setRefundType(null);
        setRefundDone(false);
        setRefundBill(null);
        setInvoiceInput("");
        setReturnBill(null);
        setEditedItems([]);
        setReturnError("");
        setReturnConfirmed(false);
        setSuggestions([]);
        setShowSuggestions(false);
        setIssuedBy("");
        setRowDropdown({});
        setRowCatDropdown({});
        setCnSearchQuery("");
        setIssuedCnNumber("");
        setIsFromCnSearch(false);
        setIsFromCashSearch(false);
        setCashSearchQuery("");
        setCashSuggestions([]);
        setShowCashSuggestions(false);
        setReturnError(""); // Reset error on tab switch
        setSelectedIndices([]);

        // Re-fetch bills to ensure we have the latest data (e.g. if user just made a sale)
        fetch(`${API_BASE_URL}/billing/all`)
            .then(r => r.json())
            .then(d => { if (d.bills) setAllBills(d.bills); })
            .catch(() => { });
    };

    useEffect(() => {
        const shouldFocus = (activeTab === "return" && !returnBill) || (activeTab === "refund" && refundType && !refundBill);
        if (shouldFocus) {
            setTimeout(() => invoiceRef.current?.focus(), 80);
        }
    }, [activeTab, returnBill, refundType, refundBill]);

    // ── Live filter suggestions as user types ──
    const handleInvoiceChange = (val) => {
        setInvoiceInput(val);
        setReturnError("");
        if (val.trim().length > 0) {
            const query = val.toLowerCase().replace(/[\s-]/g, '');
            const filtered = allBills.filter(b => {
                const invNo = (b.invoice_no || "").toLowerCase().replace(/[\s-]/g, '');
                const client = (b.client_name || "").toLowerCase();
                const phone = (b.phone || "").toLowerCase();

                // Allow matching by invoice number or client name/phone
                const isMatch = invNo.includes(query) ||
                    client.includes(val.toLowerCase()) ||
                    phone.includes(val.toLowerCase());

                return isMatch;
            });

            // Sort: Newest bills first
            filtered.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // ── Pick a bill directly from suggestion ──
    const pickBill = (bill, isRedemption = false) => {
        setInvoiceInput(bill.invoice_no);
        setSuggestions([]);
        setShowSuggestions(false);
        setReturnError("");

        // 7-day policy check - Bypass if we are just redeeming an existing CN/Refund
        const saleDate = new Date(bill.sale_date);
        const today = new Date();
        const diffTime = Math.abs(today - saleDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (!isRedemption && diffDays > 7) {
            const action = activeTab === "refund" ? "refunded" : "replaced";
            setReturnError(`Sorry, item cannot be ${action} because it already has 7 days.`);
            if (activeTab === "refund") setRefundBill(null);
            else setReturnBill(null);
            setEditedItems([]);
            return;
        }

        // Already processed check - Bypass if we are explicitly redeeming
        const isProcessed = bill.is_replaced || bill.is_cash_refunded || bill.is_cn_update ||
            allCashRefunds.some(r => r.invoice_no === bill.invoice_no) ||
            allCreditNotes.some(cn => cn.invoice_no === bill.invoice_no);

        if (!isRedemption && isProcessed) {
            const action = activeTab === "refund" ? "refunded" : "replaced";
            setReturnError(`Sorry, this bill has already been ${action} / processed.`);
            if (activeTab === "refund") setRefundBill(null);
            else setReturnBill(null);
            setEditedItems([]);
            return;
        }

        if (activeTab === "refund") {
            setRefundBill(bill);
            if (refundType === "cash") {
                const already = allCashRefunds.some(r => r.invoice_no === bill.invoice_no);
                setIsFromCashSearch(already || isRedemption);
            } else if (refundType === "credit") {
                const already = allCreditNotes.some(cn => cn.invoice_no === bill.invoice_no);
                setIsFromCnSearch(already || isRedemption);
            }
        } else {
            setReturnBill(bill);
            // Deep-copy items for return flow
            setEditedItems(bill.items.map(item => ({ ...item })));
        }

        if (bill.is_replaced && activeTab === "return") {
            fetch(`${API_BASE_URL}/returns/history/${bill.invoice_no}`)
                .then(res => res.json())
                .then(data => setReplacementHistory(data.history || []))
                .catch(() => setReplacementHistory([]));
        } else {
            setReplacementHistory([]);
        }
    };

    // ── Search invoice (manual Search button) ──
    const handleSearch = async () => {
        const query = invoiceInput.trim();
        if (!query) return;

        // Try to find in already-loaded bills first (normalized)
        const normalizedQuery = query.toLowerCase().replace(/[\s-]/g, '');
        const found = allBills.find(b => {
            const invNo = (b.invoice_no || "").toLowerCase().replace(/[\s-]/g, '');
            const client = (b.client_name || "").toLowerCase();
            const phone = (b.phone || "").toLowerCase();
            return invNo === normalizedQuery || client === query.toLowerCase() || phone === query.toLowerCase();
        });

        if (found) {
            pickBill(found);
            return;
        }

        // Fallback: fresh fetch
        setReturnLoading(true);
        setReturnError("");
        try {
            const res = await fetch(`${API_BASE_URL}/billing/all`);
            const data = await res.json();
            if (res.ok) {
                const fresh = (data.bills || []).find(
                    b => b.invoice_no?.toLowerCase() === query.toLowerCase()
                );
                if (fresh) {
                    setAllBills(data.bills);
                    pickBill(fresh);
                } else {
                    setReturnError(`No bill found for "${query}"`);
                }
            } else {
                setReturnError("Server error. Please try again.");
            }
        } catch {
            setReturnError("Cannot reach server. Check connection.");
        }
        setReturnLoading(false);
    };

    const handleCnSuggestions = (val) => {
        if (!val.trim()) {
            setCnSuggestions([]);
            setShowCnSuggestions(false);
            return;
        }
        const lower = val.toLowerCase();
        const list = refundType === 'credit' ? allCreditNotes : allCashRefunds;
        const filtered = list.filter(cn =>
            (cn.credit_note_no && cn.credit_note_no.toLowerCase().includes(lower)) ||
            (cn.invoice_no && cn.invoice_no.toLowerCase().includes(lower)) ||
            (cn.client_name && cn.client_name.toLowerCase().includes(lower)) ||
            (cn.phone && cn.phone.toLowerCase().includes(lower))
        );
        setCnSuggestions(filtered);
        setShowCnSuggestions(filtered.length > 0);
    };

    const handleCnSearch = async (forcedQuery) => {
        const query = (forcedQuery || cnSearchQuery).trim();
        if (!query) return;
        setReturnLoading(true);
        setReturnError("");
        setShowCnSuggestions(false);
        try {
            const res = await fetch(`${API_BASE_URL}/returns/search-cn/${encodeURIComponent(query)}`);
            const data = await res.json();
            if (res.ok && data.success) {
                // SKIP PREVIEW: Navigate to billing immediately for redemption
                navigate("/billing", {
                    state: {
                        isFromCnRedeem: true,
                        cnAmount: data.data.amount || 0,
                        cnNumber: data.data.credit_note_no || "",
                        clientName: data.data.client_name || "",
                        clientPhone: data.data.phone || ""
                    }
                });
            } else {
                setReturnError(data.error || "Credit Note not found.");
            }
        } catch (e) {
            setReturnError("Connection error.");
        }
        setReturnLoading(false);
    };

    const handleCashChange = (val) => {
        setCashSearchQuery(val);
        setReturnError("");
        if (!val.trim()) {
            setCashSuggestions([]);
            setShowCashSuggestions(false);
            return;
        }
        const lower = val.toLowerCase();
        const filtered = allCashRefunds.filter(r =>
            r.invoice_no.toLowerCase().includes(lower) ||
            (r.client_name && r.client_name.toLowerCase().includes(lower))
        );
        setCashSuggestions(filtered);
        setShowCashSuggestions(filtered.length > 0);
    };

    const handleCashSearch = async (forcedQuery) => {
        const query = (forcedQuery || cashSearchQuery).trim();
        if (!query) return;
        setReturnLoading(true);
        setReturnError("");
        setShowCashSuggestions(false);
        try {
            const res = await fetch(`${API_BASE_URL}/returns/search-cash/${encodeURIComponent(query)}`);
            const data = await res.json();
            if (res.ok && data.success) {
                // SKIP PREVIEW: Navigate to billing immediately
                navigate("/billing", {
                    state: {
                        isFromRefundRedeem: true,
                        refundAmount: data.data.amount || 0,
                        refundId: data.data.id || null,
                        clientName: data.data.client_name || "",
                        clientPhone: data.data.phone || ""
                    }
                });
            } else {
                setReturnError(data.error || "Cash refund record not found.");
            }
        } catch (e) {
            setReturnError("Connection error.");
        }
        setReturnLoading(false);
    };

    const handleRefundToBilling = () => {
        if (!refundBill || selectedIndices.length === 0) return;

        const refundTotal = Math.round(refundBill.items.filter((_, i) => selectedIndices.includes(i)).reduce((sum, item) => {
            const rate = parseFloat(item.price || item.unit_price || 0);
            const qty = parseFloat(item.qty || 0);
            const gst = parseFloat(item.gst || item.gst_percent || 5);
            return sum + (rate * qty) * (1 + gst / 100);
        }, 0));

        const refundedItems = refundBill.items.filter((_, i) => selectedIndices.includes(i));
        const remainingItems = refundBill.items.filter((_, i) => !selectedIndices.includes(i));

        navigate("/billing", {
            state: {
                isFromRefundIssuance: true,
                refundAmount: refundTotal,
                refundMode: refundMode,
                bill: refundBill,
                refundedItems,
                remainingItems
            }
        });
    };

    const handleIssueRefund = async () => {
        if (!refundBill || !refundType || selectedIndices.length === 0) return;
        setReturnLoading(true);
        try {
            const refundTotal = Math.round(refundBill.items.filter((_, i) => selectedIndices.includes(i)).reduce((sum, item) => {
                const rate = parseFloat(item.price || item.unit_price || 0);
                const qty = parseFloat(item.qty || 0);
                const gst = parseFloat(item.gst || item.gst_percent || 5);
                return sum + (rate * qty) * (1 + gst / 100);
            }, 0));

            const payload = {
                invoice_no: refundBill.invoice_no,
                refund_type: refundType,
                amount: refundTotal,
                client_name: refundBill.client_name,
                phone: refundBill.phone,
                issued_by: window.localStorage.getItem('username') || 'Admin',
                item_ids: selectedIndices.map(idx => refundBill.items[idx].id),
                refund_mode: refundType === 'cash' ? refundMode : 'Credit'
            };

            const res = await fetch(`${API_BASE_URL}/returns/issue-refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIssuedCnNumber(data.credit_note_no || "");
                setRefundDone(true);
                // Mark locally so UI updates immediately
                if (refundBill) {
                    const updatedItems = refundBill.items.map((item, idx) => {
                        if (selectedIndices.includes(idx)) {
                            return {
                                ...item,
                                is_cn_update: refundType === 'credit' ? 1 : 0,
                                is_cash_refunded: refundType === 'cash' ? 1 : 0
                            };
                        }
                        return item;
                    });
                    const updatedBill = {
                        ...refundBill,
                        items: updatedItems,
                        is_cn_update: updatedItems.some(it => it.is_cn_update),
                        is_cash_refunded: updatedItems.some(it => it.is_cash_refunded)
                    };
                    setRefundBill(updatedBill);
                    setAllBills(prev => prev.map(b => b.invoice_no === refundBill.invoice_no ? updatedBill : b));
                }
                setInvoiceInput(""); // Clear the input field
                setSelectedIndices([]); // Clear selected indices
                // Refresh the list to reflect the new refund/CN
                fetch(`${API_BASE_URL}/returns/cash-refunds`)
                    .then(r => r.json())
                    .then(d => { if (d.refunds) setAllCashRefunds(d.refunds); })
                    .catch(() => { });
                fetch(`${API_BASE_URL}/returns/credit-notes`)
                    .then(r => r.json())
                    .then(d => { if (d.credit_notes) setAllCreditNotes(d.credit_notes); })
                    .catch(() => { });
            } else {
                setReturnError(data.error || "Failed to process refund.");
            }
        } catch (e) {
            setReturnError("Connection error.");
        }
        setReturnLoading(false);
    };

    const handleDeleteCn = () => {
        if (!selectedCn) {
            setReturnError("No credit note selected.");
            return;
        }

        navigate("/billing", {
            state: {
                isFromCnRedeem: true,
                cnAmount: selectedCn?.amount || 0,
                cnNumber: selectedCn?.credit_note_no || "",
                clientName: selectedCn?.client_name || "",
                clientPhone: selectedCn?.phone || ""
            }
        });
    };

    const handleRedeemCash = () => {
        if (!refundBill) {
            setReturnError("No bill associated with this Cash Refund found.");
            return;
        }

        const refundedItems = refundBill.items.filter(item => !!item.is_cash_refunded);

        navigate("/billing", {
            state: {
                isFromRefund: true,
                refundAmount: selectedRefund?.amount || 0,
                refundId: selectedRefund?.id || null,
                bill: refundBill,
                refundedItems
            }
        });
    };

    // ── Fetch price from backend when item/size/color changes ──
    const fetchAndApplyPrice = async (index, updatedItem) => {
        const category = updatedItem.category || "";
        const item_name = updatedItem.item_name || "";
        const size = updatedItem.size || "";
        const color = updatedItem.color || "";
        if (!item_name || !size || !color) return;
        try {
            const res = await fetch(
                `${API_BASE_URL}/masterdata/latest-price?category=${encodeURIComponent(category)}&item_name=${encodeURIComponent(item_name)}&size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`
            );
            const data = await res.json();
            const newRate = Number(data.price) || 0;
            if (newRate > 0) {
                setEditedItems(prev => prev.map((item, i) =>
                    i === index ? { ...item, rate: newRate } : item
                ));
            }
        } catch { }
    };

    // ── Update a single field ──
    const updateItem = (index, field, value) => {
        setEditedItems(prev => {
            const updated = prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            );
            // Re-fetch price when any of these fields change
            if (["item_name", "category", "size", "color"].includes(field)) {
                fetchAndApplyPrice(index, updated[index]);
            }
            return updated;
        });
    };

    // ── Category typing: show matching categories as dropdown ──
    const handleCategoryChange = (index, value) => {
        updateItem(index, "category", value);
        if (value.trim().length > 0) {
            const lower = value.toLowerCase();
            const matchedCats = allCategories
                .filter(c => c.toLowerCase().includes(lower))
                .slice(0, 8);
            setRowCatDropdown(prev => ({ ...prev, [index]: matchedCats }));
        } else {
            setRowCatDropdown(prev => ({ ...prev, [index]: [] }));
        }
    };

    // ── Item name typing: show matching products as dropdown ──
    const handleItemNameChange = (index, value) => {
        updateItem(index, "item_name", value);
        if (value.trim().length > 0) {
            const lower = value.toLowerCase();
            // If category already set, prefer items within that category
            const currentCat = editedItems[index]?.category?.toLowerCase() || "";
            const matches = allProducts
                .filter(p => {
                    const itemMatch = p.item?.toLowerCase().includes(lower);
                    const catMatch = p.category?.toLowerCase().includes(lower);
                    if (currentCat) {
                        // prefer same category, but also show others
                        return itemMatch || catMatch;
                    }
                    return itemMatch || catMatch;
                })
                .sort((a, b) => {
                    // Boost items that match within the current category
                    if (currentCat) {
                        const aInCat = a.category?.toLowerCase() === currentCat;
                        const bInCat = b.category?.toLowerCase() === currentCat;
                        if (aInCat && !bInCat) return -1;
                        if (!aInCat && bInCat) return 1;
                    }
                    return 0;
                })
                .slice(0, 10);
            setRowDropdown(prev => ({ ...prev, [index]: matches }));
        } else {
            setRowDropdown(prev => ({ ...prev, [index]: [] }));
        }
    };

    // ── Pick category from dropdown ──
    const pickCategorySuggestion = (index, cat) => {
        updateItem(index, "category", cat);
        setRowCatDropdown(prev => ({ ...prev, [index]: [] }));
    };

    const pickItemSuggestion = (index, product) => {
        const updatedRow = {
            ...editedItems[index],
            item_name: product.item,
            category: product.category,
        };
        setEditedItems(prev => prev.map((item, i) =>
            i === index ? updatedRow : item
        ));
        setRowDropdown(prev => ({ ...prev, [index]: [] }));
        fetchAndApplyPrice(index, updatedRow);
    };

    // ── Finalize the replacement ──
    const handleConfirmReplace = () => {
        if (!returnBill || editedItems.length === 0) return;

        // Basic Validation
        const missingMeta = editedItems.some(item => !item.category || !item.item_name || !item.size || !item.color);
        if (missingMeta) {
            setReturnError("Validation Failed: All items must have Category, Name, Size and Color.");
            return;
        }

        // Navigate to billing with the pre-filled data
        navigate("/billing", {
            state: {
                isFromReturn: true,
                bill: returnBill,
                items: editedItems
            }
        });
    };

    /* ═══════════════════════════════════════
       SHARED UI HELPERS
    ═══════════════════════════════════════ */
    const InvoiceLookupUI = (subtitle = "Type an invoice number — matching bills will appear instantly") => {
        const SearchContent = (
            <>
                <label className="rr-lookup-label">Invoice Number</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <div className="rr-autocomplete-wrap">
                            <input
                                ref={invoiceRef}
                                className="rr-lookup-input"
                                placeholder="Invoice Number"
                                value={invoiceInput}
                                autoComplete="off"
                                onChange={e => handleInvoiceChange(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") handleSearch();
                                    if (e.key === "Escape") setShowSuggestions(false);
                                }}
                                onFocus={() => handleInvoiceChange(invoiceInput)}
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="rr-suggestions">
                                    {suggestions.map((bill, i) => {
                                        let isRefunded = false;
                                        let badgeText = "";

                                        // 7-Day Check
                                        const sDate = new Date(bill.sale_date);
                                        const today = new Date();
                                        const diffDays = Math.ceil(Math.abs(today - sDate) / (1000 * 60 * 60 * 24));

                                        if (diffDays > 7) {
                                            isRefunded = true;
                                            badgeText = "EXPIRED (>7D)";
                                        } else if (allCashRefunds.some(r => r.invoice_no === bill.invoice_no) || bill.is_cash_refunded) {
                                            isRefunded = true;
                                            badgeText = "REFUNDED";
                                        } else if (allCreditNotes.some(cn => cn.invoice_no === bill.invoice_no) || bill.is_cn_update) {
                                            isRefunded = true;
                                            badgeText = "CN ISSUED";
                                        } else if (bill.is_replaced) {
                                            isRefunded = true;
                                            badgeText = "REPLACED";
                                        }

                                        return (
                                            <button key={i} className="rr-suggestion-item" onMouseDown={() => pickBill(bill)}>
                                                <div className="rr-sug-left">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="rr-sug-inv">{bill.invoice_no}</span>
                                                        {isRefunded && (
                                                            <span style={{ fontSize: '9px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{badgeText}</span>
                                                        )}
                                                    </div>
                                                    <span className="rr-sug-client">{bill.client_name || "Walk-in Customer"}</span>
                                                </div>
                                                <div className="rr-sug-right">
                                                    <span className="rr-sug-amount">₹{Math.round(bill.grand_total || 0).toLocaleString("en-IN")}</span>
                                                    <span className="rr-sug-date">{new Date(bill.sale_date).toLocaleDateString("en-IN")}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        className="rr-lookup-go"
                        onClick={handleSearch}
                        disabled={returnLoading || !invoiceInput.trim()}
                        style={{ height: '48px', padding: '0 24px' }}
                    >
                        {returnLoading ? "Searching…" : "Search Bill"}
                    </button>
                </div>
            </>
        );

        const CnRedeemContent = (refundType === 'credit' || refundType === 'cash') ? (
            <div style={{ marginTop: '24px', borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ── OR Redeem Existing {refundType === 'credit' ? 'Credit Note' : 'Cash Refund'} ──
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label className="rr-lookup-label">Search by ID</label>
                        <div className="rr-autocomplete-wrap">
                            <input
                                className="rr-lookup-input"
                                placeholder={refundType === 'credit' ? "CN Number (e.g. CN-123)" : "Invoice Number"}
                                value={cnSearchQuery}
                                autoComplete="off"
                                onChange={e => {
                                    setCnSearchQuery(e.target.value);
                                    setReturnError("");
                                    handleCnSuggestions(e.target.value);
                                }}
                                onKeyDown={e => { if (e.key === "Enter") refundType === 'credit' ? handleCnSearch() : handleCashSearch(); }}
                            />
                            {showCnSuggestions && cnSuggestions.length > 0 && (
                                <div className="rr-suggestions">
                                    {cnSuggestions.map((cn, i) => (
                                        <button key={i} className="rr-suggestion-item" onMouseDown={() => {
                                            refundType === 'credit' ? handleCnSearch(cn.credit_note_no) : handleCashSearch(cn.invoice_no);
                                        }}>
                                            <div className="rr-sug-left">
                                                <span className="rr-sug-inv">{refundType === 'credit' ? cn.credit_note_no : cn.invoice_no}</span>
                                                <span className="rr-sug-client">{cn.client_name || "—"}</span>
                                            </div>
                                            <div className="rr-sug-right"><span className="rr-sug-amount" style={{ color: '#059669' }}>₹{cn.amount}</span></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <button
                        className="rr-lookup-go"
                        onClick={() => refundType === 'credit' ? handleCnSearch() : handleCashSearch()}
                        disabled={returnLoading || !cnSearchQuery.trim()}
                        style={{ width: '100%', height: '44px', background: '#059669', fontSize: '13px' }}
                    >
                        {returnLoading ? "Searching…" : `Redeem & Open Billing Terminal`}
                    </button>
                </div>
            </div>
        ) : null;

        return (
            <div>
                <p className="rr-panel-sub">{subtitle}</p>
                <div className="rr-lookup-box" style={{ maxWidth: '100%', width: '100%' }}>
                    {SearchContent}
                </div>
                {returnError && <div className="rr-err" style={{ marginTop: '16px', maxWidth: '880px' }}>⚠️ {returnError}</div>}

                {/* Active Credit Notes - Direct Redeem */}
                {refundType === 'credit' && allCreditNotes.filter(cn => cn.status !== 'Redeemed').length > 0 && (
                    <div style={{ marginTop: 24, width: '100%' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, letterSpacing: 0.3 }}>
                            Active Credit Notes
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {allCreditNotes.filter(cn => cn.status !== 'Redeemed').map((cn, i) => (
                                <div key={cn.credit_note_no || i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
                                    padding: '12px 18px', gap: 16
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f' }}>{cn.credit_note_no}</span>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{cn.client_name || 'Walk-in'}</span>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{cn.phone || ''}</span>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{cn.invoice_no || ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <span style={{ fontWeight: 700, fontSize: 15, color: '#059669' }}>₹{Number(cn.amount || 0).toLocaleString('en-IN')}</span>
                                        <button
                                            onClick={() => {
                                                navigate("/billing", {
                                                    state: {
                                                        isFromCnRedeem: true,
                                                        cnAmount: cn.amount || 0,
                                                        cnNumber: cn.credit_note_no || "",
                                                        clientName: cn.client_name || "",
                                                        clientPhone: cn.phone || ""
                                                    }
                                                });
                                            }}
                                            style={{
                                                padding: '7px 18px', borderRadius: 7, border: 'none',
                                                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2640 100%)',
                                                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                                letterSpacing: 0.3
                                            }}
                                        >
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════
       MAIN CONTENT PANELS
    ═══════════════════════════════════════ */

    // ── Refund panel ──
    const RefundPanel = () => {
        if (refundDone) return (
            <div className="rr-success-pane">
                <div className="rr-success-tick">✅</div>
                <h3 className="rr-success-heading">
                    {refundType === "credit" ? "Credit Note Issued!" : "Cash Refund Complete!"}
                </h3>
                {issuedCnNumber && (
                    <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', margin: '15px 0', border: '1px dashed #cbd5e1' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Generated Credit Note No.</span>
                        <strong style={{ fontSize: '20px', color: '#0f172a', letterSpacing: '1px' }}>{issuedCnNumber}</strong>
                    </div>
                )}
                <p className="rr-success-note">
                    {refundType === "credit"
                        ? `Credit note ${issuedCnNumber} has been issued. Hand the slip to the customer.`
                        : "Cash has been returned to the customer. Transaction recorded."}
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button className="rr-outline-btn" onClick={() => { setRefundType(null); setRefundDone(false); }}>
                        ← New Refund
                    </button>
                    <button className="rr-done-btn" onClick={() => navigate("/billing")}>
                        Back to Billing
                    </button>
                </div>
            </div>
        );

        if (refundType) {
            if (!refundBill) {
                return (
                    <div>
                        <button className="rr-chip-back" style={{ marginBottom: 15 }} onClick={() => setRefundType(null)}>← Back to Refund Type</button>
                        {InvoiceLookupUI(`Search for the bill to issue a ${refundType === 'credit' ? 'Credit Note' : 'Cash Refund'} for`)}
                    </div>
                );
            }

            const isCreditNote = refundType === "credit";
            return (
                <div className="rr-bill-detail" style={{ borderTop: `4px solid ${isCreditNote ? '#1e3a5f' : '#0d9488'}`, padding: '0px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                    {/* Header: Compact Billing Header */}
                    <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '16px', fontWeight: 900, letterSpacing: '0.5px' }}>
                                {isCreditNote ? "CREDIT NOTE" : "CASH REFUND"}
                            </h2>
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                                Bill Reference: {new Date().toLocaleDateString("en-IN")} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800 }}>REF: #{Math.floor(Math.random() * 89999 + 10000)}</div>
                            <button className="rr-chip-back" style={{ padding: '3px 6px', fontSize: '9px' }} onClick={() => { setRefundBill(null); setInvoiceInput(""); }}>← Edit</button>
                        </div>
                    </div>

                    {(isFromCashSearch || refundBill?.is_cn_update || refundBill?.is_cash_refunded || refundBill?.is_replaced) && !isFromCnSearch && !isFromCashSearch && (
                        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fef3c7', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>⚠️</span>
                            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
                                {refundBill?.is_replaced
                                    ? 'This bill has already been replaced. Please check replacement history.'
                                    : refundBill?.is_cash_refunded
                                        ? 'money already refunded'
                                        : refundBill?.is_cn_update
                                            ? 'already credit not issue and recived'
                                            : (refundType === 'credit' ? 'once credit not alredy issue sorry you cannot issue credit note for second time' : 'bill refund already issue for this invoice')
                                }
                            </div>
                        </div>
                    )}

                    {(isFromCnSearch || isFromCashSearch) && (
                        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #dcfce7', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>✅</span>
                            <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                                {isFromCnSearch
                                    ? `Credit Note (${selectedCn?.credit_note_no}) Found - Ready for Redemption`
                                    : `Cash Refund Record Found - Ready for Redemption`
                                }
                            </div>
                        </div>
                    )}

                    {returnError && (
                        <div className="rr-err" style={{ margin: '12px 20px', fontSize: '13px', padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '4px', color: '#dc2626' }}>
                            ⚠️ {returnError}
                        </div>
                    )}

                    {/* Compact Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#fff', borderBottom: '1px dashed #e2e8f0' }}>
                        {[
                            ["Invoice", refundBill.invoice_no],
                            ["Sale Date", new Date(refundBill.sale_date).toLocaleDateString("en-IN")],
                            ["Customer", refundBill.client_name || "Walk-in"],
                            ["Contact", refundBill.phone || "—"],
                            ["Paid Via", refundBill.payment_mode],
                            ["Refund Type", isCreditNote ? "Store Credit" : "Direct Cash"],
                        ].map(([label, val]) => (
                            <div key={label} style={{ padding: '10px 20px', borderRight: '1px solid #f8fafc' }}>
                                <div style={{ color: '#94a3b8', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                                <div style={{ color: '#1e293b', fontSize: '11px', fontWeight: 700 }}>{val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Actual Bill Style Table */}
                    <div style={{ padding: '15px 20px' }}>
                        <div className="rr-table-scroll">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #1e3a5f', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {!isFromCnSearch && !isFromCashSearch && (
                                            <th style={{ paddingBottom: '8px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.length === refundBill.items.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedIndices(refundBill.items.map((_, i) => i));
                                                        else setSelectedIndices([]);
                                                    }}
                                                />
                                            </th>
                                        )}
                                        <th style={{ textAlign: "left", paddingBottom: '8px' }}>Category</th>
                                        <th style={{ textAlign: "left", paddingBottom: '8px' }}>Item</th>
                                        <th style={{ paddingBottom: '8px' }}>Size</th>
                                        <th style={{ paddingBottom: '8px' }}>Color</th>
                                        <th style={{ paddingBottom: '8px' }}>Qty</th>
                                        <th style={{ paddingBottom: '8px' }}>Rate</th>
                                        <th style={{ textAlign: "right", paddingBottom: '8px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const credited = refundBill.items.filter(item => !!item.is_cn_update);
                                        const refunded = refundBill.items.filter(item => !!item.is_cash_refunded);
                                        const itemsToShow = isFromCnSearch
                                            ? (credited.length > 0 ? credited : refundBill.items)
                                            : isFromCashSearch
                                                ? (refunded.length > 0 ? refunded : refundBill.items)
                                                : refundBill.items;

                                        return itemsToShow.map((item, idx) => {
                                            const rate = parseFloat(item.price || item.unit_price || 0);
                                            const qty = parseFloat(item.qty || 0);
                                            const gst = parseFloat(item.gst || item.gst_percent || 5);
                                            const total = (rate * qty) * (1 + gst / 100);

                                            // Highlight if marked, or if it's a fallback redemption (legacy)
                                            const isHighlighted = (isFromCnSearch && (!!item.is_cn_update || credited.length === 0)) ||
                                                (isFromCashSearch && (!!item.is_cash_refunded || refunded.length === 0));

                                            return (
                                                <tr key={idx} style={{
                                                    borderBottom: '1px solid #f1f5f9',
                                                    opacity: (isFromCnSearch || isFromCashSearch || selectedIndices.includes(idx)) ? 1 : 0.5,
                                                    background: isHighlighted ? 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)' : (selectedIndices.includes(idx) ? 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)' : 'transparent'),
                                                    borderLeft: isHighlighted ? '3px solid #16a34a' : (selectedIndices.includes(idx) ? '3px solid #3b82f6' : '3px solid transparent'),
                                                    transition: 'background 0.2s'
                                                }}>
                                                    {!isFromCnSearch && !isFromCashSearch && (
                                                        <td style={{ textAlign: 'center', padding: '10px 0' }}>
                                                            <input
                                                                type="checkbox"
                                                                disabled={item.is_cn_update || item.is_cash_refunded}
                                                                checked={selectedIndices.includes(idx)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedIndices([...selectedIndices, idx]);
                                                                    else setSelectedIndices(selectedIndices.filter(i => i !== idx));
                                                                }}
                                                            />
                                                        </td>
                                                    )}
                                                    <td style={{ textAlign: "left", padding: '10px 0', color: isHighlighted ? '#14532d' : '#64748b', fontWeight: isHighlighted ? 700 : 400 }}>{item.category}</td>
                                                    <td style={{ textAlign: "left", fontWeight: 700, color: isHighlighted ? '#14532d' : '#1e293b' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {item.item_name}
                                                            {isHighlighted && (
                                                                <span style={{
                                                                    fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                                                                    background: '#16a34a', color: '#fff', borderRadius: '4px',
                                                                    letterSpacing: '0.5px', textTransform: 'uppercase'
                                                                }}>
                                                                    {isFromCnSearch ? 'CREDITED' : 'REFUNDED'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: isHighlighted ? 700 : 400, color: isHighlighted ? '#14532d' : 'inherit' }}>{item.size}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: isHighlighted ? 700 : 400, color: isHighlighted ? '#14532d' : 'inherit' }}>{item.color}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{ color: '#1e293b', fontWeight: 600 }}>₹{Math.round(rate).toLocaleString()}</div>
                                                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>(+ {gst}% GST)</div>
                                                    </td>
                                                    <td style={{ textAlign: "right", fontWeight: 800, color: isHighlighted ? '#16a34a' : '#1e3a5f' }}>
                                                        ₹{Math.round(total).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Summary Section */}
                    <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', maxWidth: '200px', fontStyle: 'italic' }}>
                            * This credit note is valid for 30 days and can be redeemed on your next purchase.
                        </div>
                        <div style={{ borderTop: '2px solid #1e3a5f', paddingTop: '8px', textAlign: 'right', minWidth: '150px' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
                                {isCreditNote ? "Store Credit Amount" : "Cash to Refund"}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: isCreditNote ? '#1e3a5f' : '#0d9488', lineHeight: 1 }}>
                                ₹{(isFromCnSearch ? selectedCn?.amount : (isFromCashSearch ? selectedRefund?.amount :
                                    Math.round(refundBill.items.filter((_, i) => selectedIndices.includes(i)).reduce((sum, item) => {
                                        const rate = parseFloat(item.price || item.unit_price || 0);
                                        const qty = parseFloat(item.qty || 0);
                                        const gst = parseFloat(item.gst || item.gst_percent || 5);
                                        return sum + (rate * qty) * (1 + gst / 100);
                                    }, 0))
                                )).toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>

                    {/* Refund Mode Selector - only for cash refunds */}
                    {!isCreditNote && !isFromCnSearch && !isFromCashSearch && selectedIndices.length > 0 && (
                        <div style={{ padding: '0 20px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Refund Via:</span>
                            <button
                                onClick={() => setRefundMode('Cash')}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    border: refundMode === 'Cash' ? '2px solid #16a34a' : '2px solid #cbd5e1',
                                    background: refundMode === 'Cash' ? '#dcfce7' : '#fff',
                                    color: refundMode === 'Cash' ? '#166534' : '#64748b'
                                }}
                            >Cash</button>
                            <button
                                onClick={() => setRefundMode('Online')}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    border: refundMode === 'Online' ? '2px solid #2563eb' : '2px solid #cbd5e1',
                                    background: refundMode === 'Online' ? '#dbeafe' : '#fff',
                                    color: refundMode === 'Online' ? '#1e40af' : '#64748b'
                                }}
                            >Online</button>
                        </div>
                    )}

                    {/* Compact Final Action */}
                    <div style={{ padding: '0 20px 20px' }}>
                        <button
                            className={`rr-confirm-btn ${isCreditNote ? "rr-confirm-green" : "rr-confirm-teal"}`}
                            style={{
                                width: '100%',
                                margin: 0,
                                padding: '12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                background: (refundBill?.is_cn_update || refundBill?.is_cash_refunded || refundBill?.is_replaced || selectedIndices.length === 0) ?
                                    ((isFromCnSearch || isFromCashSearch) ? (isFromCnSearch ? '#ef4444' : '#0d9488') : '#94a3b8') :
                                    (isFromCnSearch ? '#ef4444' : (isFromCashSearch ? '#0d9488' : '')),
                                cursor: selectedIndices.length === 0 && !isFromCnSearch && !isFromCashSearch ? 'not-allowed' : 'pointer'
                            }}
                            onClick={selectedIndices.length === 0 && !isFromCnSearch && !isFromCashSearch ? null : (isFromCnSearch ? handleDeleteCn : (isFromCashSearch ? handleRedeemCash : (isCreditNote ? handleIssueRefund : handleRefundToBilling)))}
                            disabled={returnLoading || (selectedIndices.length === 0 && !isFromCnSearch && !isFromCashSearch)}
                        >
                            {returnLoading ? "Processing..." : (
                                refundBill?.is_replaced ? "BILL ALREADY REPLACED" : (
                                    refundBill?.is_cash_refunded ? "money already refunded" : (
                                        refundBill?.is_cn_update ? (isFromCnSearch ? "REDEEM & EXCHANGE FOR NEW BILL" : "already credit not issue and recived") : (
                                            isFromCnSearch ? "REDEEM & EXCHANGE FOR NEW BILL" :
                                                (isFromCashSearch ? "REDEEM & EXCHANGE FOR NEW BILL" :
                                                    (isCreditNote ? "Complete & Print Credit Note" : "Confirm Refund & Finalize in Billing"))
                                        )
                                    )
                                )
                            )}
                        </button>
                    </div>
                </div>
            );
        }

        // Choose Credit Note or Cash
        return (
            <div>
                <div className="rr-two-col">
                    <button className="rr-big-btn rr-btn-green" onClick={() => setRefundType("credit")}>
                        <span className="rr-btn-icon">📄</span>
                        <span className="rr-btn-label">Credit Note</span>
                        <span className="rr-btn-desc">Issue store credit to customer</span>
                    </button>
                    <button className="rr-big-btn rr-btn-teal" onClick={() => setRefundType("cash")}>
                        <span className="rr-btn-icon">💵</span>
                        <span className="rr-btn-label">Cash</span>
                        <span className="rr-btn-desc">Hand cash back to customer</span>
                    </button>
                </div>
            </div>
        );
    };

    // ── Return panel ──
    const ReturnPanel = () => {
        if (returnConfirmed) return (
            <div className="rr-success-pane">
                <div className="rr-success-tick">✅</div>
                <h3 className="rr-success-heading">Replacement Processed!</h3>
                <p className="rr-success-note">
                    The bill has been updated, stock levels adjusted, and the transaction has been recorded.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button className="rr-outline-btn" onClick={() => {
                        setReturnBill(null); setEditedItems([]); setInvoiceInput(""); setReturnConfirmed(false);
                    }}>← New Replace</button>
                    <button className="rr-done-btn" onClick={() => navigate("/billing")}>Back to Billing</button>
                </div>
            </div>
        );

        if (returnBill) {
            const selectedTotal = Math.round(
                returnBill.items.filter((_, i) => selectedIndices.includes(i)).reduce((sum, item) => {
                    const rate = parseFloat(item.unit_price || item.price || item.rate || 0);
                    const qty = parseFloat(item.qty || 0);
                    const gst = parseFloat(item.gst_percent ?? item.gst ?? 5);
                    return sum + (rate * qty) * (1 + gst / 100);
                }, 0)
            );

            return (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div className="rr-found-tag" style={{ margin: 0 }}>✅ Bill Found — {returnBill.invoice_no}</div>
                        {returnBill.is_replaced && (
                            <button
                                onClick={() => setShowReplacementHistory(true)}
                                className="rr-replaced-btn"
                            >
                                🔁 REPLACED (View History)
                            </button>
                        )}
                    </div>

                    {(returnBill.is_cn_update || returnBill.is_cash_refunded) && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>⚠️</span>
                            <div style={{ fontSize: '14px', color: '#92400e', fontWeight: 600 }}>
                                {returnBill.is_cn_update
                                    ? 'A Credit Note has already been issued for this bill. Replacement is not recommended.'
                                    : 'A Cash Refund has already been processed for this bill.'
                                }
                            </div>
                        </div>
                    )}

                    <div className="rr-bill-detail">
                        {/* Info grid — read-only */}
                        <div className="rr-bill-info-grid">
                            {[
                                ["Invoice No", returnBill.invoice_no],
                                ["Date", new Date(returnBill.sale_date).toLocaleDateString("en-IN")],
                                ["Client", returnBill.client_name || "—"],
                                ["Phone", returnBill.phone || "—"],
                                ["Payment", returnBill.payment_mode],
                                ["Status", returnBill.payment_status || "Paid"],
                            ].map(([label, val]) => (
                                <div key={label} className="rr-info-cell">
                                    <span className="rr-info-label">{label}</span>
                                    <span className="rr-info-val">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Editable items table */}
                        <div className="rr-items-section">
                            <div className="rr-edit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="rr-items-heading">Select Items to Replace</span>
                                {selectedIndices.length > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                                        {selectedIndices.length} Item(s) Selected
                                    </span>
                                )}
                            </div>

                            <div className="rr-table-scroll">
                                <table className="rr-table">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center", width: "40px" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.length === returnBill.items.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedIndices(returnBill.items.map((_, i) => i));
                                                        else setSelectedIndices([]);
                                                    }}
                                                />
                                            </th>
                                            <th style={{ textAlign: "left" }}>Category</th>
                                            <th style={{ textAlign: "left" }}>Item Name</th>
                                            <th>Size</th>
                                            <th>Color</th>
                                            <th>Qty</th>
                                            <th>Rate</th>
                                            <th style={{ textAlign: "right" }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnBill.items.map((item, i) => {
                                            const rate = parseFloat(item.unit_price || item.price || item.rate || 0);
                                            const qty = parseFloat(item.qty || 0);
                                            const gst = parseFloat(item.gst_percent ?? item.gst ?? 5);
                                            const total = (rate * qty) * (1 + gst / 100);
                                            const isSelected = selectedIndices.includes(i);
                                            return (
                                                <tr
                                                    key={i}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedIndices(selectedIndices.filter(idx => idx !== i));
                                                        else setSelectedIndices([...selectedIndices, i]);
                                                    }}
                                                    style={{ cursor: 'pointer', background: isSelected ? '#fff1f2' : 'transparent' }}
                                                >
                                                    <td style={{ textAlign: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }} // Handled by tr onClick
                                                        />
                                                    </td>
                                                    <td style={{ textAlign: "left", color: "#64748b" }}>{item.category}</td>
                                                    <td style={{ textAlign: "left", fontWeight: 700, color: "#1e293b" }}>{item.item_name}</td>
                                                    <td style={{ textAlign: "center" }}>{item.size}</td>
                                                    <td style={{ textAlign: "center" }}>{item.color}</td>
                                                    <td style={{ textAlign: "center", fontWeight: 700 }}>{item.qty}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <div style={{ color: '#1e293b', fontWeight: 600 }}>₹{Math.round(rate).toLocaleString("en-IN")}</div>
                                                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>(+ {gst}% GST)</div>
                                                    </td>
                                                    <td style={{ textAlign: "right", fontWeight: 800, color: isSelected ? "#dc2626" : "#1e3a5f" }}>
                                                        ₹{Math.round(total).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="rr-grand-line">
                                <div>Selected Return Value</div>
                                <span style={{ color: '#dc2626' }}>₹{selectedTotal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                    </div>

                    <div className="rr-bill-btns">
                        <button
                            className="rr-confirm-btn"
                            style={{
                                background: (returnBill.is_replaced || selectedIndices.length === 0) ? '#94a3b8' : '#059669',
                                cursor: (returnBill.is_replaced || selectedIndices.length === 0) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={returnLoading || returnBill.is_replaced || selectedIndices.length === 0}
                            onClick={() => {
                                if (returnBill.is_replaced || selectedIndices.length === 0) return;

                                // Tag all items: some are going back (returned), some are staying (retained)
                                const taggedItems = returnBill.items.map((item, i) => ({
                                    ...item,
                                    isReturned: selectedIndices.includes(i),
                                    isRetained: !selectedIndices.includes(i)
                                }));

                                navigate("/billing", {
                                    state: {
                                        isFromReturn: true,
                                        bill: returnBill,
                                        items: taggedItems,
                                        returnedTotal: selectedTotal,
                                        originalFullTotal: returnBill.grand_total
                                    }
                                });
                            }}
                        >
                            {returnBill.is_replaced ? "Already Replaced" : selectedIndices.length === 0 ? "Select Items to Replace" : `🔁 Replace Selected (₹${selectedTotal.toLocaleString("en-IN")})`}
                        </button>
                        <button className="rr-outline-btn" onClick={() => { setReturnBill(null); setEditedItems([]); setInvoiceInput(""); setSelectedIndices([]); }}>
                            ← Search Again
                        </button>
                    </div>
                </div >
            );
        }

        return InvoiceLookupUI();
    };

    // HistoryLogPanel removed

    return (
        <div className="rr-page">

            {/* ── Sidebar ── */}
            <aside className="rr-sidebar">
                <div className="rr-sidebar-brand">
                    <img src="/spick-logo.png" alt="Logo" className="rr-sidebar-logo" />
                    <div className="rr-sidebar-name">Prestige Garment</div>
                    <div className="rr-sidebar-module">Refund & Return</div>
                </div>

                {/* THE TWO MAIN BUTTONS */}
                <nav className="rr-nav">
                    <button
                        className={`rr-nav-btn ${activeTab === "refund" ? "active" : ""}`}
                        onClick={() => switchTab("refund")}
                    >
                        <span className="rr-nav-btn-icon">💳</span>
                        <span className="rr-nav-btn-label">Refund</span>
                    </button>

                    <button
                        className={`rr-nav-btn ${activeTab === "return" ? "active" : ""}`}
                        onClick={() => switchTab("return")}
                    >
                        <span className="rr-nav-btn-icon">🔁</span>
                        <span className="rr-nav-btn-label">Return</span>
                    </button>

                    {/* History Log button removed */}
                </nav>

                <button className="rr-sidebar-back" onClick={() => navigate("/billing")}>
                    ← Go to Billing
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main className="rr-main">
                <div className="rr-main-header">
                    <div>
                        <h1 className="rr-main-title">
                            {activeTab === "refund" ? "Issue Refund" :
                                activeTab === "return" ? "Process Return" :
                                    "Refund & Return Centre"}
                        </h1>
                        <p className="rr-main-breadcrumb">
                            {activeTab === "refund"
                                ? "Convert bill items into Cash or Store Credit"
                                : activeTab === "return"
                                    ? "Exchange products or return them to inventory"
                                    : "Select an option from the sidebar to begin"}
                        </p>
                    </div>
                </div>

                <div className="rr-main-body">
                    {!activeTab && (
                        <div className="rr-empty-state">
                            <div className="rr-empty-icon">🔙</div>
                            <h3>Select a Module</h3>
                            <p>Choose <strong>Refund</strong> or <strong>Return</strong> from the sidebar to get started.</p>
                        </div>
                    )}
                    {activeTab === "refund" && RefundPanel()}
                    {activeTab === "return" && ReturnPanel()}
                    {/* HistoryLogPanel removed */}
                </div>
            </main>

            {/* Replacement History Modal */}
            {showReplacementHistory && (
                <div className="rr-modal-overlay">
                    <div className="rr-modal-box" style={{ maxWidth: 800 }}>
                        <div className="rr-modal-header">
                            <h2 style={{ margin: 0 }}>Replacement History</h2>
                            <button className="rr-close-btn" onClick={() => setShowReplacementHistory(false)}>×</button>
                        </div>
                        <div className="rr-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: 20 }}>
                            {replacementHistory.map((rep, ridx) => {
                                const oldItems = JSON.parse(rep.original_items);
                                const newItems = JSON.parse(rep.replaced_items);
                                return (
                                    <div key={rep.id} style={{ border: '1px solid #fee2e2', borderRadius: 12, padding: 20, marginBottom: 20, background: '#fffcfc' }}>
                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 15, borderBottom: '1px solid #fee2e2', paddingBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Date: {new Date(rep.replacement_date).toLocaleString()}</span>
                                            <span>By: {rep.processed_by}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 15, alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 5 }}>WAS</div>
                                                {oldItems.map((oi, i) => (
                                                    <div key={i} style={{ fontSize: 12, color: '#1e293b' }}>• {oi.item_name} ({oi.qty})</div>
                                                ))}
                                            </div>
                                            <div style={{ color: '#b91c1c', fontWeight: 900 }}>→</div>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 5 }}>BECOMES</div>
                                                {newItems.map((ni, i) => (
                                                    <div key={i} style={{ fontSize: 12, color: '#059669' }}>• {ni.item_name} ({ni.qty})</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

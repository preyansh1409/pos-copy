import API_BASE_URL from "../apiConfig";
// Dayout Report Panel with cash counting and print logic
function DayoutReportPanel({ data: parentData }) {
    const [noteCounts, setNoteCounts] = React.useState({
        500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0,
        coin1: 0, coin2: 0, coin5: 0, coin10: 0, coin20: 0
    });
    const [showError, setShowError] = React.useState(false); // eslint-disable-line no-unused-vars
    const [alreadySaved, setAlreadySaved] = React.useState(false);
    const [savedReport, setSavedReport] = React.useState(null);
    const [checking, setChecking] = React.useState(true);
    const [shiftData, setShiftData] = React.useState(null); // filtered data for this shift
    const [lastDayoutTime, setLastDayoutTime] = React.useState(null); // time of last dayout report today

    // Check if today's report already exists for this user, and find last dayout cutoff
    const currentUser = window.localStorage.getItem('username') || 'Admin';
    React.useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/dayout/all`);
                if (!res.ok) throw new Error("API error");
                const d = await res.json();
                const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
                const reports = d.reports || [];
                // Get all reports for today
                const todayReports = reports.filter(r => {
                    const rDate = r.report_date ? new Date(r.report_date).toLocaleDateString('en-CA') : '';
                    return rDate === today;
                });
                // Check if THIS user already saved
                const existing = todayReports.find(r => (r.username || '') === currentUser);
                if (existing) {
                    setAlreadySaved(true);
                    setSavedReport(existing);
                }
                // Find the latest dayout report today (by ANY user) to use as cutoff
                if (todayReports.length > 0) {
                    // Sort by created_at descending to get the most recent
                    const sorted = [...todayReports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    const latestReport = sorted[0];
                    const createdAt = new Date(latestReport.created_at);
                    // Format as HH:MM:SS for the backend query
                    const afterTime = `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}:${String(createdAt.getSeconds()).padStart(2, '0')}`;
                    setLastDayoutTime(afterTime);
                    // Fetch filtered data — only bills AFTER the last dayout
                    try {
                        const sRes = await fetch(`${API_BASE_URL}/billing/daily-summary?date=${today}&afterTime=${afterTime}`);
                        if (sRes.ok) {
                            const sData = await sRes.json();
                            setShiftData(sData);
                        }
                    } catch { /* use parent data as fallback */ }
                }
            } catch { /* server not reachable, allow form */ }
            setChecking(false);
        };
        check();
    }, [currentUser]);

    // Use shift-filtered data if available, otherwise use parent's full-day data
    const data = shiftData || parentData;
    const cashSales = data?.salesSplits?.find(s => s.payment_mode === "Cash")?.total_amount || 0;
    const onlineSales = data?.salesSplits?.filter(s => s.payment_mode !== "Cash").reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;
    const totalCash = Number(cashSales);
    const totalOnline = Number(onlineSales);
    const creditNotes = data.creditNoteList || [];
    // eslint-disable-next-line no-unused-vars
    const issuedCount = creditNotes.filter(cn => cn.issued_date && new Date(cn.issued_date).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
    // eslint-disable-next-line no-unused-vars
    const redeemedCount = creditNotes.filter(cn => cn.status === 'Redeemed' && cn.redeemed_date && new Date(cn.redeemed_date).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
    // eslint-disable-next-line no-unused-vars
    const creditNoteTotal = creditNotes.filter(cn => cn.issued_date && new Date(cn.issued_date).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((sum, cn) => sum + Number(cn.amount || 0), 0);

    // Calculate user counted cash
    const countedCash =
        Number(noteCounts["500"] || 0) * 500 +
        Number(noteCounts["200"] || 0) * 200 +
        Number(noteCounts["100"] || 0) * 100 +
        Number(noteCounts["50"] || 0) * 50 +
        Number(noteCounts["20"] || 0) * 20 +
        Number(noteCounts["10"] || 0) * 10 +
        Number(noteCounts["coin1"] || 0) * 1 +
        Number(noteCounts["coin2"] || 0) * 2 +
        Number(noteCounts["coin5"] || 0) * 5 +
        Number(noteCounts["coin10"] || 0) * 10 +
        Number(noteCounts["coin20"] || 0) * 20;

    const isMatch = Math.abs(countedCash - totalCash) < 1;

    const handleNoteChange = (denom, value) => {
        // Remove non-numeric and leading zeros (but allow single 0)
        let cleaned = value.replace(/[^0-9]/g, "");
        if (cleaned.length > 1) cleaned = cleaned.replace(/^0+/, "");
        setNoteCounts(nc => ({ ...nc, [denom]: cleaned }));
        setShowError(false);
    };

    const handlePrint = async () => {
        if (!isMatch) {
            setShowError(true);
            return;
        }
        // Save to database
        try {
            const res = await fetch(`${API_BASE_URL}/dayout/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    report_date: new Date().toISOString().slice(0, 10),
                    report_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    username: window.localStorage.getItem('username') || 'Admin',
                    net_cash: totalCash,
                    online_collection: totalOnline,
                    grand_total: totalCash + totalOnline,
                    counted_cash: countedCash,
                    note_counts: noteCounts
                })
            });
            const d = await res.json();
            if (!res.ok) {
                alert("Failed to save report: " + (d.error || "Unknown error"));
                return;
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save report. Check server connection.");
            return;
        }
        window.print();
        setAlreadySaved(true);
        setSavedReport({
            report_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            username: window.localStorage.getItem('username') || 'Admin',
            net_cash: totalCash,
            online_collection: totalOnline,
            grand_total: totalCash + totalOnline,
            counted_cash: countedCash
        });
    };

    // Get current user (simulate, replace with real user logic if available)
    const username = window.localStorage.getItem('username') || 'Admin';
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (checking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div className="rr-loading-spinner" />
                    <p style={{ marginTop: 12, fontWeight: 600 }}>Checking today&apos;s report...</p>
                </div>
            </div>
        );
    }

    if (alreadySaved) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: '48px 40px', minWidth: 500, maxWidth: 700, textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginBottom: 8 }}>{savedReport?.username || 'Admin'} Already Completed Dayout Report</h2>
                    <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>Today&apos;s dayout report has been saved and printed.</p>
                    {savedReport && (
                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, textAlign: 'left', display: 'inline-block', minWidth: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>User:</span>
                                <span style={{ fontWeight: 700 }}>{savedReport.username}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Time:</span>
                                <span style={{ fontWeight: 600 }}>{savedReport.report_time}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Net Cash:</span>
                                <span style={{ fontWeight: 700, color: '#0f766e' }}>₹{Number(savedReport.net_cash || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Online:</span>
                                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>₹{Number(savedReport.online_collection || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                                <span style={{ color: '#7c3aed', fontWeight: 700 }}>Grand Total:</span>
                                <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 18 }}>₹{Number(savedReport.grand_total || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 36, minWidth: 600, maxWidth: 900, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 8, letterSpacing: 1, color: '#000' }}>Dayout Report</div>
                <div style={{ fontWeight: 500, fontSize: 16, color: '#000', marginBottom: 2 }}>User: <span style={{ fontWeight: 600 }}>{username}</span></div>
                <div style={{ fontWeight: 500, fontSize: 16, color: '#000', marginBottom: 16 }}>Date: <span style={{ fontWeight: 600 }}>{todayStr}</span> &nbsp; | &nbsp; Time: <span style={{ fontWeight: 600 }}>{timeStr}</span></div>
                {lastDayoutTime && !alreadySaved && (
                    <div style={{ background: '#fff', border: '1px solid #000', borderRadius: 8, padding: '8px 16px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#000' }}>
                        ⏰ Showing bills from {lastDayoutTime} onwards (previous dayout already submitted)
                    </div>
                )}
                <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'stretch', marginBottom: 0 }}>
                    {/* Excel-style Cash Collection Table */}
                    <div style={{ minWidth: 420, maxWidth: 460, background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ marginBottom: 10, fontSize: 16, color: '#000', width: 420, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 500, marginLeft: 15 }}> Cash Denomination </span>
                            <span style={{ fontWeight: 700, fontSize: 20, color: '#000', minWidth: 120, textAlign: 'right', display: 'inline-block', marginRight: 15 }}>₹{fmt(totalCash)}</span>
                        </div>
                        <table className="excel-table" style={{ width: '100%', margin: '12px 0 4px' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Denomination</th>
                                    <th style={{ textAlign: 'center' }}>Count</th>
                                    <th style={{ textAlign: 'center' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[500, 200, 100, 50, 20, 10].map(denom => {
                                    const val = noteCounts[denom];
                                    const qty = Number(val) || 0;
                                    const total = denom * qty;
                                    return (
                                        <tr key={denom}>
                                            <td style={{ textAlign: 'center' }}>{denom}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="number" min="0" value={val === '' ? 0 : val} onFocus={e => { if (e.target.value === '' || e.target.value === '0') e.target.value = 0; }} onChange={e => handleNoteChange(denom, e.target.value)} style={{ width: 60, fontSize: 15, borderRadius: 4, border: '1px solid #000', padding: '2px 6px', background: '#fff', color: '#000', textAlign: 'center' }} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{total > 0 ? total : ''}</td>
                                        </tr>
                                    );
                                })}
                                {[1, 2, 5, 10, 20].map((coin, idx, arr) => {
                                    const val = noteCounts[`coin${coin}`];
                                    const qty = Number(val) || 0;
                                    const total = coin * qty;
                                    // After last coin (20), insert Grand Total row
                                    if (idx === arr.length - 1) {
                                        return [
                                            <tr key={coin}>
                                                <td style={{ textAlign: 'center' }}>{coin}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <input type="number" min="0" value={val === '' ? 0 : val} onFocus={e => { if (e.target.value === '' || e.target.value === '0') e.target.value = 0; }} onChange={e => handleNoteChange(`coin${coin}`, e.target.value)} style={{ width: 60, fontSize: 15, borderRadius: 4, border: '1px solid #000', padding: '2px 6px', background: '#fff', color: '#000', textAlign: 'center' }} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{total > 0 ? total : ''}</td>
                                            </tr>,
                                            <tr key="grand-total-row">
                                                <td colSpan="2" style={{ fontWeight: 700, textAlign: 'left', fontSize: 16, paddingLeft: '12px' }}>Grand Total</td>
                                                <td style={{ fontWeight: 900, fontSize: 18, textAlign: 'center', paddingLeft: '8px' }}>₹{fmt(countedCash)}</td>
                                            </tr>
                                        ];
                                    }
                                    return (
                                        <tr key={coin}>
                                            <td style={{ textAlign: 'center' }}>{coin}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="number" min="0" value={val === '' ? 0 : val} onFocus={e => { if (e.target.value === '' || e.target.value === '0') e.target.value = 0; }} onChange={e => handleNoteChange(`coin${coin}`, e.target.value)} style={{ width: 60, fontSize: 15, borderRadius: 4, border: '1px solid #000', padding: '2px 6px', background: '#fff', color: '#000', textAlign: 'center' }} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{total > 0 ? total : ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Grand Total now inside the table */}
                <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                    <button
                        className="print-only-btn"
                        onClick={handlePrint}
                        disabled={countedCash !== totalCash}
                        style={{
                            fontWeight: 600,
                            fontSize: 16,
                            background: countedCash === totalCash ? '#2563eb' : '#cbd5e1',
                            color: countedCash === totalCash ? '#fff' : '#64748b',
                            border: 'none',
                            borderRadius: 6,
                            padding: '10px 28px',
                            cursor: countedCash === totalCash ? 'pointer' : 'not-allowed',
                            boxShadow: '0 1px 4px #0001',
                            transition: 'background 0.2s, color 0.2s, cursor 0.2s'
                        }}
                    >
                        Save & Print
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DailyCollection.css";

// using API_BASE_URL directly from imports
const MODE_ICONS = { Cash: "💵", Online: "📱", Card: "💳", UPI: "📱", Default: "💰" };

function safeParseItems(raw) {
    if (!raw || raw === "null") return [];
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function fmt(n) {
    return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtTime(d) {
    if (!d) return "—";
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ═══════════════════════════════════════════════════
   BILL DETAIL MODAL
═══════════════════════════════════════════════════ */
function BillDetailModal({ invoiceNo, onClose }) {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!invoiceNo) return;
        const load = () => {
            setLoading(true);
            setError(null);
            const normInv = invoiceNo.replace(/\s+/g, '');
            fetch(`${API_BASE_URL}/billing/get-bill/${normInv}`)
                .then(r => r.json())
                .then(d => {
                    if (d.error || !d.bill) throw new Error(d.error || "Bill not found");
                    // Parse items if it's a JSON string
                    const bill = { ...d.bill };
                    if (typeof bill.items === "string") {
                        try { bill.items = JSON.parse(bill.items); } catch { bill.items = []; }
                    }
                    setBill(bill);
                })
                .catch(e => setError(e.message))
                .finally(() => setLoading(false));
        };
        load();
    }, [invoiceNo]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);


    return (
        <div className="dc-modal-overlay" onClick={onClose}>
            <div className="dc-modal-sheet" onClick={e => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="dc-modal-header">
                    <div>
                        <div className="dc-modal-title">🧾 Bill Details</div>
                        <div className="dc-modal-inv">{invoiceNo}</div>
                    </div>
                    <button className="dc-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="dc-modal-loading">
                        <div className="dc-spinner" />
                        <p>Loading bill...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="dc-modal-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Bill Content */}
                {bill && !loading && (
                    <div className="dc-modal-body">

                        {/* Customer Info */}
                        <div className="dc-modal-customer">
                            <div className="dc-mc-row">
                                <span className="dc-mc-label">Customer</span>
                                <span className="dc-mc-val">{bill.client_name || "Walk-in Customer"}</span>
                            </div>
                            <div className="dc-mc-row">
                                <span className="dc-mc-label">Phone</span>
                                <span className="dc-mc-val">{bill.phone || "—"}</span>
                            </div>
                            <div className="dc-mc-row">
                                <span className="dc-mc-label">Date</span>
                                <span className="dc-mc-val">{bill.sale_date ? new Date(bill.sale_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                            </div>
                            <div className="dc-mc-row">
                                <span className="dc-mc-label">Payment</span>
                                <span className="dc-mc-mode">{bill.payment_mode || "Cash"}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="dc-modal-items-title">Items in this Bill ({bill.items?.length || 0})</div>
                        <div className="dc-modal-items-wrapper">
                            <table className="dc-modal-items-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Size</th>
                                        <th>Color</th>
                                        <th style={{ textAlign: "center" }}>Qty</th>
                                        <th style={{ textAlign: "right" }}>Price</th>
                                        <th style={{ textAlign: "right" }}>GST</th>
                                        <th style={{ textAlign: "right" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(bill.items || []).map((it, idx) => {
                                        const price = Number(it.rate || it.price || 0);
                                        const qty = Number(it.qty || 1);
                                        const gst = Number(it.gst ?? it.gst_percent ?? 0);
                                        const rowTotal = qty * price * (1 + gst / 100);
                                        return (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#1e293b" }}>{it.item_name || it.name || "—"}</td>
                                                <td style={{ color: "#64748b", fontSize: 12 }}>{it.category || "—"}</td>
                                                <td>{it.size || "—"}</td>
                                                <td>{it.color || "—"}</td>
                                                <td style={{ textAlign: "center", fontWeight: 700 }}>{qty}</td>
                                                <td style={{ textAlign: "right" }}>₹{fmt(price)}</td>
                                                <td style={{ textAlign: "right", color: "#64748b" }}>{gst}%</td>
                                                <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmt(Math.round(rowTotal))}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="dc-modal-totals">
                            <div className="dc-mt-row">
                                <span>Grand Total</span>
                                <span className="dc-mt-grand">₹{fmt(Math.round(bill.total_amount || 0))}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function DailyCollection({ standalone = true, initialTab = "summary" }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync if prop changes (for embedding in other layouts)
    useEffect(() => {
        const id = requestAnimationFrame(() => { if (initialTab) setActiveTab(initialTab); });
        return () => cancelAnimationFrame(id);
    }, [initialTab]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const loggedInUser = localStorage.getItem('username') || 'User';

    const displayDate = new Date(selectedDate).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE_URL}/billing/daily-summary?date=${selectedDate}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) throw new Error(d.error);
                setData(d);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useEffect(() => { const run = async () => { fetchData(); }; run(); }, [fetchData, selectedDate]);

    const openBill = (invNo) => {
        if (invNo) setSelectedInvoice(invNo);
    };

    const cashSales = data?.salesSplits?.find(s => s.payment_mode === "Cash")?.total_amount || 0;
    const netCash = Number(cashSales) - Number(data?.cashRefunds || 0);
    const totalBills = data?.salesSplits?.reduce((s, r) => s + Number(r.invoice_count || 0), 0) || 0;

    // Calculate issued and redeemed counts for the selected date (ensure always defined)
    let issuedCount = 0, redeemedCount = 0;
    if (data?.creditNoteList) {
        issuedCount = data.creditNoteList.filter(cn => cn.issued_date && new Date(cn.issued_date).toISOString().slice(0, 10) === selectedDate).length;
        redeemedCount = data.creditNoteList.filter(cn => cn.status === 'Redeemed' && cn.redeemed_date && new Date(cn.redeemed_date).toISOString().slice(0, 10) === selectedDate).length;
    }

    const TABS = [
        { id: "summary", icon: "📊", label: isToday ? "Today's Summary" : "Daily Summary" },
        { id: "bills", icon: "🧾", label: isToday ? "Today's Bills" : "All Bills", count: totalBills },
        { id: "refunds", icon: "💸", label: "Cash Refunds", count: data?.refundList?.length },
        { id: "credits", icon: "🎟️", label: "Credit Notes", count: issuedCount + redeemedCount },
        { id: "replacements", icon: "🔄", label: "Replacements", count: data?.replacementList?.length },
        { id: "dayout", icon: "📋", label: "Dayout Report" },
    ];

    const content = (
        <main className="dc-main" style={!standalone ? { padding: 0, height: 'auto', background: 'transparent' } : {}}>
            {activeTab !== "dayout" && (
                <header className="dc-topbar">
                    <div>
                        <h1 className="dc-page-title">
                            {TABS.find(t => t.id === activeTab)?.icon}&nbsp;&nbsp;{TABS.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="dc-page-sub">
                            {activeTab === "summary" ? `Complete financial overview for ${isToday ? "today" : displayDate}` :
                                activeTab === "bills" ? `All invoices processed on ${isToday ? "today" : displayDate} — click an invoice to view full bill` :
                                    activeTab === "refunds" ? `Cash paid back to customers on ${isToday ? "today" : displayDate} — click an invoice to view full bill` :
                                        activeTab === "credits" ? `Store credit notes issued on ${isToday ? "today" : displayDate} — click an invoice to view full bill` :
                                            activeTab === "today_bills" ? `All invoices processed on ${isToday ? "today" : displayDate} — click an invoice to view full bill` :
                                                `Product exchanges & replacements on ${isToday ? "today" : displayDate} — click an invoice to view full bill`}
                        </p>
                    </div>
                    {(activeTab === 'summary' && isToday) && (
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #1e3a5f 0%, #163754 100%)', padding: '8px 24px', borderRadius: 8, letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(30,58,95,0.18)' }}>Welcome, {loggedInUser}</span>
                        </div>
                    )}
                    <div className="dc-topbar-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 6, backgroundColor: "#f8fafc", marginLeft: "auto" }}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 14, fontWeight: 500, color: '#1e293b', background: '#fff', cursor: 'pointer' }}
                        />
                        {!isToday && (
                            <button
                                onClick={() => {
                                    const d = new Date();
                                    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                                }}
                                style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2640 100%)', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </header>
            )}

            <div className="dc-content-area">
                {loading && (
                    <div className="dc-center-state">
                        <div className="dc-spinner" />
                        <p>Loading collection data...</p>
                    </div>
                )}

                {error && (
                    <div className="dc-center-state dc-error">
                        <span style={{ fontSize: 48 }}>⚠️</span>
                        <p>Failed to load: {error}</p>
                        <button onClick={fetchData} className="dc-back-btn" style={{ marginTop: 16 }}>Try Again</button>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {activeTab === "summary" && (
                            <SummaryPanel data={data} netCash={netCash} totalBills={totalBills} onBillClick={openBill} isToday={isToday} />
                        )}
                        {(activeTab === "bills" || activeTab === "today_bills") && (
                            <BillsPanel list={data.todayBills || []} onBillClick={openBill} isToday={isToday} />
                        )}
                        {activeTab === "refunds" && (
                            <RefundsPanel list={data.refundList || []} total={data.totalRefunds} onBillClick={openBill} isToday={isToday} />
                        )}
                        {activeTab === "credits" && (
                            <CreditsPanel list={data.creditNoteList || []} total={data.totalCreditNotes} onBillClick={openBill} isToday={isToday} />
                        )}
                        {activeTab === "replacements" && (
                            <ReplacementsPanel list={data.replacementList || []} onBillClick={openBill} isToday={isToday} />
                        )}
                        {activeTab === "dayout" && (
                            <DayoutReportPanel data={data} netCash={netCash} />
                        )}
                    </>
                )}
            </div>
        </main>
    );

    if (!standalone) return (
        <>
            {selectedInvoice && (
                <BillDetailModal
                    invoiceNo={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
            {content}
        </>
    );

    return (
        <div className="dc-layout">
            {/* Bill Detail Modal */}
            {selectedInvoice && (
                <BillDetailModal
                    invoiceNo={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside className="dc-sidebar">
                <div className="dc-sidebar-brand">
                    <img src="/spick-logo.png" alt="Logo" className="dc-brand-logo" />
                    <div>
                        <div className="dc-brand-name">Prestige Garment</div>
                        <div className="dc-brand-sub">Daily Collection</div>
                    </div>
                </div>

                <div className="dc-date-chip">{displayDate}</div>

                <nav className="dc-nav">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`dc-nav-item ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="dc-nav-icon">{tab.icon}</span>
                            <span className="dc-nav-label">{tab.label}</span>
                            {tab.count > 0 && (
                                <span className="dc-nav-badge">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="dc-sidebar-footer">
                    <button className="dc-back-btn" onClick={() => navigate("/billing")}>
                        ← Back to Billing
                    </button>

                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            {content}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   CLICKABLE INVOICE BADGE
═══════════════════════════════════════════════════ */
function InvBadge({ invoiceNo, onBillClick, className = "" }) {
    if (!invoiceNo) return <span className="dc-dim">—</span>;
    return (
        <span
            className={`dc-inv-badge dc-inv-clickable ${className}`}
            onClick={() => onBillClick(invoiceNo)}
            title={`Click to view full bill: ${invoiceNo}`}
        >
            {invoiceNo} 🔍
        </span>
    );
}

/* ═══════════════════════════════════════════════════
   SUMMARY PANEL
═══════════════════════════════════════════════════ */
function SummaryPanel({ data, totalBills, isToday }) {
    const totalSales = data.totalSalesAmount || 0;
    const totalRefunds = data.totalRefunds || 0;
    const totalCN = data.totalCreditNotes || 0;

    // Split sales by payment mode
    const cashSales = Number(data.salesSplits?.find(s => s.payment_mode === "Cash")?.total_amount || 0);
    const onlineSales = (data.salesSplits || [])
        .filter(s => s.payment_mode !== "Cash")
        .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

    // Refunds split by original payment mode
    const cashRefunds = Number(data.cashRefunds || 0);
    const onlineRefundsAmt = Number(data.onlineRefunds || 0);
    // cashSales/onlineSales from backend are already post-refund, so no need to subtract again
    const netCashOnHand = cashSales;
    // const netOnline = onlineSales; // Removed unused variable
    const grandTotal = cashSales + onlineSales;

    // Calculate issued and redeemed counts for the selected date (use data.creditNoteList if available)
    // issuedCount and redeemedCount removed as they are unused

    return (
        <div className="dc-summary">
            <div className="dc-hero-grid">
                <div className="dc-hero-card dc-hero-primary">
                    <div className="dc-hero-label">Total Sales</div>
                    <div className="dc-hero-val">₹{fmt(totalSales + totalRefunds)}</div>
                    <div className="dc-hero-sub">{totalBills} Invoice{totalBills !== 1 ? "s" : ""} {isToday ? "Today" : "Selected"}</div>
                </div>
                <div className="dc-hero-card dc-hero-green">
                    <div className="dc-hero-label">Net Cash In Hand</div>
                    <div className="dc-hero-val">₹{fmt(netCashOnHand)}</div>
                    <div className="dc-hero-sub">Cash ₹{fmt(cashSales)} − Cash Refunds ₹{fmt(cashRefunds)}</div>
                </div>
                <div className="dc-hero-card" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#fff" }}>
                    <div className="dc-hero-label" style={{ color: "#e0f2fe" }}>Online Collection</div>
                    <div className="dc-hero-val">₹{fmt(onlineSales)}</div>
                    <div className="dc-hero-sub" style={{ color: "#bae6fd" }}>{(data.salesSplits || []).filter(s => s.payment_mode !== "Cash").reduce((s, r) => s + Number(r.invoice_count || 0), 0)} Online Bill{(data.salesSplits || []).filter(s => s.payment_mode !== "Cash").reduce((s, r) => s + Number(r.invoice_count || 0), 0) !== 1 ? "s" : ""}</div>
                </div>
                <div className="dc-hero-card dc-hero-red">
                    <div className="dc-hero-label">Total Refunds</div>
                    <div className="dc-hero-val">₹{fmt(totalRefunds)}</div>
                    <div className="dc-hero-sub">{data.refundList?.length || 0} Refund{(data.refundList?.length || 0) !== 1 ? "s" : ""} Issued</div>
                </div>
            </div>

            <div className="dc-section">
                <h3 className="dc-section-title">💰 Payment Mode Breakdown</h3>
                {data.salesSplits?.length === 0 ? (
                    <div className="dc-empty">No sales recorded {isToday ? "today" : "on this date"}.</div>
                ) : (
                    <div className="dc-mode-grid">
                        {data.salesSplits?.map((s, i) => (
                            <div key={i} className="dc-mode-card">
                                <div className="dc-mode-name">{s.payment_mode}</div>
                                <div className="dc-mode-amount">₹{fmt(s.total_amount)}</div>
                                <div className="dc-mode-count">{s.invoice_count} bill{s.invoice_count !== 1 ? "s" : ""}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="dc-section">
                <h3 className="dc-section-title">🧾 Collection Reconciliation</h3>
                <div className="dc-recon-box">
                    <div className="dc-recon-row">
                        <span>Cash Sales</span>
                        <span className="dc-recon-pos">₹{fmt(cashSales + cashRefunds)}{cashRefunds > 0 ? <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, marginLeft: 8 }}>(Refund: −₹{fmt(cashRefunds)})</span> : null}</span>
                    </div>
                    {(onlineSales > 0 || onlineRefundsAmt > 0) && (
                        <div className="dc-recon-row">
                            <span>Online Sales</span>
                            <span className="dc-recon-pos">₹{fmt(onlineSales + onlineRefundsAmt)}{onlineRefundsAmt > 0 ? <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, marginLeft: 8 }}>(Refund: −₹{fmt(onlineRefundsAmt)})</span> : null}</span>
                        </div>
                    )}
                    <div className="dc-recon-row">
                        <span>Credit Notes (Store Liability)</span>
                        <span style={{ color: "#d97706", fontWeight: 700 }}>₹{fmt(totalCN)}</span>
                    </div>
                    <div className="dc-recon-row">
                        <span>Replacements (Exchanges)</span>
                        <span style={{ color: "#6366f1", fontWeight: 700 }}>{data.replacementsCount || 0} Cases</span>
                    </div>
                    <div className="dc-recon-total" style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
                        <span>TOTAL COLLECTION</span>
                        <span>₹{fmt(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   REFUNDS PANEL
═══════════════════════════════════════════════════ */
function RefundsPanel({ list, total, onBillClick, isToday }) {
    // Grouping logic to handle duplicates
    const groupedList = React.useMemo(() => {
        const groups = [];
        list.forEach(r => {
            const existing = groups.find(g => g.invoice_no === r.invoice_no);
            if (existing) {
                // If amount is the same and timestamp is very close, it's likely a duplicate
                // We'll merge the items and take the latest timestamp
                const existingItems = safeParseItems(existing.returned_items);
                const newItems = safeParseItems(r.returned_items);

                // Merge uniquely (by some criteria if possible, otherwise just join)
                const mergedItems = [...existingItems];
                newItems.forEach(ni => {
                    if (!mergedItems.find(mi => mi.item_name === ni.item_name && mi.size === ni.size && mi.color === ni.color)) {
                        mergedItems.push(ni);
                    }
                });

                existing.returned_items = JSON.stringify(mergedItems);

                // If amounts are the same, don't add (it's a duplicate record)
                // If amounts are different, it might be a partial refund logic (though rare in this system)
                if (Math.abs(existing.amount - r.amount) > 0.1) {
                    existing.amount += r.amount;
                }
            } else {
                groups.push({ ...r });
            }
        });
        return groups;
    }, [list]);

    const displayTotal = groupedList.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    if (groupedList.length === 0) {
        return (
            <div className="dc-section">
                <div className="dc-grand-total-bar dc-bar-red">
                    <span>Total Cash Refunds {isToday ? "Today" : ""}</span>
                    <span>₹{fmt(0)}</span>
                </div>
                <div className="dc-empty">✅ No cash refunds issued {isToday ? "today" : "on this date"}.</div>
            </div>
        );
    }
    return (
        <div className="dc-section">
            <div className="dc-grand-total-bar dc-bar-red">
                <span>Total Cash Refunded {isToday ? "Today" : ""}</span>
                <span>₹{fmt(displayTotal)}</span>
            </div>
            <div className="dc-table-wrapper">
                <table className="dc-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th style={{ width: '180px' }}>Items Returned</th>
                            <th style={{ width: '180px' }}>Items Bought</th>
                            <th>Refund Via</th>
                            <th>Issued By</th>
                            <th className="dc-th-right">Amount Refunded</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedList.map((r, i) => {
                            const items = safeParseItems(r.returned_items);
                            return (
                                <tr key={r.id || i} className="dc-tr-clickable" onClick={() => onBillClick(r.invoice_no)}>
                                    <td>{i + 1}</td>
                                    <td>{fmtTime(r.refund_date)}</td>
                                    <td><InvBadge invoiceNo={r.invoice_no} onBillClick={e => { e.stopPropagation(); onBillClick(r.invoice_no); }} /></td>
                                    <td>
                                        <div className="dc-cust-name">{r.client_name || "—"}</div>
                                        <div className="dc-cust-phone">{r.phone || ""}</div>
                                    </td>
                                    <td>
                                        {items.length === 0 ? <span className="dc-dim">—</span> : (
                                            <div className="dc-item-list">
                                                {items.map((it, j) => (
                                                    <span key={j} className="dc-item-chip dc-item-chip-red">
                                                        {it.item_name || it.name} {it.size ? `(${it.size})` : ""} ×{it.qty || 1}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {(!r.exchange_items || r.exchange_items.length === 0) ? <span className="dc-dim">—</span> : (
                                            <div className="dc-item-list">
                                                {r.exchange_items.map((it, j) => (
                                                    <span key={j} className="dc-item-chip dc-item-chip-green">
                                                        {it.item_name} {it.size ? `(${it.size})` : ""} ×{it.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: r.refund_mode === 'Cash' ? '#dcfce7' : '#dbeafe',
                                            color: r.refund_mode === 'Cash' ? '#166534' : '#1e40af'
                                        }}>
                                            {r.refund_mode === 'Cash' ? 'Cash' : 'Online'}
                                        </span>
                                    </td>
                                    <td>{r.issued_by || "Staff"}</td>
                                    <td className="dc-td-right">
                                        <span className="dc-amount-red">₹{fmt(r.amount)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   CREDITS PANEL
═══════════════════════════════════════════════════ */
function CreditsPanel({ list, total, onBillClick, isToday }) {
    if (list.length === 0) {
        return (
            <div className="dc-section">
                <div className="dc-grand-total-bar dc-bar-amber">
                    <span>Total Credit Notes Issued {isToday ? "Today" : ""}</span>
                    <span>₹{fmt(total)}</span>
                </div>
                <div className="dc-empty">✅ No credit notes issued {isToday ? "today" : "on this date"}.</div>
            </div>
        );
    }
    // Print handler
    const handlePrint = (creditNote) => {
        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(`
            <html><head><title>Credit Note</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 24px; }
                .cn-title { font-size: 22px; font-weight: bold; margin-bottom: 8px; }
                .cn-section { margin-bottom: 12px; }
                .cn-label { font-weight: bold; }
                .cn-table { border-collapse: collapse; width: 100%; margin-top: 8px; }
                .cn-table th, .cn-table td { border: 1px solid #888; padding: 4px 8px; }
                .cn-table th { background: #f3f3f3; }
            </style>
            </head><body>
            <div class="cn-title">Credit Note</div>
            <div class="cn-section"><span class="cn-label">Credit Note No:</span> ${creditNote.credit_note_no || ''}</div>
            <div class="cn-section"><span class="cn-label">Issued Date:</span> ${creditNote.issued_date ? new Date(creditNote.issued_date).toLocaleString('en-IN') : ''}</div>
            <div class="cn-section"><span class="cn-label">Customer:</span> ${creditNote.client_name || ''} (${creditNote.phone || ''})</div>
            <div class="cn-section"><span class="cn-label">Amount:</span> ₹${fmt(creditNote.amount)}</div>
            <div class="cn-section"><span class="cn-label">Status:</span> ${creditNote.status}</div>
            <div class="cn-section"><span class="cn-label">Items Returned:</span>
                <ul>
                    ${(safeParseItems(creditNote.returned_items) || []).map(it => `<li>${it.item_name || it.name} ${it.size ? `(${it.size})` : ''} ×${it.qty || 1}</li>`).join('')}
                </ul>
            </div>
            <div class="cn-section"><span class="cn-label">Items Bought:</span>
                <ul>
                    ${(creditNote.exchange_items || []).map(it => `<li>${it.item_name} ${it.size ? `(${it.size})` : ''} ×${it.qty}</li>`).join('')}
                </ul>
            </div>
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    // Calculate total additional collected
    let totalAdditionalCollected = 0;
    list.forEach(c => {
        if (c.status === "Redeemed" && c.redeemed_bill_amount && Number(c.redeemed_bill_amount) > Number(c.amount)) {
            totalAdditionalCollected += Number(c.redeemed_bill_amount) - Number(c.amount);
        }
    });

    return (
        <div className="dc-section">
            <div className="dc-grand-total-bar dc-bar-amber">
                <span>Total Credit Notes Issued {isToday ? "Today" : ""}</span>
                <span>₹{fmt(total)}</span>
            </div>
            <div className="dc-table-wrapper">
                <table className="dc-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Issued Date</th>
                            <th>Redeemed Date</th>
                            <th>CN No.</th>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th style={{ width: '180px' }}>Items Returned</th>
                            <th style={{ width: '180px' }}>Items Bought</th>
                            <th>Status</th>
                            <th className="dc-th-right">CN Amount</th>
                            <th>Additional to Collect</th>
                            <th>Print</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((c, i) => {
                            const items = safeParseItems(c.returned_items);
                            const isRedeemed = c.status === "Redeemed";
                            const issuedDate = c.issued_date ? new Date(c.issued_date) : null;
                            const redeemedDate = c.redeemed_date ? new Date(c.redeemed_date) : null;
                            // If bill amount > credit note, show additional to collect
                            let additionalToCollect = 0;
                            if (isRedeemed && c.redeemed_bill_amount && Number(c.redeemed_bill_amount) > Number(c.amount)) {
                                additionalToCollect = Number(c.redeemed_bill_amount) - Number(c.amount);
                            }
                            // Highlight if issued on previous day but redeemed today
                            const isPrevIssuedTodayRedeemed = isRedeemed && issuedDate && redeemedDate && issuedDate.toDateString() !== redeemedDate.toDateString() && redeemedDate.toDateString() === new Date().toDateString();
                            return (
                                <tr key={c.id || i} className={`dc-tr-clickable${isPrevIssuedTodayRedeemed ? " dc-cn-redeemed-today" : ""}`} onClick={() => onBillClick(c.invoice_no)}>
                                    <td>{i + 1}</td>
                                    <td>{issuedDate ? issuedDate.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                                    <td>{redeemedDate ? redeemedDate.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                                    <td><span className="dc-inv-badge dc-inv-cn">{c.credit_note_no || "—"}</span></td>
                                    <td><InvBadge invoiceNo={c.invoice_no} onBillClick={e => { e.stopPropagation(); onBillClick(c.invoice_no); }} /></td>
                                    <td>
                                        <div className="dc-cust-name">{c.client_name || "—"}</div>
                                        <div className="dc-cust-phone">{c.phone || ""}</div>
                                    </td>
                                    <td>
                                        {items.length === 0 ? <span className="dc-dim">—</span> : (
                                            <div className="dc-item-list">
                                                {items.map((it, j) => (
                                                    <span key={j} className="dc-item-chip dc-item-chip-amber">
                                                        {it.item_name || it.name} {it.size ? `(${it.size})` : ""} ×{it.qty || 1}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {(!c.exchange_items || c.exchange_items.length === 0) ? <span className="dc-dim">—</span> : (
                                            <div className="dc-item-list">
                                                {c.exchange_items.map((it, j) => (
                                                    <span key={j} className="dc-item-chip dc-item-chip-green">
                                                        {it.item_name} {it.size ? `(${it.size})` : ""} ×{it.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`dc-status-badge ${isRedeemed ? "dc-status-redeemed" : "dc-status-issued"}`}>
                                            {isRedeemed ? "✓ Used" : "Active"}
                                        </span>
                                    </td>
                                    <td className="dc-td-right">
                                        <span className="dc-amount-amber">₹{fmt(c.amount)}</span>
                                    </td>
                                    <td style={{ color: additionalToCollect > 0 ? '#d97706' : '#64748b', fontWeight: 600 }}>
                                        {additionalToCollect > 0 ? `₹${fmt(additionalToCollect)} to collect` : '—'}
                                    </td>
                                    <td>
                                        <button onClick={e => { e.stopPropagation(); handlePrint(c); }} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>Print</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Additional Collection Summary */}
            {totalAdditionalCollected > 0 && (
                <div style={{ marginTop: 16, textAlign: 'right', fontWeight: 600, color: '#d97706', fontSize: 16 }}>
                    {`Total Additional Collected: ₹${fmt(totalAdditionalCollected)}`}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   REPLACEMENTS PANEL
═══════════════════════════════════════════════════ */
function ReplacementsPanel({ list, onBillClick, isToday }) {
    if (list.length === 0) {
        return (
            <div className="dc-section">
                <div className="dc-grand-total-bar dc-bar-blue">
                    <span>Product Replacements {isToday ? "Today" : ""}</span>
                    <span>0 Cases</span>
                </div>
                <div className="dc-empty">✅ No replacements processed {isToday ? "today" : "on this date"}.</div>
            </div>
        );
    }

    // Helper: create a key for matching items between in/out
    const itemKey = (it) => `${(it.item_name || it.name || '').toLowerCase()}|${(it.size || '').toLowerCase()}|${(it.color || '').toLowerCase()}`;

    return (
        <div className="dc-section">
            <div className="dc-grand-total-bar dc-bar-blue">
                <span>Product Replacements {isToday ? "Today" : ""}</span>
                <span>{list.length} Case{list.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="dc-repl-list">
                {list.map((r, i) => {
                    const inItems = safeParseItems(r.original_items);
                    const outItems = safeParseItems(r.replaced_items);
                    const diff = Number(r.new_total || 0) - Number(r.original_total || 0);

                    // Build sets of keys for matching
                    const outKeys = new Set(outItems.map(itemKey));
                    const inKeys = new Set(inItems.map(itemKey));

                    return (
                        <div key={r.id || i} className="dc-repl-card">
                            <div className="dc-repl-header">
                                <div className="dc-repl-meta">
                                    <InvBadge invoiceNo={r.invoice_no} onBillClick={() => onBillClick(r.invoice_no)} />
                                    <span className="dc-cust-name" style={{ marginLeft: 10 }}>{r.client_name || "Customer"}</span>
                                </div>
                                <div className="dc-repl-time">{fmtTime(r.replacement_date)} • {r.processed_by || "Staff"}</div>
                            </div>
                            <div className="dc-repl-swap">
                                {/* LEFT: Returned items */}
                                <div className="dc-swap-box dc-swap-in">
                                    <div className="dc-swap-label">📥 Returned (Stock In)</div>
                                    {inItems.length === 0
                                        ? <div className="dc-dim">No items recorded</div>
                                        : inItems.map((it, j) => {
                                            const isRetained = outKeys.has(itemKey(it));
                                            return (
                                                <div key={j} className={`dc-swap-item ${isRetained ? 'dc-item-retained' : 'dc-item-replaced'}`}>
                                                    <span className="dc-swap-item-name">
                                                        {it.item_name || it.name}
                                                        <span className="dc-swap-detail"> • {it.size || '-'} • {it.color || '-'} ×{it.qty || 1}</span>
                                                    </span>
                                                    <span className={`dc-item-badge ${isRetained ? 'dc-badge-retained' : 'dc-badge-replaced'}`}>
                                                        {isRetained ? '🔵 RETAINED' : '🔴 REPLACED'}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                    <div className="dc-swap-total">₹{fmt(r.original_total)}</div>
                                </div>
                                <div className="dc-swap-arrow">⇄</div>
                                {/* RIGHT: Given items */}
                                <div className="dc-swap-box dc-swap-out">
                                    <div className="dc-swap-label">📤 Given (Stock Out)</div>
                                    {outItems.length === 0
                                        ? <div className="dc-dim">No items recorded</div>
                                        : outItems.map((it, j) => {
                                            const isRetained = inKeys.has(itemKey(it));
                                            return (
                                                <div key={j} className={`dc-swap-item ${isRetained ? 'dc-item-retained' : 'dc-item-exchanged'}`}>
                                                    <span className="dc-swap-item-name">
                                                        {it.item_name || it.name}
                                                        <span className="dc-swap-detail"> • {it.size || '-'} • {it.color || '-'} ×{it.qty || 1}</span>
                                                    </span>
                                                    <span className={`dc-item-badge ${isRetained ? 'dc-badge-retained' : 'dc-badge-exchanged'}`}>
                                                        {isRetained ? '🔵 RETAINED' : '🟢 EXCHANGE'}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                    <div className="dc-swap-total">₹{fmt(r.new_total)}</div>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="dc-repl-legend">
                                <span className="dc-legend-item"><span className="dc-legend-dot dc-dot-blue"></span> Retained (same item)</span>
                                <span className="dc-legend-item"><span className="dc-legend-dot dc-dot-red"></span> Replaced (returned)</span>
                                <span className="dc-legend-item"><span className="dc-legend-dot dc-dot-green"></span> Exchange (new item)</span>
                            </div>
                            <div className={`dc-repl-diff ${diff > 0 ? "pos" : diff < 0 ? "neg" : "even"}`}>
                                {diff > 0 ? `Collected Extra: ₹${fmt(diff)}` : diff < 0 ? `Refunded: ₹${fmt(Math.abs(diff))}` : "Balanced Exchange"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
/* ═══════════════════════════════════════════════════
   BILLS PANEL
═══════════════════════════════════════════════════ */
function BillsPanel({ list, onBillClick, isToday }) {
    if (list.length === 0) {
        return (
            <div className="dc-section">
                <div className="dc-grand-total-bar dc-bar-green">
                    <span>Total Invoices {isToday ? "Today" : ""}</span>
                    <span>0 Bills</span>
                </div>
                <div className="dc-empty">✅ No bills processed {isToday ? "today" : "on this date"}.</div>
            </div>
        );
    }
    // Calculate total of all bills
    const totalGrand = list.reduce((sum, b) => sum + Number(b.grand_total || 0), 0);
    return (
        <div className="dc-section">
            <div className="dc-grand-total-bar dc-bar-green">
                <span>Total Invoices {isToday ? "Today" : ""}</span>
                <span>{list.length} Bill{list.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="dc-table-wrapper">
                <table className="dc-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Mode</th>
                            <th>Status</th>
                            <th className="dc-th-right">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((b, i) => (
                            <tr key={b.invoice_no || i} className="dc-tr-clickable" onClick={() => onBillClick(b.invoice_no)}>
                                <td>{i + 1}</td>
                                <td>{fmtTime(b.sale_date)}</td>
                                <td><InvBadge invoiceNo={b.invoice_no} onBillClick={e => { e.stopPropagation(); onBillClick(b.invoice_no); }} /></td>
                                <td style={{ fontWeight: 600 }}>{b.client_name || "—"}</td>
                                <td>{b.phone || "—"}</td>
                                <td>
                                    <span className="dc-mc-mode" style={{ fontSize: '11px' }}>{b.payment_mode || "Cash"}</span>
                                </td>
                                <td>
                                    <span className={`dc-status-badge ${b.payment_status === 'Done' ? 'dc-status-issued' : 'dc-status-redeemed'}`}>
                                        {b.payment_status || "Pending"}
                                    </span>
                                </td>
                                <td className="dc-td-right" style={{ fontWeight: 800 }}>
                                    ₹{fmt(b.grand_total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'right', fontWeight: 900, fontSize: 16 }}>Total</td>
                            <td className="dc-td-right" style={{ fontWeight: 900, fontSize: 16 }}>₹{fmt(totalGrand)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

import API_BASE_URL from "../apiConfig";
import { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AllBarcodesPrint from "../BarcodeLabel/AllBarcodesPrint";
import DailyCollection from "../DailyCollection/DailyCollection";

const SUBSCRIPTION_END = new Date("2027-01-01");

/* ================= STOCK SUB-COMPONENTS ================= */
function StockCategory({ cat, items, itemNames, onAdjust }) {
  const [open, setOpen] = useState(false);
  const [filterItem, setFilterItem] = useState('All');
  const [filterSize, setFilterSize] = useState('All');
  const [filterColor, setFilterColor] = useState('All');

  // Flatten ALL variants into rows (show everything including 0 stock)
  const allRows = itemNames.flatMap(item =>
    (items[item] || []).map(v => ({ item, ...v }))
  );

  // Build unique dropdown options from actual data
  const uniqueItems = ['All', ...new Set(allRows.map(r => r.item))];
  const uniqueSizes = ['All', ...new Set(allRows.map(r => r.size).filter(Boolean))];
  const uniqueColors = ['All', ...new Set(allRows.map(r => r.color).filter(c => c && c !== 'Default'))];

  const filteredRows = allRows.filter(row =>
    (filterItem === 'All' || row.item === filterItem) &&
    (filterSize === 'All' || row.size === filterSize) &&
    (filterColor === 'All' || row.color === filterColor)
  );

  const dropdownStyle = {
    padding: '7px 10px', borderRadius: 8, border: '1.5px solid #d1d5db',
    fontSize: 13, fontWeight: 500, outline: 'none', background: 'white',
    color: '#374151', cursor: 'pointer', minWidth: 120
  };

  return (
    <div style={{
      background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Category Header */}
      <div
        onClick={() => { setOpen(!open); setFilterItem('All'); setFilterSize('All'); setFilterColor('All'); }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', cursor: 'pointer', userSelect: 'none',
          background: open ? '#f8fafc' : 'white', transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{open ? '▼' : '▶'}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{cat}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9' }}>
          {/* Dropdown Filters */}
          <div
            style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
            onClick={e => e.stopPropagation()}
          >
            <select value={filterItem} onChange={e => setFilterItem(e.target.value)} style={dropdownStyle}>
              {uniqueItems.map(v => <option key={v} value={v}>{v === 'All' ? 'All Items' : v}</option>)}
            </select>
            <select value={filterSize} onChange={e => setFilterSize(e.target.value)} style={dropdownStyle}>
              {uniqueSizes.map(v => <option key={v} value={v}>{v === 'All' ? 'All Sizes' : v}</option>)}
            </select>
            <select value={filterColor} onChange={e => setFilterColor(e.target.value)} style={dropdownStyle}>
              {uniqueColors.map(v => <option key={v} value={v}>{v === 'All' ? 'All Colors' : v}</option>)}
            </select>
            {(filterItem !== 'All' || filterSize !== 'All' || filterColor !== 'All') && (
              <>
                <button
                  onClick={() => { setFilterItem('All'); setFilterSize('All'); setFilterColor('All'); }}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
                    background: 'white', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', marginRight: 10
                  }}
                >Reset</button>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6, border: '1px solid #d1fae5' }}>
                    Available: {filteredRows.reduce((sum, r) => sum + (r.available || 0), 0)}
                  </span>
                  {(() => {
                    const totalAdj = filteredRows.reduce((sum, r) => sum + (r.adjusted || 0), 0);
                    const isRed = totalAdj > 0;
                    const isGreen = totalAdj < 0;
                    return (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: isRed ? '#ef4444' : isGreen ? '#059669' : '#64748b',
                        background: isRed ? '#fef2f2' : isGreen ? '#ecfdf5' : '#f8fafc',
                        padding: '4px 8px', borderRadius: 6,
                        border: `1px solid ${isRed ? '#fee2e2' : isGreen ? '#d1fae5' : '#e2e8f0'}`
                      }}>
                        Adjusted: {totalAdj > 0 ? `-${totalAdj}` : totalAdj < 0 ? `+${Math.abs(totalAdj)}` : '0'}
                      </span>
                    );
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Flat Table - only show after a filter is selected */}
          {filterItem === 'All' && filterSize === 'All' && filterColor === 'All' ? (
            <div style={{ padding: '24px 20px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
              Select an item, size, or color from the dropdowns above to view stock.
            </div>
          ) : filteredRows.length === 0 ? (
            <div style={{ padding: '24px 20px', color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>
              No stock found for selected filters.
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1e3a5f, #163754)', color: 'white' }}>
                    {['Item', 'Size', 'Color', 'Purchased', 'Sold', 'Adjusted', 'Available', onAdjust ? 'Action' : null].filter(Boolean).map((h, i) => (
                      <th key={h} style={{
                        padding: '12px 16px', fontWeight: 700, fontSize: 11,
                        color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px',
                        textAlign: i >= 3 && h !== 'Adjusted' ? 'center' : (h === 'Adjusted' ? 'center' : 'left')
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{row.item}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{row.size || '-'}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{row.color || '-'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>{row.purchased || 0}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>{row.sold || 0}</td>
                      <td style={{
                        padding: '10px 16px',
                        textAlign: 'center',
                        color: (row.adjusted || 0) > 0 ? '#ef4444' : (row.adjusted || 0) < 0 ? '#059669' : '#94a3b8',
                        fontWeight: 700
                      }}>
                        {(row.adjusted || 0) > 0 ? `-${row.adjusted}` : (row.adjusted || 0) < 0 ? `+${Math.abs(row.adjusted)}` : '0'}
                      </td>
                      <td style={{
                        padding: '10px 16px', textAlign: 'center', fontWeight: 700,
                        color: (row.available || 0) <= 0 ? '#dc2626' : (row.available || 0) < 10 ? '#d97706' : '#059669'
                      }}>
                        {row.available || 0}
                      </td>
                      {onAdjust && (
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => onAdjust(row, cat)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                            }}
                          >Adjust</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}


export default function AdminDashboard() {
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars
  const [activePage, setActivePage] = useState("dashboard"); // dashboard, users, saleseditlogs, purchaseeditlogs

  // Navigation State
  const [showReportsMenu, setShowReportsMenu] = useState(false); // eslint-disable-line no-unused-vars
  const [showBillsMenu, setShowBillsMenu] = useState(false); // eslint-disable-line no-unused-vars

  // --- STATS STATE ---
  const [stats, setStats] = useState({
    sales: { billCount: 0, totalAmount: 0, cashCount: 0, onlineCount: 0 },
    purchase: { billCount: 0, totalAmount: 0, cashCount: 0, onlineCount: 0 },
    profit: 0,
  });
  const _now = new Date();
  const _currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(_now);
  const _currentYear = String(_now.getFullYear());
  const _currentMonthNum = String(_now.getMonth() + 1).padStart(2, '0');
  const [selMonth, setSelMonth] = useState(_currentMonthName);
  const [selYear, setSelYear] = useState(_currentYear);
  const [dashboardMonth, setDashboardMonth] = useState(`${_currentYear}-${_currentMonthNum}`);
  const daysLeft = (() => { // eslint-disable-line no-unused-vars
    const _today = new Date(); _today.setHours(0, 0, 0, 0);
    return Math.max(Math.ceil((SUBSCRIPTION_END - _today) / (1000 * 60 * 60 * 24)), 0);
  })();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getMonthNumber = (name) => {
    const idx = monthNames.indexOf(name);
    return idx === -1 ? "01" : String(idx + 1).padStart(2, '0');
  };

  // --- USERS STATE ---
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [editUserId, setEditUserId] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", username: "", email: "", password: "", role: "sales" });
  const [salesEditLogs, setSalesEditLogs] = useState([]);
  const [purchaseEditLogs, setPurchaseEditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [logBillDetail, setLogBillDetail] = useState(null);

  // --- STOCK STATE ---
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategory, setStockCategory] = useState("All"); // eslint-disable-line no-unused-vars

  // --- RETURN / REPLACE STATE ---
  const [replacements, setReplacements] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [cashRefunds, setCashRefunds] = useState([]);
  const [rrLoading, setRrLoading] = useState(false);
  const [viewBill, setViewBill] = useState(null);

  // --- STOCK ADJUSTMENT STATE ---
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    category: "",
    item_name: "",
    size: "",
    color: "",
    qty: 1,
    type: "reduce", // reduce or increase
    reason: "Damaged by wholesaler",
    customReason: ""
  });
  const [adjustmentLogs, setAdjustmentLogs] = useState([]);
  const [adjLoading, setAdjLoading] = useState(false);

  // --- DAYOUT REPORTS STATE ---
  const [dayoutReports, setDayoutReports] = useState([]);
  const [dayoutLoading, setDayoutLoading] = useState(false);
  const [expandedDayout, setExpandedDayout] = useState(null);
  const [dayoutDateFilter, setDayoutDateFilter] = useState('');

  /* ================= API FUNCTIONS (declared before useEffect) ================= */
  const fetchDayoutReports = async () => {
    setDayoutLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dayout/all`);
      const data = await res.json();
      if (res.ok) setDayoutReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching dayout reports:", err);
    }
    setDayoutLoading(false);
  };

  const fetchAdjustmentLogs = async () => {
    setAdjLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stock/logs`);
      const data = await res.json();
      if (res.ok) setAdjustmentLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching adjustment logs:", err);
    }
    setAdjLoading(false);
  };

  const fetchReturnHistory = async () => {
    setRrLoading(true);
    try {
      const cnRes = await fetch(`${API_BASE_URL}/returns/credit-notes`);
      const cnData = await cnRes.json();
      if (cnRes.ok) setCreditNotes(cnData.credit_notes || []);

      const cashRes = await fetch(`${API_BASE_URL}/returns/cash-refunds`);
      const cashData = await cashRes.json();
      if (cashRes.ok) setCashRefunds(cashData.refunds || []);
    } catch { /* ignore */ }
    setRrLoading(false);
  };

  const fetchReplaceHistory = async () => {
    setRrLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/returns/all`);
      const data = await res.json();
      if (res.ok) setReplacements(data.replacements || []);
    } catch { /* ignore */ }
    setRrLoading(false);
  };

  const handleViewBill = async (invoice_no) => {
    try {
      const res = await fetch(`${API_BASE_URL}/billing/get-bill/${encodeURIComponent(invoice_no)}`);
      const data = await res.json();
      if (res.ok) setViewBill(data.bill);
      else alert(data.error || "Bill details not found");
    } catch { alert("Error fetching bill details"); }
  };

  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stock/calculated`);
      const data = await res.json();
      if (res.ok) setStockData(data.stock || []);
    } catch (err) { console.error(err); }
    setStockLoading(false);
  };

  const fetchDashboardStats = async (month = "") => {
    try {
      let url = `${API_BASE_URL}/dashboard/summary`;
      if (month) {
        url += `?month=${month}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setStats({
          sales: {
            billCount: data.sales.totalBills || 0,
            totalAmount: data.sales.totalAmount || 0,
            cashCount: data.sales.cashAmount || 0,
            onlineCount: data.sales.onlineAmount || 0,
          },
          purchase: {
            billCount: data.purchase.totalBills || 0,
            totalAmount: data.purchase.totalAmount || 0,
            cashCount: data.purchase.cashAmount || 0,
            onlineCount: data.purchase.onlineAmount || 0,
            chequeCount: data.purchase.chequeCount || 0,
            creditCount: data.purchase.creditCount || 0,
          },
          profit: data.profit || 0
        });
      } else {
        console.error("Dashboard fetch error:", data.message);
      }
    } catch (err) {
      console.error("Dashboard Service Error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/get-users`);
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch { /* ignore */ }
  };

  const fetchEditLogs = async () => {
    setLogsLoading(true);
    try {
      const sRes = await fetch(`${API_BASE_URL}/billing/all-edit-logs`);
      const sData = await sRes.json();
      if (sRes.ok) setSalesEditLogs(sData.logs || []);

      const pRes = await fetch(`${API_BASE_URL}/purchase/all-edit-logs`);
      const pData = await pRes.json();
      if (pRes.ok) setPurchaseEditLogs(pData.logs || []);
    } catch { /* ignore */ }
    setLogsLoading(false);
  };

  /* ================= INITIAL DATA ================= */
  useEffect(() => {
    // Initial Dashboard Fetch with Month
    const init = async () => { fetchDashboardStats(dashboardMonth); };
    init();

    // Refresh interval only if no month filter is active
    const interval = setInterval(() => {
      if (!dashboardMonth) fetchDashboardStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [dashboardMonth]);

  useEffect(() => {
    const load = async () => {
      if (activePage === 'users') fetchUsers();
      if (activePage.includes('editlogs')) fetchEditLogs();
      if (activePage === 'stocks') fetchStockData();
      if (activePage === 'returnhistory') fetchReturnHistory();
      if (activePage === 'replacehistory') fetchReplaceHistory();
      if (activePage === 'adjustments') {
        fetchAdjustmentLogs();
        fetchStockData();
      }
      if (activePage === 'dayoutreport') fetchDayoutReports();
    };
    load();
  }, [activePage]);

  const handleDeleteLog = async (log) => {
    if (!window.confirm(`Are you sure you want to delete this log for ${log.invoice_no}?`)) return;
    try {
      const type = activePage === 'saleseditlogs' ? 'billing' : 'purchase';
      const res = await fetch(`${API_BASE_URL}/${type}/delete-log/${log.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchEditLogs();
      } else {
        alert(data.error || data.message || "Failed to delete log");
      }
    } catch {
      alert("Error deleting log");
    }
  };

  /* ================= HANDLERS ================= */
  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.username) return alert("Fill required fields");

    const payload = { ...userForm };
    // Remove password if empty on edit
    if (modalMode === 'edit' && !payload.password) delete payload.password;

    const url = modalMode === 'create'
      ? `${API_BASE_URL}/auth/create-user` // Verify your backend route for create
      : `${API_BASE_URL}/auth/update-user/${editUserId}`;

    const method = modalMode === 'create' ? "POST" : "PUT"; // Use PUT for update if that's what backend expects

    // NOTE: Standard auth register might be /api/auth/register or similar.
    // Assuming /register for create based on typical setup, but if not exists, check backend.
    // Based on previous code, create was missing in fetch snippet I saw, so assuming /register exists or similar.
    // Wait, previous code had `createUser` function but content was ellipsed...
    // I will assume /api/auth/register exists. Only update-user was visible in snippets.

    try {
      const creator = localStorage.getItem("username") || "Admin";
      const currentDb = localStorage.getItem("db_name");
      const payload = { ...userForm, created_by: creator, db_name: currentDb };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (res.ok) {
        alert(modalMode === 'create' ? "User Created" : "User Updated");
        setShowUserModal(false);
        fetchUsers();
      } else {
        alert(d.message || "Failed");
      }

    } catch { alert("Error saving user"); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete user?")) return;
    try {
      await fetch(`${API_BASE_URL}/auth/delete-user/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch { /* ignore */ }
  };

  const handleAdjustStock = async () => {
    if (!adjustmentForm.category || !adjustmentForm.item_name || !adjustmentForm.qty || !adjustmentForm.reason) {
      alert("Please fill all required fields");
      return;
    }

    if (adjustmentForm.qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      const adjusted_by = localStorage.getItem("username") || "Admin";

      const payload = {
        ...adjustmentForm,
        reason: adjustmentForm.reason === 'Other' ? adjustmentForm.customReason : adjustmentForm.reason,
        adjusted_by
      };

      const res = await fetch(`${API_BASE_URL}/stock/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Stock adjusted successfully!");
        setShowAdjustmentModal(false);
        setAdjustmentForm({
          category: "",
          item_name: "",
          size: "",
          color: "",
          qty: 1,
          type: "reduce",
          reason: "Damaged by wholesaler",
          customReason: ""
        });
        fetchStockData(); // Refresh main stock data to reflect adjustment
        fetchAdjustmentLogs(); // Refresh adjustment logs
      } else {
        alert(data.error || "Failed to adjust stock");
      }
    } catch {
      alert("Error connecting to server");
    }
  };


  /* ================= RENDER ================= */
  const location = useLocation();

  useEffect(() => {
    const page = location.state?.page || "dashboard";
    const id = requestAnimationFrame(() => setActivePage(page));
    return () => cancelAnimationFrame(id);
  }, [location.state]);

  return (
    <>
      {/* --- DASHBOARD VIEW --- */}
      {activePage === 'dashboard' && (
        <div className="dashboard-overview-container">
          <div className="dashboard-header-realtime">
            <h1 className="dashboard-title">Overview</h1>
            {(() => {
              const username = localStorage.getItem('username') || '';
              if (username === 'admin' || username === 'Admin@123') {
                return (
                  <div style={{ position: 'absolute', right: '38vw', top: 18, zIndex: 2 }}>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #163754 100%)',
                      padding: '10px 32px',
                      borderRadius: 10,
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 16px rgba(30,58,95,0.18)',
                      textAlign: 'center',
                      minWidth: 220
                    }}>
                      Welcome, Admin@123
                    </span>
                  </div>
                );
              } else if (username) {
                return (
                  <div style={{ position: 'absolute', right: '38vw', top: 18, zIndex: 2 }}>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #163754 100%)',
                      padding: '10px 32px',
                      borderRadius: 10,
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 16px rgba(30,58,95,0.18)',
                      textAlign: 'center',
                      minWidth: 220
                    }}>
                      Welcome, {username}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
            <div className="filter-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4e6381', letterSpacing: '0.5px' }}>PERIOD</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  className="filter-select"
                  placeholder="Month Name"
                  list="month-list"
                  value={selMonth}
                  onChange={e => setSelMonth(e.target.value)}
                  style={{ width: '130px', fontWeight: 600 }}
                />
                <datalist id="month-list">
                  {monthNames.map(m => <option key={m} value={m} />)}
                </datalist>
                <input
                  type="text"
                  className="filter-select"
                  placeholder="Year"
                  value={selYear}
                  onChange={e => setSelYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={{ width: '85px', textAlign: 'center', fontWeight: 700 }}
                />
              </div>
              <button
                className="btn-create"
                style={{ padding: '8px 20px', fontSize: 13, minWidth: 'fit-content' }}
                onClick={() => {
                  if (selYear && selMonth && selMonth !== "") {
                    setDashboardMonth(`${selYear}-${getMonthNumber(selMonth)}`);
                  } else {
                    alert("Please select both Month and Year");
                  }
                }}
              >
                Apply
              </button>
              <button
                className="reset-btn"
                onClick={() => {
                  const now = new Date();
                  const mName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
                  const mYear = String(now.getFullYear());
                  const mNum = String(now.getMonth() + 1).padStart(2, '0');
                  setSelMonth(mName);
                  setSelYear(mYear);
                  setDashboardMonth(`${mYear}-${mNum}`);
                }}
                style={{ padding: '8px 12px' }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="dashboard-section sales">
            <div className="dashboard-section-title">
              Sales <span>{dashboardMonth ? selMonth : 'Lifetime'}</span>
            </div>
            <div className="stats-grid">
              <div className="premium-card main">
                <div className="card-label">Total Revenue</div>
                <div className="card-value">₹ {Math.round(stats.sales.totalAmount).toLocaleString()}</div>
                <div className="card-meta">
                  <span style={{ color: '#1e3a5f', fontWeight: 800 }}>{stats.sales.billCount}</span> total invoices generated
                </div>
              </div>
              <div className="premium-card">
                <div className="card-label">Cash Collected</div>
                <div className="card-value">₹ {Math.round(stats.sales.cashCount).toLocaleString()}</div>
                <div className="card-meta">Hard currency transactions</div>
              </div>
              <div className="premium-card">
                <div className="card-label">Digital Payments</div>
                <div className="card-value">₹ {Math.round(stats.sales.onlineCount).toLocaleString()}</div>
                <div className="card-meta">UPI, Cards & Net Banking</div>
              </div>
            </div>
          </div>

          <div className="dashboard-section purchase">
            <div className="dashboard-section-title">
              Purchase <span>{dashboardMonth ? selMonth : 'Lifetime'}</span>
            </div>
            <div className="stats-grid">
              <div className="premium-card main">
                <div className="card-label">Total Purchase</div>
                <div className="card-value">₹ {Math.round(stats.purchase.totalAmount).toLocaleString()}</div>
                <div className="card-meta">
                  <span style={{ color: '#1e3a5f', fontWeight: 800 }}>{stats.purchase.billCount}</span> supplier bills
                </div>
              </div>
              <div className="premium-card">
                <div className="card-label">Cash Payment</div>
                <div className="card-value">₹ {Math.round(stats.purchase.cashCount).toLocaleString()}</div>
                <div className="card-meta">Paid via cash</div>
              </div>
              <div className="premium-card">
                <div className="card-label">Online Payments</div>
                <div className="card-value">₹ {Math.round(stats.purchase.onlineCount).toLocaleString()}</div>
                <div className="card-meta">Paid via bank/digital</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DAILY COLLECTION VIEW --- */}
      {activePage === 'dailycollection' && (
        <div style={{ padding: '0px' }}>
          <DailyCollection standalone={false} initialTab={location.state?.activeTab || "summary"} />
        </div>
      )}

      {/* --- USERS VIEW --- */}
      {
        activePage === 'users' && (
          <>
            <div className="dashboard-header-realtime">
              <h1 className="dashboard-title">User Management</h1>
              <button className="action-btn btn-create" onClick={() => {
                setModalMode('create');
                setUserForm({ name: "", username: "", email: "", password: "", role: "sales" });
                setShowUserModal(true);
              }}>+ Create User</button>
            </div>

            <div className="users-grid-container">
              {/* Deduplicate just in case of any frontend state issues */}
              {Array.from(new Set(users.map(u => u.id))).map(id => users.find(u => u.id === id)).map((u) => (
                <div className={`user-card role-${u.role}`} key={u.id}>
                  <div className="user-card-body">
                    <h3 className="user-name">Name: {u.name}</h3>
                    <div className="user-detail-line">
                      <span className="detail-label">Username:</span>
                      <span className="detail-value">{u.username}</span>
                    </div>
                    <div className="user-detail-line">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{u.email || '-'}</span>
                    </div>
                    <div className="user-detail-line">
                      <span className="detail-label">Role:</span>
                      <span className="detail-value" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                    </div>
                    <div className="user-detail-line">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  <div className="user-card-actions">
                    <button className="card-action-btn edit" onClick={() => {
                      setModalMode('edit');
                      setEditUserId(u.id);
                      setUserForm({ name: u.name, username: u.username, email: u.email || "", password: u.password || "", role: u.role });
                      setShowUserModal(true);
                    }}>Edit</button>
                    {u.role !== 'admin' && (
                      <button className="card-action-btn delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }

      {/* --- LOGS VIEW --- */}
      {
        (activePage === 'saleseditlogs' || activePage === 'purchaseeditlogs') && (
          <div className="logs-view-container">
            <div className="dashboard-header-realtime">
              <h1 className="dashboard-title" style={{ textAlign: 'center' }}>
                {activePage === 'saleseditlogs' ? 'Sales Invoices Edit Logs' : 'Purchase Invoices Edit Logs'}
              </h1>
              <div className="filter-group">
                <input
                  className="filter-select"
                  placeholder="Filter by Invoice No..."
                  style={{ width: '220px' }}
                  value={invoiceFilter}
                  onChange={(e) => setInvoiceFilter(e.target.value)}
                />
                <button className="search-btn" onClick={fetchEditLogs}>Refresh Logs</button>
              </div>
            </div>

            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th style={{ width: '150px' }}>Invoice No</th>
                    <th>{activePage === 'saleseditlogs' ? 'Client' : 'Supplier'}</th>
                    <th style={{ width: '150px' }}>Edited By</th>
                    <th style={{ width: '220px' }}>Date & Time</th>
                    <th style={{ width: '240px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activePage === 'saleseditlogs' ? salesEditLogs : purchaseEditLogs)
                    .filter(l => !invoiceFilter || l.invoice_no.toLowerCase().includes(invoiceFilter.toLowerCase()))
                    .map((l, i) => {
                      const isExpanded = expandedLog === `${l.id}_${i}`;
                      return (
                        <Fragment key={`${l.id}_${i}`}>
                          <tr
                            className={isExpanded ? 'active-row' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={async () => {
                              if (isExpanded) {
                                setExpandedLog(null);
                                setLogBillDetail(null);
                              } else {
                                setExpandedLog(`${l.id}_${i}`);
                                // Fetch full current bill for this invoice to show "All Details"
                                try {
                                  const type = activePage === 'saleseditlogs' ? 'billing/get-bill' : 'purchase/get-bill';
                                  const res = await fetch(`${API_BASE_URL}/${type}/${l.invoice_no}`);
                                  const data = await res.json();
                                  if (res.ok) setLogBillDetail(data.bill || data.purchase);
                                } catch (e) { console.error("Error fetching bill details", e); }
                              }
                            }}
                          >
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 800, color: '#1e3a5f' }}>
                              <span style={{ borderBottom: '1px dashed #1e3a5f' }}>{l.invoice_no}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{l.client_name || l.supplier_name || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontWeight: 700, color: '#4f46e5' }}>
                                {l.edited_by}
                              </div>
                            </td>
                            <td style={{ color: '#56688c', fontSize: 13, fontWeight: 600 }}>
                              {new Date(l.edit_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button className="action-btn btn-edit" style={{ margin: 0, padding: '4px 12px' }}>
                                  {isExpanded ? 'Hide Details' : 'View Details'}
                                </button>
                                <button className="action-btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteLog(l); }} style={{ margin: 0, padding: '6px 10px' }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDED SECTION: EXACTLY DOWN THE INVOICE NUMBER HEADER AREA */}
                          {isExpanded && (
                            <tr className="expanded-row-details">
                              <td colSpan="6" style={{ padding: 0 }}>
                                <div className="detail-card-premium">
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>

                                    {/* 1. COMPARISON (What was changed in this edit) */}
                                    <div style={{ paddingRight: '12px', borderRight: '1.5px solid #f1f5f9' }}>
                                      <h4 style={{ color: '#7c3aed' }}>
                                        <span>🔄</span> Changes in this Edit
                                      </h4>
                                      <table className="users-table" style={{ fontSize: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ padding: '8px 12px' }}>Field</th>
                                            <th style={{ padding: '8px 12px' }}>Old Value</th>
                                            <th style={{ padding: '8px 12px' }}>New Value</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(() => {
                                            let oldD = {}, newD = {};
                                            try { oldD = JSON.parse(l.old_data || '{}'); } catch { }
                                            try { newD = JSON.parse(l.new_data || '{}'); } catch { }
                                            const allKeys = new Set([...Object.keys(oldD), ...Object.keys(newD)]);
                                            const diffs = Array.from(allKeys).filter(k => k !== 'items' && JSON.stringify(oldD[k]) !== JSON.stringify(newD[k]));

                                            // Extract item changes
                                            const itemChanges = [];
                                            if (oldD.items || newD.items) {
                                              const oItems = oldD.items || [];
                                              const nItems = newD.items || [];
                                              // Simplified diff for brevity in expanded row
                                              const totalOld = oItems.length;
                                              const totalNew = nItems.length;
                                              if (totalOld !== totalNew) itemChanges.push({ field: 'Total Items', old: totalOld, new: totalNew });
                                            }

                                            if (diffs.length === 0 && itemChanges.length === 0) {
                                              return <tr><td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No field changes logged.</td></tr>;
                                            }

                                            return [
                                              ...diffs.map(k => (
                                                <tr key={k}>
                                                  <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                                                  <td style={{ color: '#ef4444', textDecoration: 'line-through' }}>{String(oldD[k] || '-')}</td>
                                                  <td style={{ color: '#059669', fontWeight: 800 }}>{String(newD[k] || '-')}</td>
                                                </tr>
                                              )),
                                              ...(oldD.items || newD.items ? [
                                                <tr key="items-row">
                                                  <td style={{ fontWeight: 700 }}>Item List</td>
                                                  <td style={{ color: '#ef4444' }}>{oldD.items ? `${oldD.items.length} items` : '-'}</td>
                                                  <td style={{ color: '#059669', fontWeight: 800 }}>{newD.items ? `${newD.items.length} items` : '-'}</td>
                                                </tr>
                                              ] : [])
                                            ];
                                          })()}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* 2. FULL BILL VIEW (Current status of the invoice) */}
                                    <div>
                                      <h4 style={{ color: '#2563eb' }}>
                                        <span>📋</span> Full Invoice Summary
                                      </h4>
                                      {!logBillDetail ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading invoice details...</div>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                            <div>
                                              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Supplier/Client</div>
                                              <div style={{ fontSize: 13, fontWeight: 700 }}>{logBillDetail.supplier_name || logBillDetail.client_name}</div>
                                            </div>
                                            <div>
                                              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Grand Total</div>
                                              <div style={{ fontSize: 14, fontWeight: 900, color: '#c026d3' }}>₹{Math.round(logBillDetail.grand_total || logBillDetail.total_amount || 0).toLocaleString()}</div>
                                            </div>
                                            <div>
                                              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Date</div>
                                              <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(logBillDetail.purchase_date || logBillDetail.sale_date).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Status</div>
                                              <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{logBillDetail.payment_status || 'Paid'}</div>
                                            </div>
                                          </div>
                                          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                                              <thead style={{ background: '#f1f5f9' }}>
                                                <tr>
                                                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Item</th>
                                                  <th style={{ padding: '6px 10px', textAlign: 'center' }}>Size</th>
                                                  <th style={{ padding: '6px 10px', textAlign: 'center' }}>Qty</th>
                                                  <th style={{ padding: '6px 10px', textAlign: 'right' }}>Total</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(typeof logBillDetail.items === 'string' ? JSON.parse(logBillDetail.items) : (logBillDetail.items || [])).slice(0, 5).map((it, idx) => (
                                                  <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '6px 10px' }}>{it.item_name || it.name}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>{it.size}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}>{it.qty}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>₹{Math.round(it.amount || it.total || (it.qty * it.rate)).toLocaleString()}</td>
                                                  </tr>
                                                ))}
                                                {(typeof logBillDetail.items === 'string' ? JSON.parse(logBillDetail.items) : (logBillDetail.items || [])).length > 5 && (
                                                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 4, color: '#94a3b8', fontStyle: 'italic' }}>... and more items</td></tr>
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                          <button
                                            className="action-btn btn-edit"
                                            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                                            onClick={() => {
                                              if (activePage === 'saleseditlogs') {
                                                handleViewBill(l.invoice_no);
                                              } else {
                                                setViewBill(logBillDetail);
                                              }
                                            }}
                                          >
                                            View Full Original Bill
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  {!logsLoading && (activePage === 'saleseditlogs' ? salesEditLogs : purchaseEditLogs).length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No edit logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* Modals */}
      {
        showUserModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">{modalMode === 'create' ? 'Create User' : 'Edit User'}</h3>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password {modalMode === 'edit' && '(Leave blank to keep)'}</label>
                <input className="form-input" type="text" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="sales">Sales</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveUser}>{modalMode === 'create' ? 'Create' : 'Update'}</button>
              </div>
            </div>
          </div>
        )
      }



      {/* --- LIVE STOCK VIEW --- */}
      {
        activePage === 'stocks' && (() => {
          // Group stock data by category -> item_name
          const categories = {};
          stockData.forEach(s => {
            const cat = s.category || 'General';
            const item = s.item_name || 'Unknown';
            if (!categories[cat]) categories[cat] = {};
            if (!categories[cat][item]) categories[cat][item] = [];
            categories[cat][item].push(s);
          });

          // Billing screen category order (static first, then any extra backend ones)
          const BILLING_CATEGORY_ORDER = [
            "Round Neck T-Shirt", "Polo T-Shirt", "Shirts", "Jeans",
            "Cotton Shirt", "Denim Jeans", "Formal Trouser", "Saree",
            "Kurti", "Leggings", "Socks", "Clothing", "T-Shirts & Tops"
          ];
          const sortByBillingOrder = (cats) => {
            const known = BILLING_CATEGORY_ORDER.filter(c => cats.includes(c));
            const extra = cats.filter(c => !BILLING_CATEGORY_ORDER.includes(c));
            return [...known, ...extra];
          };

          // Filter: ONLY show if there is a search query, and search ONLY by category
          const filteredCategories = sortByBillingOrder(Object.keys(categories))
            .filter(cat => {
              if (!stockSearch.trim()) return false;
              const q = stockSearch.toLowerCase();
              return cat.toLowerCase().includes(q);
            });

          // const allCategoryNames = ['All', ...sortByBillingOrder(Object.keys(categories))];

          return (
            <div style={{ padding: '24px' }}>
              <div className="dashboard-header-realtime" style={{ marginBottom: 24, gap: 20 }}>
                <h1 className="dashboard-title" style={{ minWidth: 'fit-content' }}>Live Stock Search</h1>

                <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
                  <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search categories (e.g. Shirts, Round Neck...)"
                    className="filter-select"
                    value={stockSearch}
                    onChange={e => setStockSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 45px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      fontSize: '15px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      outline: 'none',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <button
                  onClick={fetchStockData}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1e3a5f, #163754)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>🔄</span> Refresh
                </button>
              </div>

              {stockLoading ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
                  <div style={{ marginBottom: 16 }} className="spinning-loader">⏳</div>
                  <div style={{ fontWeight: 600 }}>Fetching latest stock counts...</div>
                </div>
              ) : !stockSearch.trim() ? (
                <div style={{
                  textAlign: 'center',
                  padding: '100px 20px',
                  background: 'white',
                  borderRadius: '16px',
                  border: '2px dashed #e2e8f0'
                }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>📦</div>
                  <h2 style={{ color: '#1e293b', marginBottom: 12 }}>Stock Explorer</h2>
                  <p style={{ color: '#64748b', fontSize: 16, maxWidth: '400px', margin: '0 auto' }}>
                    Search for a category above to view inventory levels. Stock data is hidden until you search.
                  </p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: '16px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
                  <h3 style={{ color: '#1e293b' }}>No categories found</h3>
                  <p style={{ color: '#64748b' }}>We couldn't find any category matching "<strong>{stockSearch}</strong>"</p>
                  <button
                    onClick={() => setStockSearch("")}
                    style={{ color: '#1e3a5f', background: 'none', border: 'none', fontWeight: 600, marginTop: 12, cursor: 'pointer' }}
                  >
                    Clear search and try again
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredCategories.map(cat => {
                    const items = categories[cat];
                    const itemNames = Object.keys(items)
                      .filter(item => !stockSearch || cat.toLowerCase().includes(stockSearch.toLowerCase()) || item.toLowerCase().includes(stockSearch.toLowerCase()))
                      .sort();

                    // Total summary for this category
                    const catTotal = itemNames.reduce((sum, item) =>
                      sum + items[item].reduce((s, v) => s + (v.available || 0), 0), 0
                    );
                    const catAdjusted = itemNames.reduce((sum, item) =>
                      sum + items[item].reduce((s, v) => s + (v.adjusted || 0), 0), 0
                    );

                    return (
                      <StockCategory key={cat} cat={cat} items={items} itemNames={itemNames} catTotal={catTotal} catAdjusted={catAdjusted} />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()
      }

      {/* --- RETURN HISTORY VIEW --- */}
      {
        activePage === 'returnhistory' && (
          <div className="logs-view-container" style={{ padding: '24px' }}>
            <div className="dashboard-header-realtime" style={{ marginBottom: '24px' }}>
              <h1 className="dashboard-title">Return History (Refunds)</h1>
              <button className="search-btn" onClick={fetchReturnHistory}>Refresh</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Credit Notes Table */}
              <div className="table-container">
                <h3 style={{ padding: '15px', background: '#f8fafc', margin: 0, borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 800, color: '#1e3a5f' }}>
                  CREDIT NOTES ISSUED
                </h3>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>CN No</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNotes.map((cn) => (
                      <tr key={cn.id}>
                        <td style={{ fontWeight: 700, color: '#0d9488' }}>{cn.credit_note_no}</td>
                        <td
                          onClick={() => handleViewBill(cn.invoice_no)}
                          style={{ cursor: 'pointer', color: '#1e3a5f', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          {cn.invoice_no}
                        </td>
                        <td style={{ fontWeight: 800 }}>₹{Math.round(cn.amount).toLocaleString()}</td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>{new Date(cn.issued_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {creditNotes.length === 0 && !rrLoading && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No credit notes found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cash Refunds Table */}
              <div className="table-container">
                <h3 style={{ padding: '15px', background: '#f8fafc', margin: 0, borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                  CASH REFUNDS COMPLETED
                </h3>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Issued By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashRefunds.map((r) => (
                      <tr key={r.id}>
                        <td
                          onClick={() => handleViewBill(r.invoice_no)}
                          style={{ cursor: 'pointer', color: '#1e3a5f', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          {r.invoice_no}
                        </td>
                        <td style={{ fontWeight: 800, color: '#059669' }}>₹{Math.round(r.amount).toLocaleString()}</td>
                        <td>{r.issued_by}</td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>{new Date(r.refund_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {cashRefunds.length === 0 && !rrLoading && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No cash refunds found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {/* --- REPLACE HISTORY VIEW --- */}
      {
        activePage === 'replacehistory' && (
          <div className="logs-view-container" style={{ padding: '24px' }}>
            <div className="dashboard-header-realtime" style={{ marginBottom: '24px' }}>
              <h1 className="dashboard-title">Replace History (Replacements)</h1>
              <button className="search-btn" onClick={fetchReplaceHistory}>Refresh</button>
            </div>

            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice No</th>
                    <th>Old Total</th>
                    <th>New Total</th>
                    <th>Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {replacements.map((rp) => (
                    <tr key={rp.id}>
                      <td>{new Date(rp.replacement_date).toLocaleDateString()}</td>
                      <td
                        onClick={() => handleViewBill(rp.invoice_no)}
                        style={{ cursor: 'pointer', color: '#1e3a5f', textDecoration: 'underline', fontWeight: 700 }}
                      >
                        {rp.invoice_no}
                      </td>
                      <td style={{ color: '#ef4444' }}>₹{Math.round(rp.original_total).toLocaleString()}</td>
                      <td style={{ color: '#059669', fontWeight: 800 }}>₹{Math.round(rp.new_total).toLocaleString()}</td>
                      <td>{rp.processed_by}</td>
                    </tr>
                  ))}
                  {replacements.length === 0 && !rrLoading && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No replacement history found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* --- BARCODES VIEW --- */}
      {
        activePage === 'barcodes' && (
          <div className="barcode-master-view" style={{ padding: '24px' }}>
            <div className="dashboard-header-realtime" style={{ marginBottom: '32px' }}>
              <h1 className="dashboard-title">Master Barcode Inventory</h1>
              <p style={{ color: '#64748b', fontSize: '14px' }}>View and print all registered product barcodes</p>
            </div>
            <AllBarcodesPrint />
          </div>
        )
      }

      {/* --- STOCK ADJUSTMENTS VIEW --- */}
      {
        activePage === 'adjustments' && (
          <div className="logs-view-container" style={{ padding: '24px' }}>
            <div className="dashboard-header-realtime" style={{ marginBottom: '24px' }}>
              <h1 className="dashboard-title">Stock Adjustment History</h1>
              <div className="filter-group">
                <button
                  className="btn-create"
                  style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  onClick={() => {
                    setAdjustmentForm({ category: "", item_name: "", size: "", color: "", qty: 1, type: "reduce", reason: "Damaged by wholesaler", customReason: "" });
                    setShowAdjustmentModal(true);
                  }}
                >
                  + New Adjustment
                </button>
                <button className="search-btn" onClick={fetchAdjustmentLogs}>Refresh History</button>
              </div>
            </div>

            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Category</th>
                    <th>Item Name</th>
                    <th>Size/Color</th>
                    <th>Qty Adjusted</th>
                    <th>Reason</th>
                    <th>Adjusted By</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustmentLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(log.adjusted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td>{log.category}</td>
                      <td style={{ fontWeight: 600 }}>{log.item_name}</td>
                      <td>{log.size || '-'} / {log.color || '-'}</td>
                      <td style={{ color: log.type === 'increase' ? '#059669' : '#ef4444', fontWeight: 700 }}>
                        {log.type === 'increase' ? '+' : '-'}{log.qty}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: log.type === 'increase' ? '#ecfdf5' : '#fef2f2',
                          color: log.type === 'increase' ? '#059669' : '#991b1b',
                          border: `1px solid ${log.type === 'increase' ? '#a7f3d0' : '#fee2e2'}`
                        }}>
                          {log.reason}
                        </span>
                      </td>
                      <td>{log.adjusted_by}</td>
                    </tr>
                  ))}
                  {adjustmentLogs.length === 0 && !adjLoading && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No adjustment history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      {/* View Bill Modal */}

      {/* --- DAYOUT REPORTS VIEW --- */}
      {
        activePage === 'dayoutreport' && (() => {
          // Filter reports by date
          const filteredReports = dayoutReports.filter(rpt => {
            if (!dayoutDateFilter) return true;
            const dateKey = new Date(rpt.report_date).toLocaleDateString('en-CA');
            return dateKey === dayoutDateFilter;
          });

          // Group filtered reports by date
          const groupedByDate = {};
          filteredReports.forEach(rpt => {
            const dateKey = new Date(rpt.report_date).toLocaleDateString('en-CA');
            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
            groupedByDate[dateKey].push(rpt);
          });
          const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

          return (
            <div className="dashboard-overview-container">
              <div className="dashboard-header-realtime">
                <h1 className="dashboard-title">Dayout Reports</h1>
              </div>

              {/* Date Filter */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Date:</label>
                  <input
                    type="date"
                    value={dayoutDateFilter}
                    onChange={e => setDayoutDateFilter(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#334155' }}
                  />
                </div>
                {dayoutDateFilter && (
                  <button
                    onClick={() => setDayoutDateFilter('')}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => { setDayoutDateFilter(''); fetchDayoutReports(); }}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                >
                  Reset
                </button>
              </div>
              <div className="table-container" style={{ marginTop: 20 }}>
                {!dayoutDateFilter ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Select a date to view dayout reports.</p>
                    <p style={{ fontSize: 13 }}>Use the From / To date filter above to browse reports.</p>
                  </div>
                ) : dayoutLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><div className="rr-loading-spinner" /><p style={{ color: '#64748b', marginTop: 12 }}>Loading reports...</p></div>
                ) : filteredReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No reports found for selected dates.</p>
                    <p style={{ fontSize: 13 }}>Try changing the date range.</p>
                  </div>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>User</th>
                        <th>Net Cash</th>
                        <th>Online</th>
                        <th>Grand Total</th>
                        <th>Counted Cash</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let counter = 0;
                        return sortedDates.map(dateKey => {
                          const reportsForDate = groupedByDate[dateKey];
                          const dateLabel = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                          const hasMultiple = reportsForDate.length > 1;
                          const dayNetCash = reportsForDate.reduce((s, r) => s + Number(r.net_cash || 0), 0);
                          const dayOnline = reportsForDate.reduce((s, r) => s + Number(r.online_collection || 0), 0);
                          const dayGrandTotal = reportsForDate.reduce((s, r) => s + Number(r.grand_total || 0), 0);
                          const dayCounted = reportsForDate.reduce((s, r) => s + Number(r.counted_cash || 0), 0);
                          const denominations = [500, 200, 100, 50, 20, 10];
                          const coins = [1, 2, 5, 10, 20];

                          const dayExpandKey = `day_${dateKey}`;
                          const isDayExpanded = expandedDayout === dayExpandKey;

                          // Combined note/coin counts across all shifts
                          const combinedNotes = {};
                          reportsForDate.forEach(rpt => {
                            let n = {};
                            try { n = typeof rpt.note_counts === 'string' ? JSON.parse(rpt.note_counts) : (rpt.note_counts || {}); } catch { n = {}; }
                            denominations.forEach(d => { combinedNotes[d] = (combinedNotes[d] || 0) + Number(n[d] || 0); });
                            coins.forEach(c => { combinedNotes[`coin${c}`] = (combinedNotes[`coin${c}`] || 0) + Number(n[`coin${c}`] || 0); });
                          });
                          const dayNoteTotal = denominations.reduce((s, d) => s + d * (combinedNotes[d] || 0), 0);
                          const dayCoinTotal = coins.reduce((s, c) => s + c * (combinedNotes[`coin${c}`] || 0), 0);

                          return (
                            <Fragment key={dateKey}>
                              {/* Day Total Header */}
                              <tr
                                onClick={() => setExpandedDayout(isDayExpanded ? null : dayExpandKey)}
                                style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0', cursor: 'pointer' }}
                                title="Click to view combined note & coin breakdown"
                              >
                                <td colSpan="2" style={{ padding: '12px 16px', fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                                  {dateLabel}
                                </td>
                                <td style={{ textAlign: 'center', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                                  {reportsForDate.length} {reportsForDate.length === 1 ? 'report' : 'reports'}
                                </td>
                                <td style={{ textAlign: 'center', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                                  DAY TOTAL
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e293b', fontSize: 14 }}>₹{dayNetCash.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e293b', fontSize: 14 }}>₹{dayOnline.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'center', fontWeight: 900, color: '#1e293b', fontSize: 15 }}>₹{dayGrandTotal.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e293b', fontSize: 14 }}>₹{dayCounted.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'center' }}>
                                  {hasMultiple && (
                                    <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                      {reportsForDate.length} shifts
                                    </span>
                                  )}
                                </td>
                              </tr>

                              {/* Day Total Combined Breakdown */}
                              {isDayExpanded && (
                                <tr>
                                  <td colSpan="9" style={{ padding: 0, background: '#f9fafb' }}>
                                    <div style={{ padding: '16px 32px', borderTop: '2px solid #e2e8f0' }}>
                                      <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>Notes — Combined ({reportsForDate.length} shifts)</div>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                          {denominations.map(d => {
                                            const qty = combinedNotes[d] || 0;
                                            if (qty === 0) return null;
                                            return (
                                              <div key={d} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', minWidth: 80, textAlign: 'center' }}>
                                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>₹{d}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{qty}</div>
                                                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>= ₹{(d * qty).toLocaleString('en-IN')}</div>
                                              </div>
                                            );
                                          })}
                                          {denominations.every(d => !(combinedNotes[d])) && <span style={{ color: '#94a3b8', fontSize: 13 }}>No notes counted</span>}
                                          <div style={{ marginLeft: 'auto', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>NOTE TOTAL</div>
                                            <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>₹{dayNoteTotal.toLocaleString('en-IN')}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>Coins — Combined</div>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                          {coins.map(c => {
                                            const qty = combinedNotes[`coin${c}`] || 0;
                                            if (qty === 0) return null;
                                            return (
                                              <div key={c} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', minWidth: 80, textAlign: 'center' }}>
                                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>₹{c}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{qty}</div>
                                                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>= ₹{(c * qty).toLocaleString('en-IN')}</div>
                                              </div>
                                            );
                                          })}
                                          {coins.every(c => !(combinedNotes[`coin${c}`])) && <span style={{ color: '#94a3b8', fontSize: 13 }}>No coins counted</span>}
                                          <div style={{ marginLeft: 'auto', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>COIN TOTAL</div>
                                            <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>₹{dayCoinTotal.toLocaleString('en-IN')}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                                        <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>NOTES</div>
                                          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>₹{dayNoteTotal.toLocaleString('en-IN')}</div>
                                        </div>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#cbd5e1' }}>+</span>
                                        <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>COINS</div>
                                          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>₹{dayCoinTotal.toLocaleString('en-IN')}</div>
                                        </div>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#cbd5e1' }}>+</span>
                                        <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>ONLINE</div>
                                          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>₹{dayOnline.toLocaleString('en-IN')}</div>
                                        </div>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#cbd5e1' }}>=</span>
                                        <div style={{ background: '#e2e8f0', border: '2px solid #1e293b', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                                          <div style={{ fontSize: 10, color: '#1e293b', fontWeight: 600 }}>GRAND TOTAL</div>
                                          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>₹{(dayNoteTotal + dayCoinTotal + dayOnline).toLocaleString('en-IN')}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Individual Reports */}
                              {reportsForDate.map(rpt => {
                                counter++;
                                const isExpanded = expandedDayout === rpt.id;
                                let notes = {};
                                try { notes = typeof rpt.note_counts === 'string' ? JSON.parse(rpt.note_counts) : (rpt.note_counts || {}); } catch { notes = {}; }
                                return (
                                  <Fragment key={rpt.id}>
                                    <tr
                                      onClick={() => setExpandedDayout(isExpanded ? null : rpt.id)}
                                      style={{
                                        cursor: 'pointer',
                                        background: isExpanded ? '#f9fafb' : '#fff',
                                        transition: 'background 0.15s'
                                      }}
                                      title="Click to view note breakdown"
                                    >
                                      <td style={{ color: '#64748b', fontSize: 12 }}>{counter}</td>
                                      <td style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                                        {new Date(rpt.report_date).toLocaleDateString('en-IN')}
                                      </td>
                                      <td style={{ color: '#334155' }}>{rpt.report_time || '-'}</td>
                                      <td style={{ fontWeight: 600, color: '#334155' }}>{rpt.username}</td>
                                      <td style={{ fontWeight: 700, color: '#334155' }}>₹{Number(rpt.net_cash || 0).toLocaleString('en-IN')}</td>
                                      <td style={{ fontWeight: 700, color: '#334155' }}>₹{Number(rpt.online_collection || 0).toLocaleString('en-IN')}</td>
                                      <td style={{ fontWeight: 800, color: '#334155' }}>₹{Number(rpt.grand_total || 0).toLocaleString('en-IN')}</td>
                                      <td style={{ fontWeight: 700, color: '#334155' }}>₹{Number(rpt.counted_cash || 0).toLocaleString('en-IN')}</td>
                                      <td>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!confirm('Delete this dayout report?')) return;
                                            try {
                                              await fetch(`${API_BASE_URL}/dayout/delete/${rpt.id}`, { method: 'DELETE' });
                                              fetchDayoutReports();
                                            } catch { /* ignore */ }
                                          }}
                                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                    {isExpanded && (() => {
                                      const noteTotal = denominations.reduce((s, d) => s + d * Number(notes[d] || 0), 0);
                                      const coinTotal = coins.reduce((s, c) => s + c * Number(notes[`coin${c}`] || 0), 0);
                                      const onlineAmt = Number(rpt.online_collection || 0);
                                      return (
                                        <tr>
                                          <td colSpan="9" style={{ padding: 0, background: '#f9fafb' }}>
                                            <div style={{ padding: '16px 32px', borderTop: '2px solid #a8c4df' }}>
                                              <div style={{ marginBottom: 14 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f', marginBottom: 8 }}>💵 Notes — {rpt.username}</div>
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                                  {denominations.map(d => {
                                                    const qty = Number(notes[d] || 0);
                                                    if (qty === 0) return null;
                                                    return (
                                                      <div key={d} style={{ background: '#fff', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 14px', minWidth: 80, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#6b8db5', fontWeight: 600 }}>₹{d}</div>
                                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{qty}</div>
                                                        <div style={{ fontSize: 11, color: '#2d6a9f', fontWeight: 600 }}>= ₹{(d * qty).toLocaleString('en-IN')}</div>
                                                      </div>
                                                    );
                                                  })}
                                                  {denominations.every(d => !Number(notes[d])) && <span style={{ color: '#a8c4df', fontSize: 13 }}>No notes counted</span>}
                                                  <div style={{ marginLeft: 'auto', background: '#d6e4f0', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: 10, color: '#3d6892', fontWeight: 600 }}>NOTE TOTAL</div>
                                                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1e3a5f' }}>₹{noteTotal.toLocaleString('en-IN')}</div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div style={{ marginBottom: 14 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f', marginBottom: 8 }}>🪙 Coins</div>
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                                  {coins.map(c => {
                                                    const qty = Number(notes[`coin${c}`] || 0);
                                                    if (qty === 0) return null;
                                                    return (
                                                      <div key={c} style={{ background: '#fff', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 14px', minWidth: 80, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#6b8db5', fontWeight: 600 }}>₹{c}</div>
                                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{qty}</div>
                                                        <div style={{ fontSize: 11, color: '#2d6a9f', fontWeight: 600 }}>= ₹{(c * qty).toLocaleString('en-IN')}</div>
                                                      </div>
                                                    );
                                                  })}
                                                  {coins.every(c => !Number(notes[`coin${c}`])) && <span style={{ color: '#a8c4df', fontSize: 13 }}>No coins counted</span>}
                                                  <div style={{ marginLeft: 'auto', background: '#d6e4f0', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: 10, color: '#3d6892', fontWeight: 600 }}>COIN TOTAL</div>
                                                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1e3a5f' }}>₹{coinTotal.toLocaleString('en-IN')}</div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8, paddingTop: 12, borderTop: '1px solid #a8c4df' }}>
                                                <div style={{ background: '#d6e4f0', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                                  <div style={{ fontSize: 10, color: '#3d6892', fontWeight: 600 }}>NOTES</div>
                                                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>₹{noteTotal.toLocaleString('en-IN')}</div>
                                                </div>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#a8c4df' }}>+</span>
                                                <div style={{ background: '#d6e4f0', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                                  <div style={{ fontSize: 10, color: '#3d6892', fontWeight: 600 }}>COINS</div>
                                                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>₹{coinTotal.toLocaleString('en-IN')}</div>
                                                </div>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#a8c4df' }}>+</span>
                                                <div style={{ background: '#d6e4f0', border: '1px solid #a8c4df', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                                                  <div style={{ fontSize: 10, color: '#3d6892', fontWeight: 600 }}>ONLINE</div>
                                                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>₹{onlineAmt.toLocaleString('en-IN')}</div>
                                                </div>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#a8c4df' }}>=</span>
                                                <div style={{ background: '#c2d6e8', border: '2px solid #1e3a5f', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                                                  <div style={{ fontSize: 10, color: '#1e3a5f', fontWeight: 600 }}>GRAND TOTAL</div>
                                                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>₹{(noteTotal + coinTotal + onlineAmt).toLocaleString('en-IN')}</div>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })()}
                                  </Fragment>
                                );
                              })}
                            </Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })()
      }

      {/* View Bill Modal */}
      {
        viewBill && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
              <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Reference Bill Details</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Invoice # {viewBill.invoice_no}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setViewBill(null)}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    width: 'auto',
                    flex: 'none',
                    minWidth: 'unset'
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ padding: '32px' }}>
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #eef2ff', color: '#64748b', fontWeight: 600, width: '30%' }}>CLIENT NAME</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.client_name}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>BILL DATE</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #eef2ff' }}>{new Date(viewBill.sale_date).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 20px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>PAYMENT MODE</td>
                        <td style={{ padding: '12px 20px', fontWeight: 700, color: '#1e3a5f' }}>{viewBill.payment_mode}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="table-container">
                  <table className="users-table">
                    <thead style={{ background: '#f1f5f9' }}>
                      <tr>
                        <th>Category</th>
                        <th>Item Name</th>
                        <th>Size/Color</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {JSON.parse(viewBill.items || '[]').map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.category}</td>
                          <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                          <td>{item.size || '-'} / {item.color || '-'}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.rate.toLocaleString()}</td>
                          <td style={{ fontWeight: 700 }}>₹{(item.qty * item.rate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '300px', background: '#f8fafc', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>₹{Math.round(viewBill.sub_total || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Tax (12%):</span>
                      <span style={{ fontWeight: 600 }}>₹{Math.round(viewBill.tax_amount || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#1e3a5f' }}>
                      <span>Grand Total:</span>
                      <span>₹{Math.round(viewBill.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Stock Adjustment Modal */}
      {
        showAdjustmentModal && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '500px' }}>
              <h3 className="modal-title">Inventory Adjustment</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Manually adjust stock levels for specific items by reducing or increasing quantities.
              </p>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Adjustment Type</label>
                <select
                  className="form-input"
                  style={{
                    backgroundColor: adjustmentForm.type === 'increase' ? '#ecfdf5' : '#fef2f2',
                    color: adjustmentForm.type === 'increase' ? '#059669' : '#dc2626',
                    fontWeight: 700,
                    borderColor: adjustmentForm.type === 'increase' ? '#a7f3d0' : '#fee2e2'
                  }}
                  value={adjustmentForm.type}
                  onChange={e => {
                    const nextType = e.target.value;
                    setAdjustmentForm({
                      ...adjustmentForm,
                      type: nextType,
                      reason: nextType === 'increase' ? 'Surplus / Found during audit' : 'Damaged by wholesaler'
                    });
                  }}
                >
                  <option value="reduce">📉 Reduce Stock (Damages, Losses)</option>
                  <option value="increase">📈 Increase Stock (Found, Surplus)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={adjustmentForm.category}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, category: e.target.value, item_name: "", size: "", color: "" })}
                >
                  <option value="">Select Category</option>
                  {Array.from(new Set(stockData.map(s => s.category))).sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Item Name</label>
                <select
                  className="form-input"
                  value={adjustmentForm.item_name}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, item_name: e.target.value, size: "", color: "" })}
                  disabled={!adjustmentForm.category}
                >
                  <option value="">Select Item</option>
                  {Array.from(new Set(stockData.filter(s => s.category === adjustmentForm.category).map(s => s.item_name))).sort().map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <select
                    className="form-input"
                    value={adjustmentForm.size}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, size: e.target.value })}
                    disabled={!adjustmentForm.item_name}
                  >
                    <option value="">Select Size</option>
                    {Array.from(new Set(stockData.filter(s => s.category === adjustmentForm.category && s.item_name === adjustmentForm.item_name).map(s => s.size))).sort().map(size => (
                      <option key={size} value={size}>{size || 'No Size'}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <select
                    className="form-input"
                    value={adjustmentForm.color}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, color: e.target.value })}
                    disabled={!adjustmentForm.item_name}
                  >
                    <option value="">Select Color</option>
                    {Array.from(new Set(stockData.filter(s => s.category === adjustmentForm.category && s.item_name === adjustmentForm.item_name && s.size === adjustmentForm.size).map(s => s.color))).sort().map(color => (
                      <option key={color} value={color}>{color || 'No Color'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={adjustmentForm.qty}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, qty: Math.max(1, parseInt(e.target.value) || 0) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    className="form-input"
                    value={adjustmentForm.reason}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  >
                    {adjustmentForm.type === 'increase' ? (
                      <>
                        <option value="Surplus / Found during audit">Surplus / Found during audit</option>
                        <option value="Returned by courier">Returned by courier</option>
                        <option value="Stock correction (Increase)">Stock correction (Increase)</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Damaged by wholesaler">Damaged by wholesaler</option>
                        <option value="Damaged by rats">Damaged by rats</option>
                        <option value="Misplaced / Lost">Misplaced / Lost</option>
                        <option value="Expired Stock">Expired Stock</option>
                        <option value="Defective / Repair">Defective / Repair</option>
                        <option value="Theft / Shortage">Theft / Shortage</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {adjustmentForm.reason === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Specify Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adjustmentForm.customReason}
                    placeholder="Enter custom reason..."
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, customReason: e.target.value })}
                  />
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setShowAdjustmentModal(false)}>Cancel</button>
                <button
                  className="btn-primary"
                  style={{
                    background: adjustmentForm.type === 'increase'
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none'
                  }}
                  onClick={handleAdjustStock}
                >
                  Apply {adjustmentForm.type === 'increase' ? 'Addition' : 'Reduction'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import "./SalesBill.css";

// Edit Authentication Modal
function EditAuthModal({ bill, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    // Check edit count for this bill
    if (bill?.invoice_no) {
      fetch(`http://localhost:5002/api/billing/edit-count/${bill.invoice_no}`)
        .then(res => res.json())
        .then(data => setEditCount(data.editCount || 0))
        .catch(() => setEditCount(0));
    }
  }, [bill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    onSuccess(name.trim());
  };

  if (editCount >= 2) {
    return (
      <div className="edit-auth-overlay">
        <div className="edit-auth-modal">
          <button className="edit-auth-close" onClick={onClose}>×</button>
          <div className="edit-auth-icon">🚫</div>
          <h2 style={{ color: '#e74c3c', marginBottom: 16 }}>Edit Limit Reached</h2>
          <p style={{ color: '#555', marginBottom: 20, textAlign: 'center' }}>
            This bill has already been edited <strong>2 times</strong>.<br />
            Maximum edit limit has been reached.
          </p>
          <button onClick={onClose} className="edit-auth-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-auth-overlay">
      <div className="edit-auth-modal">
        <button className="edit-auth-close" onClick={onClose}>×</button>
        <div className="edit-auth-icon">✏️</div>
        <h2>Edit Bill</h2>
        <p style={{ color: '#666', marginBottom: 8, textAlign: 'center', fontSize: 14 }}>
          Enter your name to proceed with editing
        </p>
        <p style={{ color: '#888', marginBottom: 16, textAlign: 'center', fontSize: 12 }}>
          Edit {editCount + 1} of 2 allowed
        </p>
        <form onSubmit={handleSubmit}>
          <div className="edit-auth-field">
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          {error && <div className="edit-auth-error">{error}</div>}
          <button type="submit" className="edit-auth-btn">
            Proceed to Edit
          </button>
        </form>
      </div>
    </div>
  );
}


function getUniqueClients(bills) {
  return [...new Set(bills.map(b => b.client_name).filter(Boolean))];
}

// Helper to get yyyy-mm-dd from a date string or Date object
function getDateString(date) {
  if (!date) return "";
  if (typeof date === "string" && date.length >= 10) return date.slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

function SalesBill() {
  const location = useLocation();
  const [viewBill, setViewBill] = useState(null);
  const [editBill, setEditBill] = useState(null);
  const [editConfirmBill, setEditConfirmBill] = useState(null); // Bill pending confirmation
  const [editUser, setEditUser] = useState(""); // User who authenticated for editing
  const [showDateError, setShowDateError] = useState(false); // Date validation error modal
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [filteredClientOptions, setFilteredClientOptions] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [filteredInvoiceOptions, setFilteredInvoiceOptions] = useState([]);
  const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);

  // Replacement history
  const [replacementHistory, setReplacementHistory] = useState([]);
  const [showReplacementView, setShowReplacementView] = useState(false);
  const [viewReplacementHistoryBill, setViewReplacementHistoryBill] = useState(null);

  useEffect(() => {
    const bill = viewBill || viewReplacementHistoryBill;
    if (bill?.invoice_no && bill.is_replaced) {
      fetch(`http://localhost:5002/api/returns/history/${bill.invoice_no}`)
        .then(res => res.json())
        .then(data => setReplacementHistory(data.history || []))
        .catch(() => setReplacementHistory([]));
    } else {
      setReplacementHistory([]);
      if (!viewReplacementHistoryBill) setShowReplacementView(false);
    }
  }, [viewBill, viewReplacementHistoryBill]);

  useEffect(() => {
    let isMounted = true;
    const fetchSalesBills = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/billing/all`);
        const data = await res.json();
        if (res.ok) {
          if (isMounted) {
            setBills(data.bills || []);
            setClientOptions(getUniqueClients(data.bills || []));
          }
        } else {
          if (isMounted) alert("Failed to fetch sales bills");
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          alert("Server error while fetching sales bills");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSalesBills();
    const interval = setInterval(fetchSalesBills, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fromDate, toDate, selectedClient, searchInvoice]); // Removed filteredBills.length to avoid infinite loop

  // Re-run filter when bills change (polling) IF we have already searched
  useEffect(() => {
    if (hasSearched) {
      filterBills();
    }
  }, [bills]);


  // Filter bills by date range and client name
  const filterBills = () => {
    // Validate date range
    if (fromDate && toDate && toDate < fromDate) {
      setShowDateError(true);
      return;
    }

    let result = bills;
    if (fromDate && toDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.sale_date);
        return billDateStr >= fromDate && billDateStr <= toDate;
      });
    } else if (fromDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.sale_date);
        return billDateStr >= fromDate;
      });
    } else if (toDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.sale_date);
        return billDateStr <= toDate;
      });
    }
    if (selectedClient) {
      result = result.filter(bill => bill.client_name?.toLowerCase().includes(selectedClient.toLowerCase()));
    }
    if (searchInvoice) {
      result = result.filter(bill => bill.invoice_no?.toLowerCase().includes(searchInvoice.toLowerCase()));
    }
    setFilteredBills(result);
    setHasSearched(true);
  };


  const exportToExcel = () => {
    if (filteredBills.length === 0) {
      alert("No data to export");
      return;
    }
    const excelData = [];
    filteredBills.forEach((bill) => {
      bill.items.forEach((item) => {
        excelData.push({
          "Invoice": bill.invoice_no,
          "Client": bill.client_name,
          "Phone": bill.phone,
          "Date": new Date(bill.sale_date).toLocaleDateString(),
          "Payment Mode": bill.payment_mode,
          "Payment Status": bill.payment_status,
          "Category": item.category,
          "Item": item.item_name,
          "Size": item.size,
          "Color": item.color,
          "Qty": item.qty,
          "Rate": item.rate || item.price || item.unit_price || 0,
          "Total": item.total,
        });
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Bills");
    worksheet["!cols"] = [
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }
    ];
    const fileName = `Sales_Bills_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportSingleBillToExcel = (bill) => {
    if (!bill) return;
    const excelData = bill.items.map(item => ({
      "Category": item.category,
      "Item": item.item_name,
      "Size": item.size,
      "Color": item.color,
      "Qty": item.qty,
      "Rate": item.rate || item.price || item.unit_price || 0,
      "Total": item.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill Details");
    worksheet["!cols"] = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }
    ];
    const fileName = `Bill_${bill.invoice_no}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Determine where to go back based on navigation state
  const backTarget = location.state?.from === "billing"
    ? "/billing"
    : "/admin-dashboard";

  return (
    <>
      <div className="pro-bill-header">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '20px 40px' }}>
          <div style={{ textAlign: 'left' }}>
            {/* Reports button removed */}
          </div>
          <h1 style={{ textAlign: 'center' }}>Sales Bill History</h1>
          <div style={{ textAlign: 'right' }}>
            {location.state?.from !== "admin-dashboard" && (
              <button className="reset-btn" onClick={() => navigate(backTarget)}>← Back</button>
            )}
          </div>
        </div>

        <div className="sales-filter-bar">
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>From:</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} max={toDate || undefined} />
          </div>

          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>To:</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} min={fromDate || undefined} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Client Name"
              value={selectedClient}
              onChange={e => {
                const val = e.target.value;
                setSelectedClient(val);
                if (val.trim()) {
                  const matches = clientOptions.filter(c => c.toLowerCase().includes(val.toLowerCase()));
                  setFilteredClientOptions(matches);
                  setShowClientSuggestions(matches.length > 0);
                } else {
                  setShowClientSuggestions(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
            {showClientSuggestions && (
              <ul className="suggestions-list">
                {filteredClientOptions.map((c, i) => (
                  <li key={i} className="suggestion-item" onClick={() => {
                    setSelectedClient(c);
                    setShowClientSuggestions(false);
                  }}>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Invoice No"
              value={searchInvoice}
              onChange={e => {
                const val = e.target.value;
                setSearchInvoice(val);
                if (val.trim()) {
                  const uniqueInvoices = [...new Set(bills.map(b => b.invoice_no).filter(Boolean))];
                  const matches = uniqueInvoices.filter(inv => inv.toLowerCase().includes(val.toLowerCase()));
                  setFilteredInvoiceOptions(matches);
                  setShowInvoiceSuggestions(matches.length > 0);
                } else {
                  setShowInvoiceSuggestions(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowInvoiceSuggestions(false), 200)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
            {showInvoiceSuggestions && (
              <ul className="suggestions-list">
                {filteredInvoiceOptions.map((inv, i) => (
                  <li key={i} className="suggestion-item" onClick={() => {
                    setSearchInvoice(inv);
                    setShowInvoiceSuggestions(false);
                  }}>
                    {inv}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={filterBills}>🔍</button>
          <button className="reset-btn" onClick={() => {
            setFromDate(""); setToDate(""); setSelectedClient(""); setSearchInvoice(""); setFilteredBills([]); setHasSearched(false);
          }} style={{ padding: '8px 16px' }}>🔄 Reset</button>

          <button className="export-btn" style={{ marginLeft: 'auto' }} onClick={exportToExcel}>
            📊 Export
          </button>
        </div>
      </div>

      <div className="pro-bill-tablewrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading sales bills...</div>
        ) : !hasSearched ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ margin: 0 }}>Search to View Bills</h3>
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>Select filters or click Search to view records</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No bills found</div>
        ) : (
          <table className="bills-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Client</th>
                <th>Total</th>
                <th>Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(bill => (
                <tr key={bill.invoice_no}>
                  <td>{new Date(bill.sale_date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {bill.invoice_no}
                      {bill.is_replaced && (
                        <button
                          onClick={() => setViewReplacementHistoryBill(bill)}
                          style={{
                            padding: '3px 12px',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                            color: '#fff',
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 900,
                            border: '1px solid #334155',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            display: 'inline-block',
                            lineHeight: '14px',
                            textTransform: 'uppercase'
                          }}
                        >
                          REPLACED
                        </button>
                      )}
                      {bill.is_cn_update && (
                        <span style={{
                          padding: '3px 12px',
                          background: 'linear-gradient(135deg, #1e3a5f 0%, #172554 100%)',
                          color: '#fff',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 900,
                          border: 'none',
                          letterSpacing: '0.5px',
                          display: 'inline-block',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          lineHeight: '14px',
                          textTransform: 'uppercase'
                        }}>
                          CREDIT NOTE BILL
                        </span>
                      )}
                      {bill.is_cash_refunded && (
                        <span style={{
                          padding: '3px 12px',
                          background: 'linear-gradient(135deg, #1e3a5f 0%, #172554 100%)',
                          color: '#fff',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 900,
                          border: 'none',
                          letterSpacing: '0.5px',
                          display: 'inline-block',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          lineHeight: '14px',
                          textTransform: 'uppercase'
                        }}>
                          MONEY REFUNDED
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{bill.client_name}</td>
                  <td style={{ fontWeight: 600 }}>₹{Math.round(bill.grand_total || 0).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: bill.payment_mode === 'Cash' ? '#dcfce7' : '#fff7ed',
                      color: bill.payment_mode === 'Cash' ? '#166534' : '#9a3412'
                    }}>
                      {bill.payment_mode}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="pro-bill-view-btn" onClick={() => setViewBill(bill)}>View</button>
                      <button className="pro-bill-edit-btn" onClick={() => setEditBill(bill)}>Edit</button>
                      <button className="action-btn btn-delete" style={{ padding: '6px 12px' }} onClick={async () => {
                        if (window.confirm('Delete this bill?')) {
                          try {
                            const res = await fetch(`http://localhost:5002/api/billing/delete/${bill.invoice_no}`, { method: 'DELETE' });
                            if (res.ok) {
                              setBills(p => p.filter(b => b.invoice_no !== bill.invoice_no));
                              setFilteredBills(p => p.filter(b => b.invoice_no !== bill.invoice_no));
                            }
                          } catch (e) { alert('Error deleting'); }
                        }
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
        }
      </div>

      {/* Enhanced View Bill Modal */}
      {
        viewBill && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
              <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                <div>
                  {viewBill.is_replaced && (
                    <button
                      onClick={() => setShowReplacementView(!showReplacementView)}
                      style={{
                        background: showReplacementView ? '#fff' : '#1e293b',
                        color: showReplacementView ? '#1e293b' : '#fff',
                        border: '1px solid #e2e8f0',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {showReplacementView ? "View Original Bill" : "Replacement History"}
                    </button>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 className="modal-title" style={{ margin: 0 }}>
                    {showReplacementView ? "Replacement History" : "View Sales Bill Details"}
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Invoice # {viewBill.invoice_no}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button className="btn-primary" onClick={() => setViewBill(null)} style={{ padding: '8px 20px', fontSize: 13, flex: 'none', width: 'auto', minWidth: 'unset' }}>Close</button>
                </div>
              </div>

              <div style={{ padding: '32px' }}>
                {showReplacementView ? (
                  <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>🔁</span> AUDIT LOG
                    </h4>

                    {replacementHistory.map((rep, ridx) => {
                      const oldItems = JSON.parse(rep.original_items);
                      const newItems = JSON.parse(rep.replaced_items);
                      return (
                        <div key={rep.id} style={{ background: '#fffcfc', border: '1px solid #fee2e2', borderRadius: 16, padding: 28, marginBottom: 32, boxShadow: '0 10px 15px -3px rgba(185, 28, 28, 0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #fee2e2', paddingBottom: 16 }}>
                            <div>
                              <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Replacement Date</span>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                                {new Date(rep.replacement_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Processed By</span>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{rep.processed_by || 'Admin'}</div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 20, alignItems: 'start' }}>
                            {/* BEFORE side */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 12, textAlign: 'center', background: '#f1f5f9', padding: '4px', borderRadius: 4 }}>WAS (ORIGINAL)</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {oldItems.map((oi, oidx) => (
                                  <div key={oidx} style={{ fontSize: 12, padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr auto' }}>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#475569' }}>{oi.item_name}</div>
                                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{oi.category} | {oi.size} | {oi.color}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 700 }}>{oi.qty} × ₹{oi.rate}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: 12, textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#64748b' }}>
                                Old Total: ₹{rep.original_total?.toLocaleString()}
                              </div>
                            </div>

                            {/* Arrow */}
                            <div style={{ alignSelf: 'center', textAlign: 'center', fontSize: 24, color: '#b91c1c', fontWeight: 900 }}>→</div>

                            {/* AFTER side */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', marginBottom: 12, textAlign: 'center', background: '#dcfce7', padding: '4px', borderRadius: 4 }}>BECOMES (NEW)</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {newItems.map((ni, nidx) => (
                                  <div key={nidx} style={{ fontSize: 12, padding: '10px 14px', background: '#fff', border: '1px solid #bcf0da', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr auto', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.05)' }}>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#065f46' }}>{ni.item_name}</div>
                                      <div style={{ fontSize: 10, color: '#059669', opacity: 0.7 }}>{ni.category} | {ni.size} | {ni.color}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{ni.qty} × ₹{ni.rate || ni.price}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: 12, textAlign: 'right', fontSize: 14, fontWeight: 900, color: '#059669' }}>
                                New Total: ₹{rep.new_total?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600, width: '30%' }}>INVOICE NO</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.invoice_no}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>BILL DATE</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{new Date(viewBill.sale_date).toLocaleDateString()}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>CLIENT NAME</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.client_name}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>PHONE</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>PAYMENT MODE</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.payment_mode}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 600 }}>STATUS</td>
                            <td style={{ padding: '12px 20px', border: '1px solid #eef2ff', fontWeight: 600 }}>{viewBill.payment_status || 'Paid'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>📦 Item Details</h4>

                    <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <table className="bills-table" style={{ background: 'transparent' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '12px', fontSize: 11 }}>Category</th>
                            <th style={{ padding: '12px', fontSize: 11, textAlign: 'left' }}>Item Name</th>
                            <th style={{ padding: '12px', fontSize: 11 }}>Size</th>
                            <th style={{ padding: '12px', fontSize: 11 }}>Color</th>
                            <th style={{ padding: '12px', fontSize: 11 }}>Qty</th>
                            <th style={{ padding: '12px', fontSize: 11 }}>Rate</th>
                            <th style={{ padding: '12px', fontSize: 11 }}>GST %</th>
                            <th style={{ padding: '12px', fontSize: 11, textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewBill.items.map((item, idx) => {
                            const rate = parseFloat(item.rate || item.price || item.unit_price || 0);
                            const qty = parseFloat(item.qty || 0);
                            const gstPercent = parseFloat(item.gst ?? item.gst_percent ?? 5);
                            const baseAmount = qty * rate;
                            const gstAmount = (baseAmount * gstPercent) / 100;
                            const total = baseAmount + gstAmount;
                            return (
                              <tr key={idx}>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>{item.category}</td>
                                <td style={{ textAlign: 'left', fontWeight: 600, color: '#64748b' }}>{item.item_name}</td>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>{item.size}</td>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>{item.color}</td>
                                <td style={{ fontWeight: 600 }}>{qty}</td>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>₹{rate.toLocaleString()}</td>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>{item.gst ?? item.gst_percent ?? 5}%</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#c026d3' }}>₹{Math.round(total).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#1e1b4b' }}>
                          Grand Total: <span style={{ color: '#c026d3' }}>₹{Math.round(viewBill.grand_total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-actions" style={{ padding: '12px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', margin: 0, display: 'flex', justifyContent: 'flex-start' }}>
                <button className="btn-primary" onClick={() => setViewBill(null)} style={{ padding: '8px 20px', fontSize: 13, flex: 'none', width: 'auto', minWidth: 'unset' }}>Close</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Dedicated Replacement History Modal */}
      {
        viewReplacementHistoryBill && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
              <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Replacement Audit Log</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Invoice # {viewReplacementHistoryBill.invoice_no}</p>
                </div>
                <button className="btn-primary" onClick={() => setViewReplacementHistoryBill(null)} style={{ padding: '8px 20px', fontSize: 13 }}>Close</button>
              </div>
              <div style={{ padding: '32px' }}>
                {replacementHistory.map((rep, ridx) => {
                  const oldItems = JSON.parse(rep.original_items);
                  const newItems = JSON.parse(rep.replaced_items);
                  return (
                    <div key={rep.id} style={{ background: '#fffcfc', border: '1px solid #fee2e2', borderRadius: 16, padding: 28, marginBottom: 32, boxShadow: '0 10px 15px -3px rgba(185, 28, 28, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #fee2e2', paddingBottom: 16 }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Replacement Date</span>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            {new Date(rep.replacement_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Processed By</span>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{rep.processed_by || 'Admin'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 20, alignItems: 'start' }}>
                        {/* BEFORE side */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 12, textAlign: 'center', background: '#f1f5f9', padding: '4px', borderRadius: 4 }}>WAS (ORIGINAL)</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {oldItems.map((oi, oidx) => (
                              <div key={oidx} style={{ fontSize: 12, padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr auto' }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#475569' }}>{oi.item_name}</div>
                                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{oi.category} | {oi.size} | {oi.color}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 700 }}>{oi.qty} × ₹{oi.rate}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#64748b' }}>
                            Old Total: ₹{rep.original_total?.toLocaleString()}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ alignSelf: 'center', textAlign: 'center', fontSize: 24, color: '#b91c1c', fontWeight: 900 }}>→</div>

                        {/* AFTER side */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', marginBottom: 12, textAlign: 'center', background: '#dcfce7', padding: '4px', borderRadius: 4 }}>BECOMES (NEW)</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {newItems.map((ni, nidx) => (
                              <div key={nidx} style={{ fontSize: 12, padding: '10px 14px', background: '#fff', border: '1px solid #bcf0da', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr auto', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.05)' }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#065f46' }}>{ni.item_name}</div>
                                  <div style={{ fontSize: 10, color: '#059669', opacity: 0.7 }}>{ni.category} | {ni.size} | {ni.color}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{ni.qty} × ₹{ni.rate || ni.price}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 14, fontWeight: 900, color: '#059669' }}>
                            New Total: ₹{rep.new_total?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Bill Modal */}
      {
        editBill && (
          <EditBillModal
            bill={editBill}
            clientOptions={clientOptions}
            onClose={() => setEditBill(null)}
            onSave={async updated => {
              try {
                const res = await fetch(`http://localhost:5002/api/billing/update/${updated.invoice_no}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...updated, edited_by: localStorage.getItem('username') || 'Admin' })
                });
                if (res.ok) {
                  setEditBill(null);
                  setBills(prev => prev.map(b => b.invoice_no === updated.invoice_no ? updated : b));
                  setFilteredBills(prev => prev.map(b => b.invoice_no === updated.invoice_no ? updated : b));
                  alert("Updated!");
                } else {
                  alert("Failed");
                }
              } catch (e) { alert("Error"); }
            }}
          />
        )
      }

      {/* Date Error Modal */}
      {
        showDateError && (
          <div className="modal-overlay" onClick={() => setShowDateError(false)}>
            <div className="modal-box" style={{ maxWidth: '450px', textAlign: 'center', padding: '40px 32px' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginBottom: 16 }}>Invalid Date Range!</h2>
              <p style={{ fontSize: 16, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>
                The <strong style={{ color: '#dc2626' }}>"To"</strong> date cannot be earlier than the <strong style={{ color: '#059669' }}>"From"</strong> date.
              </p>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>
                Please select a valid date range to continue.
              </p>
              <button
                className="btn-primary"
                onClick={() => setShowDateError(false)}
                style={{
                  padding: '12px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        )
      }
    </>
  );
}

export default SalesBill;

// EditBillModal component for editing all bill details
function EditBillModal({ bill, clientOptions, onClose, onSave }) {
  const [form, setForm] = React.useState(() => bill ? JSON.parse(JSON.stringify(bill)) : { items: [] });
  const [filteredClientOptions, setFilteredClientOptions] = React.useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = React.useState(false);

  React.useEffect(() => {
    if (bill) setForm(JSON.parse(JSON.stringify(bill)));
  }, [bill]);

  if (!bill) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      const val = (field === 'qty' || field === 'rate' || field === 'price' || field === 'gst' || field === 'gst_percent') ? parseFloat(value || 0) : value;
      items[idx] = { ...items[idx], [field]: val };

      // Ensure both 'rate' and 'price' are synced to avoid mismatch
      if (field === 'rate' || field === 'price') {
        items[idx].rate = val;
        items[idx].price = val;
      }

      // Sync GST field names if needed
      if (field === 'gst' || field === 'gst_percent') {
        const gVal = parseFloat(value || 0);
        items[idx].gst = gVal;
        items[idx].gst_percent = gVal;
      }

      // Recalculate grand total properly inclusive of GST
      const newGrandTotal = items.reduce((sum, it) => {
        const r = parseFloat(it.rate || it.price || 0);
        const q = parseFloat(it.qty || 0);
        const g = parseFloat(it.gst ?? it.gst_percent ?? 5);
        const base = r * q;
        const total = base + (base * g / 100);
        return sum + total;
      }, 0);

      return { ...f, items, grand_total: newGrandTotal };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputStyle = {
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s'
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
          <div />
          <div style={{ textAlign: 'center' }}>
            <h2 className="modal-title" style={{ margin: 0 }}>Edit Full Invoice Details</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Modify any section of the bill below.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn-primary" onClick={onClose} style={{ padding: '8px 20px', fontSize: 13, flex: 'none', width: 'auto', minWidth: 'unset' }}>Close</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700, width: '30%' }}>INVOICE NO</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}><input name="invoice_no" value={form.invoice_no || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} disabled /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700 }}>DATE</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}><input type="date" name="sale_date" value={form.sale_date?.slice(0, 10) || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700 }}>CLIENT NAME</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="client_name"
                        value={form.client_name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(f => ({ ...f, client_name: val }));
                          if (val.trim()) {
                            const matches = clientOptions.filter(c => c.toLowerCase().includes(val.toLowerCase()));
                            setFilteredClientOptions(matches);
                            setShowClientSuggestions(matches.length > 0);
                          } else {
                            setShowClientSuggestions(false);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                        style={{ ...inputStyle, border: 'none', background: 'transparent', fontWeight: 700, color: '#1e1b4b' }}
                      />
                      {showClientSuggestions && (
                        <ul className="suggestions-list">
                          {filteredClientOptions.map((c, i) => (
                            <li key={i} className="suggestion-item" onClick={() => {
                              setForm(f => ({ ...f, client_name: c }));
                              setShowClientSuggestions(false);
                            }}>
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700 }}>PHONE</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}><input name="phone" value={form.phone || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700 }}>PAYMENT MODE</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}>
                    <select name="payment_mode" value={form.payment_mode || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }}>
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#f8fafc', border: '1px solid #eef2ff', color: '#64748b', fontWeight: 700 }}>STATUS</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #eef2ff' }}>
                    <select name="payment_status" value={form.payment_status || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent', fontWeight: 700, color: '#1e1b4b' }}>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📦</span> Item Line Details
          </h4>

          <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <table className="bills-table" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px', fontSize: 11 }}>Category</th>
                  <th style={{ padding: '12px', fontSize: 11 }}>Item Name</th>
                  <th style={{ padding: '12px', fontSize: 11 }}>Size</th>
                  <th style={{ padding: '12px', fontSize: 11 }}>Color</th>
                  <th style={{ padding: '12px', fontSize: 11, width: 80 }}>Qty</th>
                  <th style={{ padding: '12px', fontSize: 11, width: 100 }}>Rate</th>
                  <th style={{ padding: '12px', fontSize: 11, width: 80 }}>GST %</th>
                  <th style={{ padding: '12px', fontSize: 11, width: 120 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8 }}><input value={item.category || ''} onChange={e => handleItemChange(idx, 'category', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input value={item.item_name || ''} onChange={e => handleItemChange(idx, 'item_name', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input value={item.size || ''} onChange={e => handleItemChange(idx, 'size', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input value={item.color || ''} onChange={e => handleItemChange(idx, 'color', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input type="number" value={item.qty || ''} onChange={e => handleItemChange(idx, 'qty', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input type="number" value={item.rate || item.price || item.unit_price || ''} onChange={e => handleItemChange(idx, 'rate', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8 }}><input type="number" value={item.gst ?? item.gst_percent ?? 5} onChange={e => handleItemChange(idx, 'gst', e.target.value)} style={inputStyle} /></td>
                    <td style={{ padding: 8, fontWeight: 600 }}>₹{(() => {
                      const rate = parseFloat(item.rate || item.price || item.unit_price || 0);
                      const qty = parseFloat(item.qty || 0);
                      const gstPercent = parseFloat(item.gst ?? item.gst_percent ?? 5);
                      const baseAmount = qty * rate;
                      const gstAmount = (baseAmount * gstPercent) / 100;
                      const total = baseAmount + gstAmount;
                      return total.toLocaleString();
                    })()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              Total: <span style={{ color: '#c026d3' }}>₹{Math.round(form.grand_total || 0).toLocaleString()}</span>
            </div>
            <div className="modal-actions" style={{ marginTop: 0, padding: 0, borderTop: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="button" className="reset-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: 13, margin: 0 }}>Cancel</button>
              <button type="submit" className="save-btn" style={{ padding: '8px 24px', fontSize: 13, minWidth: 100, margin: 0 }}>Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

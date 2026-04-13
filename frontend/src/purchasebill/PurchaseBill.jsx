import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import "./PurchaseBill.css";


function getUniqueSuppliers(bills) {
  return [...new Set(bills.map(b => b.supplier_name).filter(Boolean))];
}

// Helper to get yyyy-mm-dd from a date string or Date object
function getDateString(date) {
  if (!date) return "";
  if (typeof date === "string" && date.length >= 10) return date.slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

function PurchaseBill() {
  // Back to Dashboard button handler
  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };
  const location = useLocation();
  const [viewBill, setViewBill] = useState(null);
  const [editBill, setEditBill] = useState(null);
  const [editConfirmBill, setEditConfirmBill] = useState(null);
  const [showEditAuth, setShowEditAuth] = useState(null);
  const [editUser, setEditUser] = useState("");
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [filteredSupplierOptions, setFilteredSupplierOptions] = useState([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [filteredInvoiceOptions, setFilteredInvoiceOptions] = useState([]);
  const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);
  const [showDateError, setShowDateError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPurchaseBills = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/purchase/all`);
        const data = await res.json();
        if (res.ok) {
          if (isMounted) {
            // Always sort bills by date descending before setting state
            const sortedBills = (data.bills || []).slice().sort((a, b) => {
              const dateA = new Date(a.purchase_date);
              const dateB = new Date(b.purchase_date);
              return dateB - dateA;
            });
            setBills(sortedBills);
            setSupplierOptions(getUniqueSuppliers(sortedBills));
          }
        } else {
          if (isMounted) alert("Failed to fetch purchase bills");
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          alert("Server error while fetching purchase bills");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPurchaseBills();
    const interval = setInterval(fetchPurchaseBills, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fromDate, toDate, selectedSupplier, searchInvoice]);

  // Re-run filter when bills change (polling) IF we have already searched
  useEffect(() => {
    if (hasSearched) {
      filterBills();
    }
  }, [bills]);

  // Filter bills by date range and supplier name, and sort by date descending
  const filterBills = () => {
    // Validate date range
    if (fromDate && toDate && toDate < fromDate) {
      setShowDateError(true);
      return;
    }

    let result = bills;
    if (fromDate && toDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.purchase_date);
        return billDateStr >= fromDate && billDateStr <= toDate;
      });
    } else if (fromDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.purchase_date);
        return billDateStr >= fromDate;
      });
    } else if (toDate) {
      result = result.filter(bill => {
        const billDateStr = getDateString(bill.purchase_date);
        return billDateStr <= toDate;
      });
    }
    if (selectedSupplier) {
      result = result.filter(bill => bill.supplier_name?.toLowerCase().includes(selectedSupplier.toLowerCase()));
    }
    if (searchInvoice) {
      result = result.filter(bill => bill.invoice_no?.toLowerCase().includes(searchInvoice.toLowerCase()));
    }
    // Sort by purchase_date descending (most recent first)
    result = result.slice().sort((a, b) => {
      const dateA = new Date(a.purchase_date);
      const dateB = new Date(b.purchase_date);
      return dateB - dateA;
    });
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
          "Supplier": bill.supplier_name,
          "GST": bill.supplier_gst,
          "Date": new Date(bill.purchase_date).toLocaleDateString(),
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Bills");
    worksheet["!cols"] = [
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }
    ];
    const fileName = `Purchase_Bills_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    const fileName = `Purchase_Bill_${bill.invoice_no}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Determine where to go back based on navigation state
  const backTarget = (location.state?.from === "admin" || location.state?.from === "admin-dashboard")
    ? "/admin-dashboard"
    : "/purchase-dashboard";

  return (
    <>
      <div className="pro-bill-header">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '20px 40px' }}>
          <div />
          <h1 style={{ textAlign: 'center' }}>Purchase Bill History</h1>
          <div style={{ textAlign: 'right' }}>
            {!(location.state?.from === "admin" || location.state?.from === "admin-dashboard") && (
              <button className="reset-btn" onClick={() => navigate(backTarget)}>← Back</button>
            )}
          </div>
        </div>

        <div className="purchase-filter-bar">
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
              placeholder="Supplier Name"
              value={selectedSupplier}
              onChange={e => {
                const val = e.target.value;
                setSelectedSupplier(val);
                if (val.trim()) {
                  const matches = supplierOptions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
                  setFilteredSupplierOptions(matches);
                  setShowSupplierSuggestions(matches.length > 0);
                } else {
                  setShowSupplierSuggestions(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
            {showSupplierSuggestions && (
              <ul className="suggestions-list">
                {filteredSupplierOptions.map((s, i) => (
                  <li key={i} className="suggestion-item" onClick={() => {
                    setSelectedSupplier(s);
                    setShowSupplierSuggestions(false);
                  }}>
                    {s}
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
            setFromDate(""); setToDate(""); setSelectedSupplier(""); setSearchInvoice(""); setFilteredBills([]); setHasSearched(false);
          }} style={{ padding: '8px 16px' }}>🔄 Reset</button>

          <button className="export-btn" style={{ marginLeft: 'auto' }} onClick={exportToExcel}>
            📊 Export
          </button>
        </div>
      </div>

      <div className="pro-bill-tablewrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading purchase bills...</div>
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
                <th>Supplier</th>
                <th>Total</th>
                <th>Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(bill => (
                <tr key={bill.invoice_no}>
                  <td>{new Date(bill.purchase_date).toLocaleDateString()}</td>
                  <td>{bill.invoice_no}</td>
                  <td>{bill.supplier_name}</td>
                  <td style={{ fontWeight: 600 }}>₹{Math.round(bill.grand_total || 0).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: bill.payment_mode?.toLowerCase() === 'cash' ? '#f0fdf4' : '#fef2f2',
                      color: bill.payment_mode?.toLowerCase() === 'cash' ? '#166534' : '#991b1b'
                    }}>
                      {bill.payment_mode}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="pro-bill-view-btn" onClick={() => setViewBill(bill)}>View</button>
                      <button className="pro-bill-edit-btn" onClick={() => {
                        setEditUser(localStorage.getItem('username') || 'Admin');
                        setEditBill(bill);
                      }}>Edit</button>
                      <button className="action-btn btn-delete" style={{ padding: '6px 12px' }} onClick={async () => {
                        if (window.confirm('Delete this bill?')) {
                          try {
                            const res = await fetch(`${API_BASE_URL}/purchase/delete/${bill.invoice_no}`, { method: 'DELETE' });
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
        )}
      </div>

      {/* View Bill Modal */}
      {viewBill && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            <div style={{ padding: '20px 32px', borderBottom: '1px solid #fae8ff', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
              <div />
              <div style={{ textAlign: 'center' }}>
                <h2 className="modal-title" style={{ margin: 0 }}>View Purchase Bill Details</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Detailed overview of purchase invoice # {viewBill.invoice_no}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn-primary" onClick={() => setViewBill(null)} style={{ padding: '8px 20px', fontSize: 13, flex: 'none', width: 'auto', minWidth: 'unset' }}>Close</button>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #fae8ff', overflow: 'hidden', marginBottom: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700, width: '30%' }}>INVOICE NO</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 800, color: '#1e1b4b' }}>{viewBill.invoice_no}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>PURCHASE DATE</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 600 }}>{new Date(viewBill.purchase_date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>SUPPLIER NAME</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 700, color: '#1e1b4b' }}>{viewBill.supplier_name}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>SUPPLIER GST</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 600 }}>{viewBill.supplier_gst || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>PAYMENT MODE</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 600 }}>{viewBill.payment_mode || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>STATUS</td>
                      <td style={{ padding: '12px 20px', border: '1px solid #fae8ff', fontWeight: 800, color: '#1e1b4b' }}>{viewBill.payment_status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>📦 Purchase Item Details</h4>

              <div style={{ background: '#fdf4ff', borderRadius: 12, border: '1px solid #fae8ff', overflow: 'hidden' }}>
                <table className="bills-table" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ background: '#fae8ff' }}>
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
                          <td style={{ color: '#64748b' }}>{item.category}</td>
                          <td style={{ textAlign: 'left', fontWeight: 600 }}>{item.item_name}</td>
                          <td style={{ color: '#64748b' }}>{item.size}</td>
                          <td style={{ color: '#64748b' }}>{item.color}</td>
                          <td style={{ fontWeight: 600 }}>{qty}</td>
                          <td style={{ color: '#64748b' }}>₹{rate.toLocaleString()}</td>
                          <td style={{ color: '#64748b' }}>{gstPercent}%</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#c026d3' }}>₹{Math.round(total).toLocaleString()}</td>
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
            </div>

            <div className="modal-actions" style={{ padding: '12px 32px', background: '#fdf4ff', borderTop: '1px solid #fae8ff', margin: 0, display: 'flex', justifyContent: 'flex-start' }}>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editBill && (
        <EditBillModal
          bill={editBill}
          onClose={() => { setEditBill(null); setEditUser(""); }}
          onSave={async updated => {
            try {
              const res = await fetch(`${API_BASE_URL}/purchase/update/${updated.invoice_no}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updated, edited_by: editUser })
              });
              if (res.ok) {
                setEditBill(null);
                setEditUser("");
                setBills(prev => prev.map(b => b.invoice_no === updated.invoice_no ? updated : b));
                setFilteredBills(prev => prev.map(b => b.invoice_no === updated.invoice_no ? updated : b));
                alert("Purchase Bill Updated!");
              } else {
                alert('Failed to update purchase bill');
              }
            } catch (e) {
              alert('Server error while updating purchase bill');
            }
          }}
        />
      )}

      {/* Date Error Modal */}
      {showDateError && (
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
      )}
    </>
  );
}

export default PurchaseBill;

// EditBillModal component for editing all bill details
function EditBillModal({ bill, onClose, onSave }) {
  const [form, setForm] = React.useState(() => bill ? JSON.parse(JSON.stringify(bill)) : { items: [] });
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

      // Sync GST field names if needed
      if (field === 'gst' || field === 'gst_percent') {
        const gVal = parseFloat(value || 0);
        items[idx].gst = gVal;
        items[idx].gst_percent = gVal;
      }

      // Sync Item Total for backend saving
      const it_r = parseFloat(items[idx].rate || items[idx].price || 0);
      const it_q = parseFloat(items[idx].qty || 0);
      const it_g = parseFloat(items[idx].gst ?? items[idx].gst_percent ?? 5);
      const it_base = it_r * it_q;
      const it_total = it_base + (it_base * it_g / 100);
      items[idx].amount = it_total;
      items[idx].total = it_total;

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
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #fae8ff', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
          <div />
          <div style={{ textAlign: 'center' }}>
            <h2 className="modal-title" style={{ margin: 0 }}>Edit Full Purchase Invoice</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Modify any section of the purchase bill below.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn-primary" onClick={onClose} style={{ padding: '8px 20px', fontSize: 13, flex: 'none', width: 'auto', minWidth: 'unset' }}>Close</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #fae8ff', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700, width: '30%' }}>INVOICE NO</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}><input name="invoice_no" value={form.invoice_no || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent', fontWeight: 700 }} disabled /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>DATE</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}><input type="date" name="purchase_date" value={form.purchase_date?.slice(0, 10) || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>SUPPLIER</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="supplier_name"
                        value={form.supplier_name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(f => ({ ...f, supplier_name: val }));
                          if (val.trim()) {
                            const matches = supplierOptions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
                            setFilteredSupplierOptions(matches);
                            setShowSupplierSuggestions(matches.length > 0);
                          } else {
                            setShowSupplierSuggestions(false);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
                        style={{ ...inputStyle, border: 'none', background: 'transparent', fontWeight: 700, color: '#1e1b4b' }}
                      />
                      {showSupplierSuggestions && (
                        <ul className="suggestions-list">
                          {filteredSupplierOptions.map((s, i) => (
                            <li key={i} className="suggestion-item" onClick={() => {
                              setForm(f => ({ ...f, supplier_name: s }));
                              setShowSupplierSuggestions(false);
                            }}>
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>GST NO</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}><input name="supplier_gst" value={form.supplier_gst || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>PAYMENT</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}><input name="payment_mode" value={form.payment_mode || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', background: '#fdf4ff', border: '1px solid #fae8ff', color: '#64748b', fontWeight: 700 }}>STATUS</td>
                  <td style={{ padding: '12px 20px', border: '1px solid #fae8ff' }}>
                    <select name="payment_status" value={form.payment_status || ''} onChange={handleChange} style={{ ...inputStyle, border: 'none', background: 'transparent', fontWeight: 700, color: '#1e1b4b' }}>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📦</span> Purchase Item Details
          </h4>

          <div style={{ background: '#fdf4ff', borderRadius: 12, border: '1px solid #fae8ff', overflow: 'hidden' }}>
            <table className="bills-table" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ background: '#fae8ff' }}>
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

// Edit Authentication Modal for Purchase Bills
function EditAuthModal({ bill, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    // Check edit count for this bill
    if (bill?.invoice_no) {
      fetch(`${API_BASE_URL}/purchase/edit-count/${bill.invoice_no}`)
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

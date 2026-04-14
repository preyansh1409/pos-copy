import "./Print.css";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Print() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();

  const [invoiceData, setInvoiceData] = useState({
    clientName: "",
    clientPhone: "",
    invoiceNo: "",
    date: "",
    items: [],
    paymentMode: "Cash" // NEW
  });

  useEffect(() => {
    if (!location.state) {
      navigate("/billing");
      return;
    }

    if (location.state && location.state.items) {
      const { clientName, clientPhone, invoiceNo, date, items, paymentMode } = location.state;

      const filteredItems = items.filter(
        (item) => item.name && item.qty && item.price
      );

      setInvoiceData({
        clientName,
        clientPhone,
        invoiceNo,
        date,
        items: filteredItems,
        paymentMode: paymentMode || "Cash"
      });
    }
  }, [location.state, navigate]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
          <style>
            /* ================= RESET & PRINT BASE ================= */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body, html { width: 100%; height: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1a202c; background-color: #ffffff; }

            /* ================= PRINT PAGE WRAPPER ================= */
            .print-page { display: flex; flex-direction: column; align-items: center; padding: 0; min-height: 100vh; }
            .print-box { width: 100%; max-width: 100%; background: #ffffff; padding: 40px; border-radius: 0; box-shadow: none; display: flex; flex-direction: column; gap: 30px; position: relative; }

            /* ================= HEADER SECTION ================= */
            .invoice-header-centered { text-align: center; margin-bottom: 20px; }
            .brand-info { display: flex; flex-direction: column; align-items: center; gap: 8px; }
            .brand-info img { width: 70px; height: auto; margin-bottom: 4px; }
            .brand-info h1 { font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px; margin: 0; }
            .brand-details { display: flex; flex-direction: column; gap: 4px; }
            .brand-details p { font-size: 11px; line-height: 1.5; color: #64748b; max-width: 500px; }

            /* ================= SINGLE ROW METADATA ================= */
            .meta-info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px; color: #334155; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .meta-item { display: flex; align-items: center; gap: 6px; }
            .meta-item strong { color: #0f172a; font-weight: 700; }

            /* ================= ITEMS TABLE ================= */
            .invoice-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; }
            .invoice-table th { background-color: #1e3a5f !important; color: #ffffff !important; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 8px; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            /* Rounded corners for header */
            .invoice-table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
            .invoice-table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }

            .invoice-table td { padding: 10px 8px; font-size: 12px; font-weight: 500; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .invoice-table tr:last-child td { border-bottom: 2px solid #1e3a5f; }

            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }

            /* ================= SUMMARY & TERMS ================= */
            .invoice-footer-layout { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; padding-top: 20px; }
            .terms-section { flex: 1; padding-right: 40px; }
            .terms-section h4 { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
            .terms-list { font-size: 10px; color: #64748b; line-height: 1.6; padding-left: 16px; }

            .summary-section { width: 300px; }
            .summary-box { display: flex; flex-direction: column; gap: 8px; }
            .summary-row { display: flex; justify-content: space-between; font-size: 12px; color: #475569; }
            
            .total-due-row { margin-top: 12px; padding-top: 12px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
            .total-due-label { font-size: 14px; font-weight: 800; color: #1e293b; text-transform: uppercase; }
            .total-due-amount { font-size: 24px; font-weight: 900; color: #1e3a5f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Authorized Signatory */
            .auth-signatory { margin-top: 40px; text-align: right; }
            .auth-signatory div { display: inline-block; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; min-width: 140px; text-align: center; }

            /* Hide Buttons */
            .print-actions-sticky, .btn-print-trigger, .print-controls { display: none !important; }
          </style>
        </head>
        <body onload="window.print(); window.close();">${content}</body>
      </html>
    `);
    newWin.document.close();

    // Automatically return to billing screen after triggering print
    setTimeout(() => {
      navigate("/billing");
    }, 500);
  };

  // Calculate subtotal and grand total using GST per item
  const subtotal = invoiceData.items.reduce(
    (sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      return sum + price * qty;
    }, 0
  );
  const grandTotal = invoiceData.items.reduce(
    (sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const gstPercent = item.gst !== undefined && item.gst !== null && item.gst !== "" ? Number(item.gst) : 5;
      const priceWithGst = price + (price * gstPercent / 100);
      return sum + qty * priceWithGst;
    }, 0
  );

  return (
    <div className="print-page">
      <div className="print-box" ref={printRef}>
        {/* === CENTERED HEADER === */}
        <div className="invoice-header-centered">
          <div className="brand-info">
            <img src={localStorage.getItem('logo_url') || '/logo.jpg'} alt="Logo" />
            <h1>{localStorage.getItem('business_name') || 'Point of Sale Software'}</h1>
            <div className="brand-details">
              <p>{localStorage.getItem('address') || "23, Ravi Complex, Near Paldi Bus Stand, Ahmedabad"}</p>
              <p>Ph: {localStorage.getItem('phone') || "1000000000"}</p>
            </div>
          </div>
        </div>

        {/* === SINGLE LINE METADATA === */}
        <div className="meta-info-row">
          <div className="meta-item"><strong>Date:</strong> {invoiceData.date}</div>
          <div className="meta-item"><strong>Invoice:</strong> {invoiceData.invoiceNo}</div>
          <div className="meta-item"><strong>Client:</strong> {invoiceData.clientName || "Walk-in"}</div>
          <div className="meta-item"><strong>Phone:</strong> {invoiceData.clientPhone || "-"}</div>
          <div className="meta-item"><strong>Status:</strong> Paid</div>
          <div className="meta-item"><strong>Mode:</strong> {invoiceData.paymentMode}</div>
        </div>

        {/* === ITEMS TABLE === */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: '40px' }}>#</th>
              <th>Description</th>
              <th className="text-center">Size</th>
              <th className="text-center">Color</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-center">GST %</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>
                  No items in this invoice
                </td>
              </tr>
            ) : (
              invoiceData.items.map((item, index) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.qty) || 0;
                const gstPercent = item.gst !== undefined && item.gst !== null && item.gst !== "" ? Number(item.gst) : 5;
                const priceWithGst = price + (price * gstPercent / 100);
                const total = qty * priceWithGst;
                return (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td><strong>{item.name}</strong></td>
                    <td className="text-center">{item.size}</td>
                    <td className="text-center">{item.color}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">₹{Math.round(price)}</td>
                    <td className="text-center">{gstPercent}%</td>
                    <td className="text-right"><strong>₹{Math.round(total)}</strong></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* === TERMS & TOTALS === */}
        <div className="invoice-footer-layout">
          <div className="terms-section">
            <h4>Terms & Conditions</h4>
            <ul className="terms-list">
              <li>Returns accepted within 7 days with original receipt.</li>
              <li>Product must have original tags/barcodes and be unworn.</li>
              <li>Washed or damaged items will not be accepted.</li>
              <li>E. & O.E.</li>
            </ul>
          </div>

          <div className="summary-section">
            <div className="summary-box">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>
              <div className="total-due-row">
                <span className="total-due-label">Total Amount</span>
                <span className="total-due-amount">₹{Math.round(grandTotal)}</span>
              </div>
            </div>
            <div className="auth-signatory">
              <div> Authorized Signatory </div>
            </div>
          </div>
        </div>
      </div>

      {/* === FLOATING ACTIONS === */}
      <div className="print-actions-sticky">
        <button className="btn-print-trigger" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>
        <button className="btn-print-trigger btn-secondary-print" onClick={() => navigate('/billing')}>
          🔙 Back to Billing
        </button>
      </div>
    </div>
  );
}


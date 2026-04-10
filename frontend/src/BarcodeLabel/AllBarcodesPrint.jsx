import API_BASE_URL from "../apiConfig";

import React, { useEffect, useState } from "react";
import { renderBarcodeSVG } from "./barcodeUtils";
import "./BarcodeLabel.css";

export default function AllBarcodesPrint() {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sizeStats, setSizeStats] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/masterdata/all-barcodes`)
      .then(res => res.json())
      .then(data => {
        const barcodesList = data.barcodes || [];
        setBarcodes(barcodesList);

        // Calculate size stats
        const stats = {};
        barcodesList.forEach(bc => {
          const s = bc.size || "No Size";
          stats[s] = (stats[s] || 0) + 1;
        });
        setSizeStats(stats);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredBarcodes = barcodes.filter(bc => {
    const search = searchTerm.toLowerCase();
    return (
      (bc.size || "").toLowerCase().includes(search) ||
      (bc.barcode || "").toLowerCase().includes(search) ||
      (bc.item_name || "").toLowerCase().includes(search) ||
      (bc.product_code || "").toLowerCase().includes(search)
    );
  });

  const handlePrintAll = () => {
    const listToPrint = searchTerm ? filteredBarcodes : barcodes;
    if (listToPrint.length === 0) return;
    const printWindow = window.open('', '', 'height=800,width=800');

    let htmlContent = `
      <html><head><title>Print Barcodes</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial,sans-serif; background:#fff; }
        .page-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .print-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 15px; 
        }
        .barcode-sticker {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          page-break-inside: avoid;
        }
        .barcode-strip { width: 100%; max-width: 180px; height: auto; margin-bottom: 4px; }
        .barcode-strip svg { width: 100% !important; height: auto !important; display: block; }
        .product-code { font-size: 12px; font-weight: bold; margin: 2px 0; color: #000; }
        .product-meta { font-size: 10px; color: #444; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style></head><body>
        <div class="page-header">
           <h2 style="margin:0; color: #1e293b;">Barcode Inventory ${searchTerm ? `(Filtered: ${searchTerm})` : ''}</h2>
           <p style="margin:5px 0; font-size: 12px;">Total Items: ${listToPrint.length} | Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="print-grid">
    `;

    listToPrint.forEach(bc => {
      htmlContent += `
        <div class="barcode-sticker">
          <div class="barcode-strip">${renderBarcodeSVG(bc.barcode)}</div>
          <div class="product-code">${bc.barcode}</div>
          <div class="product-meta">Code: ${bc.product_code || 'N/A'} | ${bc.size || ''} | ${bc.color || ''}</div>
          <div style="font-size: 9px; margin-top: 2px;">${bc.item_name || ''}</div>
        </div>
      `;
    });

    htmlContent += `
        </div>
      </body></html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="all-barcodes-print" style={{ width: '100%', position: 'relative' }}>
      {loading && (
        <div className="barcode-fetch-loading-overlay">
          <div className="barcode-fetch-spinner"></div>
          <div style={{ marginTop: 18, color: '#2563eb', fontWeight: 600, fontSize: 18 }}>Loading Barcodes...</div>
        </div>
      )}

      {!loading && barcodes.length > 0 && (
        <>
          {/* Size Statistics Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
            background: '#f1f5f9',
            padding: '20px',
            borderRadius: '16px',
            border: '1px outset #cbd5e1'
          }}>
            <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: 800 }}>BARCODE COUNTS BY SIZE</h4>
            </div>
            {Object.entries(sizeStats).sort().map(([size, count]) => (
              <div key={size} style={{
                background: '#fff',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Size: {size}</div>
                <div style={{ fontSize: '18px', color: '#1e293b', fontWeight: 800 }}>{count}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            padding: '16px 24px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 800 }}>DASHBOARD PRINTING</h3>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search size (e.g. 35, XL)..."
                  className="filter-select"
                  style={{ margin: 0, width: '100%', maxWidth: '300px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px' }}>
                Showing {filteredBarcodes.length} of {barcodes.length} barcodes
              </p>
              <button
                className="btn-create"
                onClick={handlePrintAll}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  margin: 0
                }}
              >
                🖨️ Print {searchTerm ? 'Filtered' : 'All'} Barcodes
              </button>
            </div>
          </div>
        </>
      )}

      <div className="barcodes-list" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        width: '100%',
        paddingBottom: '40px'
      }}>
        {filteredBarcodes.map(bc => {
          // Use sizes directly from the joined masterdata fetch
          const size = bc.size || "";
          const color = bc.color || "";
          return (
            <div className="user-card" key={bc.barcode} style={{
              padding: '20px',
              alignItems: 'center',
              background: '#fff',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: '100%',
                background: '#f8fafc',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div
                  className="barcode-strip"
                  style={{ width: '100%', maxWidth: 180 }}
                  dangerouslySetInnerHTML={{ __html: renderBarcodeSVG(bc.barcode) }}
                />
              </div>

              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>{bc.barcode}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', marginBottom: '6px' }}>Product Code: {bc.product_code || 'N/A'}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>{bc.item_name} ({bc.category})</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '16px' }}>Size: {size} | {color}</div>

                <button
                  className="card-action-btn edit"
                  style={{ width: '100%', fontWeight: 700 }}
                  onClick={() => {
                    const printWindow = window.open('', '', 'height=400,width=350');
                    printWindow.document.write(`
                      <html><head><title>Print Barcode</title>
                      <style>
                        body { margin:0; padding:0; font-family: Arial,sans-serif; background:#fff; }
                        .barcode-label-sticker {
                          width: 220px;
                          min-height: 100px;
                          border: 1px solid #000;
                          border-radius: 6px;
                          padding: 8px 8px 4px 8px;
                          text-align: center;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          margin: 30px auto;
                        }
                        .barcode-strip { margin-bottom: 2px; width: 100%; max-width: 200px; }
                        .barcode-strip svg { width: 100% !important; height: auto !important; display: block; }
                        .product-code-text { font-size: 13px; font-weight: bold; margin: 2px 0 0 0; }
                        .product-details-text { font-size: 11px; margin: 1px 0; }
                      </style></head><body>
                        <div class='barcode-label-sticker'>
                          <div class='barcode-strip'>${renderBarcodeSVG(bc.barcode)}</div>
                          <div class='product-code-text'>${bc.barcode}</div>
                          <div style='font-size: 12px; font-weight: 800;'>Code: ${bc.product_code || 'N/A'}</div>
                          <div class='product-details-text'>${bc.item_name} | ${size} | ${color}</div>
                        </div>
                      </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }}
                >
                  🖨️ Print Single
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

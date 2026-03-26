import { useRef } from "react";
import "./BarcodeLabel.css";
import { renderBarcodeSVG } from "./barcodeUtils";

export default function BarcodeLabel({ product, onClose }) {
  const printRef = useRef();

  // Generate product code (simplified - in real app would come from backend)
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `PRD-${timestamp}`;
  };

  // Generate Code 128 barcode using JsBarcode
  const generateBarcodeSVG = (code) => {
    return renderBarcodeSVG(code);
  };

  const productCode = product.productCode || generateProductCode();

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=300,width=400");
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Label</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 50mm;
              height: 25mm;
              border: 1px solid #000;
              border-radius: 4px;
              padding: 4px;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
              box-sizing: border-box;
            }
            .barcode {
              height: 8mm;
              display: flex;
              align-items: center;
              justify-content: center;
              border-bottom: 1px solid #000;
            }
            .product-code {
              font-size: 8px;
              font-weight: bold;
              margin: 1px 0;
            }
            .product-name {
              font-size: 7px;
              font-weight: 600;
              margin: 1px 0;
              line-height: 1.1;
            }
            .product-details {
              font-size: 6px;
              margin: 1px 0;
            }
            .price {
              font-size: 9px;
              font-weight: bold;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="barcode">${renderBarcodeSVG(productCode)}</div>
            <div class="product-code">${productCode}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-details">${product.size} | ${product.color}</div>
            <div class="price">₹${product.price}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="barcode-label-modal">
      <div className="barcode-label-content">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h3>Barcode Label Preview</h3>
        
        <div className="label-preview" ref={printRef}>
          <div className="barcode-label">
            <div className="barcode-strip" dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(productCode) }} />
            <div className="product-code-text">{productCode}</div>
            <div className="product-name-text">{product.name}</div>
            <div className="product-details-text">{product.size} | {product.color}</div>
            <div className="price-text">₹{product.price}</div>
          </div>
        </div>

        <div className="label-info">
          <p><strong>Product Code:</strong> {productCode}</p>
          <p><strong>Product:</strong> {product.name}</p>
          <p><strong>Color:</strong> {product.color}</p>
          <p><strong>Size:</strong> {product.size}</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
        </div>

        <div className="label-actions">
          <button className="print-btn" onClick={handlePrint}>Print Label</button>
          <button className="copy-btn" onClick={() => {
            navigator.clipboard.writeText(productCode);
            alert("Product code copied!");
          }}>Copy Code</button>
        </div>
      </div>
    </div>
  );
}

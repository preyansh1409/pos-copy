import { useState, useRef, useEffect } from "react";
import "./BarcodeScannerInput.css";

export default function BarcodeScannerInput({ onBarcodeScanned, disabled }) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      e.preventDefault();
      onBarcodeScanned(barcodeInput.trim());
      setBarcodeInput("");
      inputRef.current?.focus();
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    setBarcodeInput(value);
  };

  return (
    <div className="barcode-scanner-input">
      <label htmlFor="barcode-input">
        <span className="scanner-icon">📱</span> Scan Barcode or Enter Product Code:
      </label>
      <input
        ref={inputRef}
        id="barcode-input"
        type="text"
        value={barcodeInput}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Scan barcode or type code (PRD-XXXXXX or PRD-XXXXXX-S-Black)..."
        disabled={disabled}
        autoComplete="off"
        className="barcode-input-field"
      />
    </div>
  );
}

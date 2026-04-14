import API_BASE_URL from "../apiConfig";
// Trigger Redeploy: Branding System Version 1.1
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";


export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  // --- Dynamic Branding State ---
  const [branding, setBranding] = useState({
    name: localStorage.getItem("business_name") || "POS Software",
    logo: localStorage.getItem("logo_url") || "/logo.jpg"
  });

  const fetchBranding = async (uname) => {
    if (!uname || uname.length < 3) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/tenant-branding/${uname}`);
      if (res.ok) {
        const data = await res.json();
        setBranding({
          name: data.business_name || "POS Software",
          logo: data.logo_url || "/logo.jpg"
        });
      }
    } catch (err) {
      console.error("Branding fetch failed");
    }
  };

  const navigate = useNavigate();

  const handleForgotSubmit = async () => {
    setForgotMessage("");
    setForgotError("");
    if (!forgotEmail) {
      setForgotError("Please enter your registered email");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
      } else {
        setForgotError(data.message || "An error occurred");
      }
    } catch (e) {
      setForgotError("Server Error");
    }
  };

  const handleLogin = async () => {
    setError("");
    setInputError(false);
    if (!username || !password) {
      setError("Enter username and password");
      setInputError(true);
      return;
    }

    /* ================= LOGIN ================= */
    try {
      // 1. Try regular user login first
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const backendRole = data.user.role;

        // Save session
        localStorage.setItem("role", backendRole);
        localStorage.setItem("username", data.user.username || username);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("db_name", data.user.db_name || "");

        // Update Branding
        const bName = data.user.business_name || "POS Software";
        const lUrl = data.user.logo_url || "/logo.jpg";
        localStorage.setItem("business_name", bName);
        localStorage.setItem("logo_url", lUrl);

        /* ================= AUTO NAVIGATION ================= */
        if (backendRole === "superadmin") {
          navigate("/superadmin-dashboard");
          return;
        } else if (backendRole === "admin" || backendRole === "manager" || backendRole === "client") {
          navigate("/admin-dashboard");
        } else if (backendRole === "sales") {
          navigate("/billing");
        } else if (backendRole === "purchase") {
          navigate("/purchase-dashboard");
        } else {
          setError("Unknown role");
          setInputError(true);
        }
        return;
      }

      // 2. If regular login failed, try superadmin login
      const saRes = await fetch(`${API_BASE_URL}/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const saData = await saRes.json();

      if (saRes.ok) {
        localStorage.setItem("role", "superadmin");
        localStorage.setItem("username", saData.user.username);
        // Reset Branding to default for superadmin
        localStorage.setItem("business_name", "Super Admin");
        localStorage.setItem("logo_url", "/logo.jpg");
        navigate("/superadmin-dashboard");
        return;
      }

      // Both failed — show error from regular login
      setError(data.message || "Invalid username or password");
      setInputError(true);

    } catch (err) {
      setError("Server connection failed");
      setInputError(true);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-card-login">
        <div className="admin-left-panel">
          <div className="brand-wrapper">
            <h1 className="brand-title">{branding.name}</h1>
            <p className="brand-subtitle">Cloud Point of Sale</p>
          </div>
          <div className="pos-icon-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '32px 0 18px 0' }}>
            <div className="pos-icon">💻</div>
          </div>
          <div className="left-footer">Secure • Fast • Reliable</div>
        </div>

        <div className="admin-right-panel">
          <h2 className="login-title">Sign In</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setInputError(false); setError(""); }}
            onBlur={() => fetchBranding(username)}
            style={inputError ? { border: '1.5px solid #e53935', background: '#fff6f6' } : {}}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setInputError(false); setError(""); }}
            style={inputError ? { border: '1.5px solid #e53935', background: '#fff6f6' } : {}}
          />

          {error && (
            <div style={{ color: '#e53935', marginBottom: 8, fontWeight: 500, fontSize: '1em' }}>{error}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '16px' }}>
            <span
              onClick={() => { setShowForgotModal(true); setForgotMessage(""); setForgotError(""); setForgotEmail(""); }}
              style={{ color: '#1e3a5f', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Request Password Reset?
            </span>
          </div>

          <button onClick={handleLogin}>Login</button>
        </div>

      </div>

      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '20px' }}>Reset Password</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Enter your registered email address and we'll send you a secure link to reset your password.</p>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', marginBottom: '16px', boxSizing: 'border-box' }}
            />

            {forgotError && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{forgotError}</div>}

            {forgotMessage && (
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #d1fae5', marginBottom: '16px' }}>
                <p style={{ color: '#065f46', fontSize: '13px', margin: 0, fontWeight: 500 }}>{forgotMessage}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotSubmit}
                style={{ padding: '10px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import API_BASE_URL from "../apiConfig";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuperAdminLogin.css";

export default function SuperAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setInputError(false);
    if (!username || !password) {
      setError("Enter username and password");
      setInputError(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("role", "superadmin");
        localStorage.setItem("username", data.user.username);
        // If your system uses tokens, you would save it here too:
        // localStorage.setItem("token", data.token);

        navigate("/superadmin-dashboard");
      } else {
        setError(data.message || "Invalid username or password");
        setInputError(true);
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server connection failed");
      setInputError(true);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-card-login">
        <div className="admin-left-panel">
          <div className="brand-wrapper">
            <h1 className="brand-title">POS Software</h1>
            <p className="brand-subtitle">Super Admin Portal</p>
          </div>
          <div className="pos-icon-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '32px 0 18px 0' }}>
            <div className="pos-icon">🛡️</div>
          </div>
          <div className="left-footer">System Administration • Secure</div>
        </div>
        <div className="admin-right-panel">
          <h2 className="login-title">Super Admin Sign In</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setInputError(false); setError(""); }}
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
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

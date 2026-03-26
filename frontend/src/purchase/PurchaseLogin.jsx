import "./PurchaseLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PurchaseLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && (data.user.role === "purchase" || data.user.role === "admin")) {
        localStorage.setItem("role", data.user.role);
        navigate("/purchase-dashboard");
      } else if (res.ok) {
        setError("Access Denied: You do not have purchase access");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="purchase-container">
      <div className="purchase-card">
        <div className="purchase-left">
          <h2>Purchase Login</h2>
          <p>Authorized purchase access only</p>
        </div>

        <div className="purchase-right">
          <h3>Login</h3>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

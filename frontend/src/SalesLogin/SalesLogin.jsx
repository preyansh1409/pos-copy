import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SalesLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.user.role === "sales") {
        localStorage.setItem("role", "sales");
        navigate("/billing");
      } else {
        alert("Access Denied");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div>
      <h2>Sales Login</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

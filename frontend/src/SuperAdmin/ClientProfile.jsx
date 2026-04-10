import API_BASE_URL from "../apiConfig";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateUserProfessional.css";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const res = await fetch(`http://localhost:5002/api/superadmin/profile/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClient(data);
        setFormData(data);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Server connection failed. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    // Parse subscription status as number if it's the specific field
    if (name === 'is_subscription_active') {
      finalValue = parseInt(value);
    }

    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5002/api/superadmin/profile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Client profile updated successfully!");
        setClient({ ...formData });
        setEditing(false);
      } else {
        alert("❌ Error: " + (data.message || "Failed to update"));
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("❌ Error connecting to server. Please check your backend.");
    }
  };

  const handleOpenDatabase = async () => {
    if (!window.confirm(`Are you sure you want to login directly to ${client.business_name}'s database?`)) return;

    try {
      const res = await fetch(`http://localhost:5002/api/superadmin/login-as-shop/${id}`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("db_name", data.user.db_name || "");
        
        window.location.href = "/admin-dashboard";
      } else {
        alert("Failed to login as shop: " + data.message);
      }
    } catch (err) {
      alert("Server error during direct login");
    }
  };

  if (loading) return <div className="professional" style={{ padding: "40px", textAlign: "center" }}>Loading Profile...</div>;
  if (error) return <div className="professional" style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;
  if (!client) return null;

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split('T')[0];
  };

  return (
    <div className="create-user-form professional profile-view">
      {/* Header Section */}
      <div style={{ position: "relative", textAlign: "center", marginBottom: "30px", padding: "0 100px" }}>
        <h3 style={{ margin: 0 }}>Client Detailed Profile</h3>

        <div style={{ position: "absolute", right: "0px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "10px" }}>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "5px 12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
            >
              Edit ✎
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              style={{ padding: "5px 12px", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
            >
              Save ✔
            </button>
          )}

          <button
            onClick={() => editing ? setEditing(false) : navigate(-1)}
            style={{ padding: "5px 12px", background: "#475569", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
          >
            {editing ? "Cancel" : "Back"}
          </button>
        </div>
      </div>

      <div className="profile-sections">
        {/* SECTION 1: Client Information */}
        <div className="profile-card">
          <h4>Client Information</h4>
          <div className="client-four-col-grid">
            <div className="info-group centered">
              <label>Company Name</label>
              {editing ? <input name="business_name" value={formData.business_name} onChange={handleChange} /> : <p>{client.business_name}</p>}
            </div>
            <div className="info-group centered">
              <label>Client Name</label>
              {editing ? <input name="client_name" value={formData.client_name} onChange={handleChange} /> : <p>{client.client_name}</p>}
            </div>
            <div className="info-group centered">
              <label>Email</label>
              {editing ? <input name="email" value={formData.email} onChange={handleChange} /> : <p>{client.email}</p>}
            </div>
            <div className="info-group centered">
              <label>Phone</label>
              {editing ? <input name="phone" value={formData.phone} onChange={handleChange} /> : <p>{client.phone}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: Login Information */}
        <div className="profile-card">
          <h4>Login Information</h4>
          <div className="client-four-col-grid">
            <div className="info-group centered">
              <label>Database Name</label>
              <p>
                <code 
                  onClick={handleOpenDatabase}
                  style={{ 
                    color: "#2563eb", 
                    cursor: "pointer", 
                    textDecoration: "underline",
                    background: "#eff6ff",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  }}
                  title="Click to open this database (Login as Shop)"
                >
                  {client.db_name} ↗
                </code>
              </p>
            </div>
            <div className="info-group centered">
              <label>Username</label>
              {editing ? <input name="username" value={formData.username} onChange={handleChange} /> : <p>{client.username}</p>}
            </div>
            <div className="info-group centered">
              <label>Password</label>
              {editing ? (
                <input
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder="New password"
                />
              ) : (
                <p>••••••••</p>
              )}
            </div>
            <div className="info-group centered">
              <label>Account Status</label>
              {editing ? (
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              ) : (
                <p style={{
                  textTransform: "capitalize",
                  fontWeight: "700",
                  color: client.status === 'active' ? "#22c55e" : (client.status === 'pending' ? "#f59e0b" : "#ef4444")
                }}>
                  {client.status || "Inactive"}
                </p>
              )}
            </div>
            <div className="info-group centered">
              <label>Account Created</label>
              <p>{new Date(client.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Subscription & Membership */}
        <div className="profile-card">
          <h4>Subscription</h4>
          <div className="client-four-col-grid">
            <div className="info-group centered">
              <label>Plan Type</label>
              {editing ? <input name="plan_name" value={formData.plan_name} onChange={handleChange} /> : <p>{client.plan_name}</p>}
            </div>
            <div className="info-group centered">
              <label>Start Date</label>
              {editing ? <input type="date" name="plan_start_date" value={formatDateForInput(formData.plan_start_date)} onChange={handleChange} /> : <p>{client.plan_start_date ? new Date(client.plan_start_date).toLocaleDateString() : "N/A"}</p>}
            </div>
            <div className="info-group centered">
              <label>Expiry Date</label>
              {editing ? <input type="date" name="plan_end_date" value={formatDateForInput(formData.plan_end_date)} onChange={handleChange} /> : <p>{client.plan_end_date ? new Date(client.plan_end_date).toLocaleDateString() : "N/A"}</p>}
            </div>
            <div className="info-group centered">
              <label>Subscription Status</label>
              {editing ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                  <select name="is_subscription_active" value={formData.is_subscription_active} onChange={handleChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              ) : (
                <p style={{ color: client.is_subscription_active ? "#22c55e" : "#ef4444", fontWeight: "700" }}>
                  {client.is_subscription_active ? "Active" : "Inactive"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Payment Summary */}
        <div className="profile-card">
          <h4>Payment Information</h4>
          <div className="client-four-col-grid">
            <div className="info-group centered">
              <label>Payment Amount</label>
              {editing ? <input type="number" name="last_payment_amount" value={formData.last_payment_amount} onChange={handleChange} /> : <p>₹{client.last_payment_amount}</p>}
            </div>
            <div className="info-group centered">
              <label>Payment Date</label>
              {editing ? <input type="date" name="last_payment_date" value={formatDateForInput(formData.last_payment_date)} onChange={handleChange} /> : <p>{client.last_payment_date ? new Date(client.last_payment_date).toLocaleDateString() : "N/A"}</p>}
            </div>
            <div className="info-group centered">
              <label>Payment Mode</label>
              {editing ? (
                <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              ) : (
                <p>{client.payment_method || "N/A"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-card {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #eef2f6;
          text-align: center;
        }
        .profile-card h4 {
          margin-top: 0;
          color: #1a237e;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 1.1rem;
          text-align: center;
        }
        .client-four-col-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 10px;
        }
        @media (max-width: 1100px) {
          .client-four-col-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .client-four-col-grid { grid-template-columns: 1fr; }
        }
        .info-group.centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        .info-group label {
          font-size: 0.85rem;
          color: #64748b;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .info-group p {
          margin: 0;
          font-size: 1.05rem;
          color: #1e293b;
          font-weight: 500;
          width: 100%;
          word-break: break-word;
        }
        .info-group input, .info-group select {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          width: 100%;
          max-width: 250px;
          font-size: 0.95rem;
          text-align: center;
        }
        .full-width {
          grid-column: span 4;
        }
        @media (max-width: 1100px) {
          .full-width { grid-column: span 2; }
        }
        @media (max-width: 600px) {
          .full-width { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};

export default ClientProfile;

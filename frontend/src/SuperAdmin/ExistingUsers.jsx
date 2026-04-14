import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateUserProfessional.css";

const ExistingUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeFilter = location.state?.filter || 'all';

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [clients, activeFilter]);

  const applyFilter = () => {
    let result = [...clients];
    if (activeFilter === 'active') {
      result = clients.filter(c => c.is_subscription_active === 1);
    } else if (activeFilter === 'inactive') {
      result = clients.filter(c => c.is_subscription_active === 0);
    } else if (activeFilter === 'expiring') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      result = clients.filter(c => {
        if (!c.plan_end_date) return false;
        const endDate = new Date(c.plan_end_date);
        return endDate >= today && endDate <= nextWeek;
      });
    }
    setFilteredClients(result);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/superadmin/registrations`);
      const data = await res.json();

      if (res.ok) {
        setClients(data.clients);
      } else {
        setError(data.message || "Failed to fetch clients");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`Client status updated to ${newStatus}`);
        fetchClients(); // Refresh list
      } else {
        const data = await res.json();
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleOpenDatabase = async (e, client) => {
    e.stopPropagation(); // Prevent navigating to profile page
    if (!window.confirm(`Are you sure you want to login directly to ${client.business_name}'s database?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/login-as-shop/${client.id}`, {
        method: "POST"
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("db_name", data.user.db_name || "");
        localStorage.setItem("business_name", data.user.business_name || "Point of Sale Software");
        localStorage.setItem("logo_url", data.user.logo_url || "/logo.jpg");

        window.location.href = "/admin-dashboard";
      } else {
        alert("Failed to login as shop: " + data.message);
      }
    } catch (err) {
      alert("Server error during direct login");
    }
  };

  return (
    <div className="existing-clients-section professional" style={{ margin: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0 }}>Registered Clients</h3>
          {activeFilter !== 'all' && (
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                background: "#e8eaf6",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                color: "#1a237e",
                fontWeight: "600"
              }}>
                Showing: {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </span>
              <button
                onClick={() => navigate(".", { replace: true, state: {} })}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d32f2f",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  textDecoration: "underline"
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/superadmin-dashboard")}
            className="back-btn"
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              background: "#64748b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600"
            }}
          >
            ← Back to Dashboard
          </button>
          <button onClick={fetchClients} className="refresh-btn" style={{ padding: "8px 16px", cursor: "pointer", background: "#1a237e", color: "white", border: "none", borderRadius: "4px" }}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>Loading clients...</p>
      ) : error ? (
        <p style={{ textAlign: "center", color: "red", padding: "20px" }}>{error}</p>
      ) : (
        <div className="clients-table-container">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Client Name</th>
                <th style={{ textAlign: "center" }}>Email</th>
                <th style={{ textAlign: "center" }}>Phone</th>
                <th style={{ textAlign: "center" }}>Subscription Plan</th>
                <th style={{ textAlign: "center" }}>Database</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/superadmin-dashboard/client-profile/${client.id}`)}
                    className="clickable"
                    title="Click to view full profile"
                  >
                    <td style={{ fontWeight: "600" }}>{client.business_name}</td>
                    <td>{client.client_name}</td>
                    <td style={{ textAlign: "center" }}>{client.email}</td>
                    <td style={{ textAlign: "center" }}>{client.phone}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: "500", textAlign: "center" }}>{client.plan_name}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <code
                        onClick={(e) => handleOpenDatabase(e, client)}
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                        title="Click to open this database (Login as Shop)"
                      >
                        {client.db_name} ↗
                      </code>
                    </td>
                    <td>
                      <span className={`status-badge ${client.status}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>No registered clients found match this filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExistingUsers;

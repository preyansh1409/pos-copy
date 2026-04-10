import API_BASE_URL from "../apiConfig";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SuperAdminStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/dashboard-stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data.summary);
        setRecentClients(data.recent_clients);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ 
      height: "80vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontSize: "1.2rem",
      color: "#64748b",
      fontWeight: "500"
    }}>
      <div className="loader-container">
        <div className="pulse-loader"></div>
        Loading Dashboard Stats...
      </div>
    </div>
  );

  const statCards = [
    { title: "Total Clients", value: stats?.total_clients || 0, color: "#6366f1", bg: "#eef2ff" },
    { title: "Active Subscription", value: stats?.active_subscriptions || 0, color: "#10b981", bg: "#ecfdf5" },
    { title: "Inactive Subscription", value: stats?.inactive_subscriptions || 0, color: "#f59e0b", bg: "#fffbeb" },
    { title: "Expire Soon", value: stats?.expiring_soon || 0, color: "#ef4444", bg: "#fef2f2" },
  ];

  return (
    <div className="superadmin-stats-container">
      <div className="stats-header">
        <h1>Super Admin Overview</h1>
        <p>Real-time metrics for your business performance</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card clickable-box" 
            onClick={() => {
              if (card.title === "Total Clients") navigate("existing-users", { state: { filter: 'all' } });
              else if (card.title === "Active Subscription") navigate("existing-users", { state: { filter: 'active' } });
              else if (card.title === "Inactive Subscription") navigate("existing-users", { state: { filter: 'inactive' } });
              else if (card.title === "Expire Soon") navigate("existing-users", { state: { filter: 'expiring' } });
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
            <div className="stat-progress-bar">
               <div className="progress-fill" style={{ backgroundColor: card.color, width: '100%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <div className="data-card recent-registrations">
          <div className="card-header">
            <h3>Latest Registrations</h3>
            <span className="badge">New Updates</span>
          </div>
          <div className="recent-list">
            {recentClients.length > 0 ? recentClients.map((client, idx) => (
              <div key={idx} className="recent-item">
                <div className="client-details">
                  <strong>{client.business_name}</strong>
                  <span>{client.client_name}</span>
                </div>
                <div className="client-meta">
                  <div className="revenue-badge">₹{client.last_payment_amount || 0}</div>
                  <small>{new Date(client.created_at).toLocaleDateString()}</small>
                </div>
                <div className="status-wrap">
                  <span className={`status-pill ${client.status || 'inactive'}`}>{client.status || 'Inactive'}</span>
                </div>
              </div>
            )) : <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>No recent registrations found.</p>}
          </div>
          <button className="view-all-btn" onClick={() => navigate("existing-users")}>Go to User Management →</button>
        </div>

        <div className="data-card system-health">
          <div className="card-header">
            <h3>Company Insights</h3>
          </div>
          <div className="health-metrics">
             <div className="health-item">
                <div className="health-label">
                   <span className="dot online"></span>
                   <span>Active Subscription</span>
                </div>
                <strong>{stats?.active_subscriptions || 0}</strong>
             </div>
             <div className="health-item">
                <div className="health-label">
                   <span className="dot offline" style={{ background: '#f59e0b' }}></span>
                   <span>Inactive Subscription</span>
                </div>
                <strong>{stats?.inactive_subscriptions || 0}</strong>
             </div>
             <div className="health-item">
                <div className="health-label">
                   <span className="dot alert"></span>
                   <span>Expire Soon</span>
                </div>
                <strong>{stats?.expiring_soon || 0}</strong>
             </div>
          </div>
          
          <div className="quick-stats-box">
             <h4>Quick Actions</h4>
             <div className="action-tag" onClick={() => navigate("create-user")}>+ Register New Client</div>
             <div className="action-tag" onClick={() => navigate("existing-users")}>💳 Check Payments</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .superadmin-stats-container {
          padding: 30px;
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats-header {
          margin-bottom: 35px;
        }
        .stats-header h1 {
          font-size: 2.4rem;
          color: #1e293b;
          margin: 0;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .stats-header p {
          color: #64748b;
          margin-top: 5px;
          font-size: 1.1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 35px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
        }
        .stat-info h3 {
          margin: 0;
          font-size: 1.8rem;
          color: #0f172a;
          font-weight: 800;
        }
        .stat-info p {
          margin: 2px 0 0 0;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .stat-progress-bar {
          height: 4px;
          background: #f1f5f9;
          margin-top: 15px;
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-fill { height: 100%; border-radius: 10px; }
        
        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
        }
        @media (max-width: 1024px) {
          .dashboard-content-grid { grid-template-columns: 1fr; }
        }
        .data-card {
          background: white;
          border-radius: 24px;
          padding: 25px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }
        .card-header h3 { margin: 0; font-size: 1.3rem; color: #1e293b; font-weight: 700; }
        .badge {
          background: #f1f5f9;
          color: #475569;
          padding: 5px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }
        .recent-item {
          display: grid;
          grid-template-columns: 50px 1fr 100px 100px;
          align-items: center;
          gap: 15px;
          padding: 12px 15px;
          border-radius: 16px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .recent-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .client-avatar {
          width: 44px;
          height: 44px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .recent-item strong { color: #1e293b; display: block; }
        .recent-item span { color: #64748b; font-size: 0.85rem; }
        .revenue-badge { color: #10b981; font-weight: 700; font-size: 1rem; text-align: right; }
        .client-meta { text-align: right; }
        .client-meta small { color: #94a3b8; font-size: 0.75rem; }
        .status-pill {
          padding: 4px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-block;
          text-align: center;
          width: 80px;
        }
        .status-pill.active { background: #dcfce7; color: #15803d; }
        .status-pill.pending { background: #fef9c3; color: #a16207; }
        .status-pill.inactive { background: #fee2e2; color: #b91c1c; }
        
        .view-all-btn {
          width: 100%;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-all-btn:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
        
        .health-metrics {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 25px;
        }
        .health-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px dashed #f1f5f9;
        }
        .health-label { display: flex; align-items: center; gap: 10px; color: #475569; font-size: 0.95rem; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.online { background: #10b981; }
        .dot.pending { background: #f59e0b; }
        .dot.alert { background: #ef4444; }
        
        .quick-stats-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .quick-stats-box h4 { margin: 0 0 5px 0; color: #1e293b; font-size: 1rem; }
        .action-tag {
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .action-tag:hover { background: #f1f5f9; transform: translateX(5px); }
        
        .pulse-loader {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid #f1f5f9;
          border-top-color: #3b82f6;
          animation: spin 0.8s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SuperAdminStats;

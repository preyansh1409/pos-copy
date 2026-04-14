import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css"; // Reuse dashboard styles

const PersonalInfo = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        business_name: localStorage.getItem("business_name") || "",
        address: localStorage.getItem("address") || "",
        phone: localStorage.getItem("phone") || "",
        logo_url: localStorage.getItem("logo_url") || "/logo.jpg"
    });

    const planInfo = {
        name: localStorage.getItem("plan_name") || "N/A",
        start: localStorage.getItem("plan_start_date") || "N/A",
        end: localStorage.getItem("plan_end_date") || "N/A",
        amount: localStorage.getItem("last_payment_amount") || "0"
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await fetch(`${API_BASE_URL}/auth/update-client-info/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address: formData.address,
                    phone: formData.phone,
                    business_name: formData.business_name,
                    logo_url: formData.logo_url
                })
            });

            if (res.ok) {
                localStorage.setItem("address", formData.address);
                localStorage.setItem("phone", formData.phone);
                setMessage({ type: "success", text: "Information updated successfully! Refreshing..." });
                setIsEditing(false);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: "error", text: "Failed to update information." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Server error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="personal-info-container" style={{ padding: '20px' }}>
            <div className="dashboard-header-realtime" style={{ marginBottom: '30px' }}>
                <h1 className="dashboard-title">Personal Information</h1>
                <button
                    className="action-btn"
                    style={{ background: isEditing ? '#64748b' : '#1e3a5f', color: 'white' }}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? "Cancel" : "Edit Details"}
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: message.type === 'success' ? '#ecfdf5' : '#fff1f2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#f43f5e'}`
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Business Details */}
                <div className="premium-card" style={{ padding: '30px', background: 'white', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '25px', color: '#1e3a5f', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Business Details</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img
                                src={formData.logo_url}
                                alt="Logo"
                                style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>COMPANY NAME</label>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>{formData.business_name}</div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>PHONE NUMBER</label>
                            {isEditing ? (
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '5px' }}
                                />
                            ) : (
                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: '5px' }}>{formData.phone || "Not Set"}</div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>BUSINESS ADDRESS</label>
                            {isEditing ? (
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '5px', minHeight: '80px' }}
                                />
                            ) : (
                                <div style={{ fontSize: '15px', color: '#475569', marginTop: '5px', lineHeight: '1.5' }}>{formData.address || "No address provided"}</div>
                            )}
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                style={{
                                    background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '10px'
                                }}
                            >
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Subscription Plan */}
                <div className="premium-card" style={{ padding: '30px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '25px', color: '#1a365d', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Subscription Plan</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Current Plan</label>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{planInfo.name}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '12px' }}>
                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>START DATE</label>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{planInfo.start ? new Date(planInfo.start).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '12px' }}>
                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>EXPIRY DATE</label>
                                <div style={{ fontWeight: 600, color: '#ef4444' }}>{planInfo.end ? new Date(planInfo.end).toLocaleDateString() : "N/A"}</div>
                            </div>
                        </div>

                        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                            <label style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 800 }}>LAST PAYMENT</label>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a5f' }}>₹ {Number(planInfo.amount).toLocaleString()}</div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
                                💡 To upgrade your plan or extend your subscription, please contact Spick Technology support from the sidebar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;

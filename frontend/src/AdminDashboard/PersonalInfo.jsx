import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";
import "./PersonalInfo.css";

const PersonalInfo = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [formData, setFormData] = useState({
        business_name: localStorage.getItem("business_name") || "",
        address: localStorage.getItem("business_address") || "",
        phone: localStorage.getItem("business_phone") || "",
        plan_detail: localStorage.getItem("plan_detail") || "Trial",
        plan_expiry: localStorage.getItem("plan_expiry") || "",
        logo_url: localStorage.getItem("logo_url") || "/logo.jpg"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const username = localStorage.getItem("username");
            const res = await fetch(`${API_BASE_URL}/auth/update-branding`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, username })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ text: "Information updated successfully!", type: "success" });
                // Update local storage
                localStorage.setItem("business_name", formData.business_name);
                localStorage.setItem("business_address", formData.address);
                localStorage.setItem("business_phone", formData.phone);
                localStorage.setItem("logo_url", formData.logo_url);
            } else {
                setMessage({ text: data.message || "Update failed", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Network error. Try again.", type: "error" });
        }
        setLoading(false);
    };

    return (
        <div className="personal-info-container">
            <div className="pi-card">
                <h2>🏢 Personal Information</h2>
                <p className="pi-subtitle">Manage your business contact details and subscription status</p>

                {message.text && (
                    <div className={`pi-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="pi-form">
                    <div className="pi-grid">
                        <div className="pi-field">
                            <label>Business Name</label>
                            <input
                                type="text"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="pi-field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="pi-field full-width">
                            <label>Business Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="pi-field">
                            <label>Logo URL (Base64)</label>
                            <input
                                type="text"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                placeholder="Paste Logo URL or Base64 here"
                            />
                        </div>

                        <div className="pi-field divider"></div>

                        <div className="pi-field">
                            <label>Current Plan</label>
                            <input
                                type="text"
                                value={formData.plan_detail}
                                disabled
                                className="disabled-field"
                            />
                        </div>

                        <div className="pi-field">
                            <label>Plan Expires On</label>
                            <input
                                type="text"
                                value={formData.plan_expiry ? new Date(formData.plan_expiry).toLocaleDateString() : "No Expiry Set"}
                                disabled
                                className="disabled-field"
                            />
                        </div>
                    </div>

                    <button type="submit" className="pi-save-btn" disabled={loading}>
                        {loading ? "Saving..." : "Save Information"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PersonalInfo;

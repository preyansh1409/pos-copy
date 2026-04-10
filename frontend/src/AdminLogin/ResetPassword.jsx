import API_BASE_URL from "../apiConfig";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./AdminLogin.css"; // Reuse login styles

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleReset = async () => {
        setError("");
        setMessage("");

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password updated successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } else {
                setError(data.message || "Failed to reset password.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }

        setLoading(false);
    };

    return (
        <div className="admin-login-container">
            <div className="admin-card-login">

                <div className="admin-left-panel">
                    <div className="brand-wrapper">
                        <h1 className="brand-title">Prestige Garments</h1>
                        <p className="brand-subtitle">ERP Management System</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '32px 0 18px 0' }}>
                        <img src="/logo.jpg" alt="PG Logo" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }} />
                    </div>
                    <div className="left-footer">Secure • Fast • Reliable</div>
                </div>

                <div className="admin-right-panel">
                    <h2 className="login-title">Reset Password</h2>

                    {token ? (
                        <>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                                style={error ? { border: '1.5px solid #e53935', background: '#fff6f6' } : {}}
                            />

                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                style={error ? { border: '1.5px solid #e53935', background: '#fff6f6' } : {}}
                            />

                            {error && (
                                <div style={{ color: '#e53935', marginBottom: 16, fontWeight: 500, fontSize: '0.9em' }}>{error}</div>
                            )}
                            {message && (
                                <div style={{ color: '#10b981', marginBottom: 16, fontWeight: 600, fontSize: '0.9em' }}>{message}</div>
                            )}

                            <button onClick={handleReset} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </>
                    ) : (
                        <div style={{ color: '#e53935', marginTop: 20, fontWeight: 500 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <span
                            onClick={() => navigate("/")}
                            style={{ color: '#1e3a5f', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Back to Login
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}

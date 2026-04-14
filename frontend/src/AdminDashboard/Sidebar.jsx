import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SUBSCRIPTION_END = new Date("2027-01-01");

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showReportsMenu, setShowReportsMenu] = useState(false);
    const [showStockMenu, setShowStockMenu] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [showBillsMenu, setShowBillsMenu] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const daysLeft = (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return Math.max(Math.ceil((SUBSCRIPTION_END - today) / (1000 * 60 * 60 * 24)), 0);
    })();

    // Sync menu expansion with current route
    useEffect(() => {
        const sync = () => {
            if (location.pathname.includes('sales-bill') || location.pathname.includes('purchase-bill')) {
                setShowReportsMenu(true);
            }
            if (location.state?.page === 'stocks' || location.state?.page === 'adjustments' || ['returnhistory', 'replacehistory'].includes(location.state?.page)) {
                setShowStockMenu(true);
            }
            if (location.state?.page === 'dailycollection' || location.state?.page === 'dayoutreport') {
                setShowCollectionMenu(true);
            }
        };
        sync();
    }, [location.pathname, location.state]);

    const isActive = (path, pageState) => {
        if (pageState) {
            return location.state?.page === pageState;
        }
        if (path === '/admin-dashboard') {
            return location.pathname === '/admin-dashboard' && !location.state?.page;
        }
        return location.pathname === path;
    };

    const isGroupActive = (type) => {
        if (type === 'reports') {
            return location.pathname.includes('sales-bill') ||
                location.pathname.includes('purchase-bill') ||
                ['saleseditlogs', 'purchaseeditlogs', 'barcodes'].includes(location.state?.page);
        }
        if (type === 'stocks') {
            return location.state?.page === 'stocks' ||
                location.state?.page === 'adjustments' ||
                ['returnhistory', 'replacehistory'].includes(location.state?.page);
        }
        if (type === 'collection') {
            return location.state?.page === 'dailycollection' || location.state?.page === 'dayoutreport';
        }
        if (type === 'billing') {
            return location.pathname === '/billing' || location.pathname === '/purchase-dashboard';
        }
        return false;
    };

    const userRole = (localStorage.getItem('role') || '').toLowerCase();
    const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
    const isSales = userRole === 'sales';
    const isPurchase = userRole === 'purchase';

    const handleSupportRequest = async (type) => {
        try {
            const username = localStorage.getItem("username") || "Admin@123";
            const res = await fetch(`${API_BASE_URL}/support/send-support-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, daysLeft, username })
            });

            const data = await res.json();
            if (res.ok) {
                // We close the modal immediately and show a brief success alert
                setShowSupportModal(false);
                alert(`✅ Your request for ${type === 'renewal' ? 'Renewal' : 'Technical Support'} has been sent!`);
            } else {
                alert("❌ " + (data.error || "Failed to send request"));
            }
        } catch (err) {
            console.error(err);
            const subj = encodeURIComponent(type === 'renewal' ? 'Subscription Renewal Request' : 'Technical Support Request');
            alert("❌ System error. Manual fallback: Opening mail app...");
            window.location.href = `mailto:preyanshpatel1409@gmail.com?subject=${subj}`;
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '10px' }}>
                    {/* Spick Logo */}
                    <img src="/spick-logo.png" alt="Spick Technology" className="brand-logo" style={{ maxWidth: '120px' }} />

                    {/* Divider */}
                    <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                    {/* Client Branding (Dynamic) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 14,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            maxWidth: '180px'
                        }}>
                            {localStorage.getItem('business_name') || 'Point of Sale Software'}
                        </span>
                        <img
                            src={localStorage.getItem('logo_url') || '/logo.jpg'}
                            alt="Logo"
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'contain',
                                borderRadius: '50%'
                            }}
                        />
                    </div>
                </div>
            </div>

            <nav className="sidebar-menu">
                {isAdminOrManager && (
                    <>
                        <button
                            className={`menu-item ${isActive('/admin-dashboard') ? 'active' : ''}`}
                            onClick={() => navigate('/admin-dashboard', { state: { page: null } })}
                        >
                            Dashboard
                        </button>

                        <button
                            className={`menu-item ${isGroupActive('collection') ? 'active' : ''}`}
                            onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                        >
                            Daywise Reports <span style={{ marginLeft: 'auto', fontSize: 10 }}>{showCollectionMenu ? '▲' : '▼'}</span>
                        </button>
                        {showCollectionMenu && (
                            <div className="submenu">
                                <button
                                    className={`submenu-item ${location.state?.page === 'dailycollection' && (!location.state?.activeTab || location.state?.activeTab === 'summary') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dailycollection', activeTab: 'summary' } })}
                                >
                                    Today's Summary
                                </button>
                                <button
                                    className={`submenu-item ${location.state?.activeTab === 'bills' ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dailycollection', activeTab: 'bills' } })}
                                >
                                    Today's Bill
                                </button>
                                <button
                                    className={`submenu-item ${location.state?.activeTab === 'refunds' ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dailycollection', activeTab: 'refunds' } })}
                                >
                                    Cash Refunds
                                </button>
                                <button
                                    className={`submenu-item ${location.state?.activeTab === 'credits' ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dailycollection', activeTab: 'credits' } })}
                                >
                                    Credit Notes
                                </button>
                                <button
                                    className={`submenu-item ${location.state?.activeTab === 'replacements' ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dailycollection', activeTab: 'replacements' } })}
                                >
                                    Replacements
                                </button>
                                <button
                                    className={`submenu-item ${location.state?.page === 'dayoutreport' ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'dayoutreport' } })}
                                >
                                    Dayout Report
                                </button>
                            </div>
                        )}


                        <button
                            className={`menu-item ${isActive(null, 'users') ? 'active' : ''}`}
                            onClick={() => navigate('/admin-dashboard', { state: { page: 'users' } })}
                        >
                            Users
                        </button>

                        <button
                            className={`menu-item ${isGroupActive('stocks') ? 'active' : ''}`}
                            onClick={() => setShowStockMenu(!showStockMenu)}
                        >
                            Stocks <span style={{ marginLeft: 'auto', fontSize: 10 }}>{showStockMenu ? '▲' : '▼'}</span>
                        </button>
                        {showStockMenu && (
                            <div className="submenu">
                                <button
                                    className={`submenu-item ${isActive(null, 'stocks') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'stocks' } })}
                                >
                                    Stock
                                </button>
                                <button
                                    className={`submenu-item ${isActive(null, 'adjustments') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'adjustments' } })}
                                >
                                    Stock Adjustment
                                </button>
                                <button
                                    className={`submenu-item ${isActive(null, 'returnhistory') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'returnhistory' } })}
                                >
                                    Return History
                                </button>
                                <button
                                    className={`submenu-item ${isActive(null, 'replacehistory') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'replacehistory' } })}
                                >
                                    Replace History
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Reports Dropdown */}
                <button
                    className={`menu-item ${isGroupActive('reports') ? 'active' : ''}`}
                    onClick={() => setShowReportsMenu(!showReportsMenu)}
                >
                    Reports <span style={{ marginLeft: 'auto', fontSize: 10 }}>{showReportsMenu ? '▲' : '▼'}</span>
                </button>
                {showReportsMenu && (
                    <div className="submenu">
                        {(isAdminOrManager || isSales) && (
                            <button
                                className={`submenu-item ${isActive('/sales-bill') ? 'active' : ''}`}
                                onClick={() => navigate('/sales-bill', { state: { from: isAdminOrManager ? 'admin-dashboard' : 'billing' } })}
                            >
                                Sales Bill page
                            </button>
                        )}
                        {(isAdminOrManager || isPurchase) && (
                            <button
                                className={`submenu-item ${isActive('/purchase-bill') ? 'active' : ''}`}
                                onClick={() => navigate('/purchase-bill', { state: { from: isAdminOrManager ? 'admin-dashboard' : 'purchase-dashboard' } })}
                            >
                                Purchase Bill page
                            </button>
                        )}
                        {isAdminOrManager && (
                            <>
                                <button
                                    className={`submenu-item ${isActive(null, 'saleseditlogs') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'saleseditlogs' } })}
                                >
                                    Invoice Logs (Sales)
                                </button>
                                <button
                                    className={`submenu-item ${isActive(null, 'purchaseeditlogs') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'purchaseeditlogs' } })}
                                >
                                    Invoice Logs (Purchase)
                                </button>
                                <button
                                    className={`submenu-item ${isActive(null, 'barcodes') ? 'active' : ''}`}
                                    onClick={() => navigate('/admin-dashboard', { state: { page: 'barcodes' } })}
                                >
                                    Print Barcodes
                                </button>
                            </>
                        )}
                    </div>
                )}

                {isAdminOrManager && (
                    <>
                        <button
                            className={`menu-item ${isGroupActive('billing') ? 'active' : ''}`}
                            onClick={() => setShowBillsMenu(!showBillsMenu)}
                        >
                            Billing <span style={{ marginLeft: 'auto', fontSize: 10 }}>{showBillsMenu ? '▲' : '▼'}</span>
                        </button>
                        {showBillsMenu && (
                            <div className="submenu">
                                <button
                                    className="submenu-item"
                                    onClick={() => navigate('/billing', { state: { from: 'admin-dashboard' } })}
                                >
                                    Billing Screen
                                </button>
                                <button
                                    className="submenu-item"
                                    onClick={() => navigate('/purchase-dashboard', { state: { from: 'admin-dashboard' } })}
                                >
                                    Purchase Dashboard
                                </button>
                            </div>
                        )}
                        <button
                            className={`menu-item ${isActive(null, 'personalinfo') ? 'active' : ''}`}
                            onClick={() => navigate('/admin-dashboard', { state: { page: 'personalinfo' } })}
                        >
                            Personal Information
                        </button>
                    </>
                )}

                {!isAdminOrManager && (
                    <button className="menu-item" onClick={() => navigate(-1)}>
                        Back
                    </button>
                )}
            </nav>


            <div className="sidebar-footer">
                {isAdminOrManager && (
                    <>
                        <div className="support-btn" onClick={() => setShowSupportModal(true)}>
                            <span className="icon">💬</span> Support & Help
                        </div>
                        <div className={`subscription-badge ${daysLeft <= 15 ? 'warning' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span>{daysLeft} Days Left</span>
                            {daysLeft <= 15 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSupportRequest('renewal'); }}
                                    style={{
                                        background: '#ffffff',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        padding: '4px 8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    Renew Now
                                </button>
                            )}
                        </div>
                        <div className="logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
                            Logout
                        </div>
                    </>
                )}
            </div>

            {/* Support Modal */}
            {
                showSupportModal && (
                    <div className="modal-overlay" style={{ zIndex: 9999 }}>
                        <div className="modal-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}><img src="/spick-logo.png" alt="Spick Technology" className="brand-logo" style={{ maxWidth: '120px' }} /></div>
                            <h3 className="modal-title">Spick Technology Support</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                Our team is here to help you with any queries or technical issues.
                            </p>

                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>📞</span>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>PHONE NUMBER</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>1000000000</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>✉️</span>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>EMAIL ADDRESS</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>preyanshpatel1409@gmail.com</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }} onClick={() => handleSupportRequest('renewal')}>
                                    Send subscription renew request
                                </button>

                                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowSupportModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </aside >
    );
}

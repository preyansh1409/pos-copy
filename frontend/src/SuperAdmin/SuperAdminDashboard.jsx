import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    // Add any other tokens/data you might be storing
    navigate("/");
  };

  const menuItems = [
    { title: "Dashboard", path: "/superadmin-dashboard", icon: "📊" },
    { title: "Create User", path: "create-user", icon: "➕" },
    { title: "Existing Users", path: "existing-users", icon: "👥" },
  ];

  const isActive = (path) => {
    if (path === "/superadmin-dashboard") {
      return location.pathname === "/superadmin-dashboard";
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="superadmin-dashboard">
      <aside className="superadmin-sidenav">
        <div className="sidebar-header">
          <div className="admin-avatar">SA</div>
          <h2>Super Admin</h2>
        </div>
        <nav>
          <ul>
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  className={isActive(item.path) ? "active" : ""}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <p>© 2026 Admin Panel</p>
        </div>
      </aside>
      <main className="superadmin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

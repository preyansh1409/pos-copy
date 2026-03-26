import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminDashboard.css";

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

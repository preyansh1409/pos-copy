import { BrowserRouter, Routes, Route } from "react-router-dom";


import AdminLogin from "./AdminLogin/AdminLogin";
import ResetPassword from "./AdminLogin/ResetPassword";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import PurchaseDashboard from "./purchase/PurchaseDashboard";
import AdminLayout from "./AdminDashboard/AdminLayout";
import Billing from "./Billing/Billing";
import SalesBill from "./salesbill/SalesBill";
import PurchaseBill from "./purchasebill/PurchaseBill";
import Print from "./Print/Print";
import ReturnReplace from "./ReturnReplace/ReturnReplace";
import DailyCollection from "./DailyCollection/DailyCollection";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import CreateUser from "./SuperAdmin/CreateUser";
import ExistingUsers from "./SuperAdmin/ExistingUsers";
import ClientProfile from "./SuperAdmin/ClientProfile";
import SuperAdminStats from "./SuperAdmin/SuperAdminStats";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* UNIFIED LOGIN - Single entry point for all roles */}
                <Route path="/" element={<AdminLogin />} />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* SUPER ADMIN DASHBOARD */}
                <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />}>
                    <Route index element={<SuperAdminStats />} />
                    <Route path="create-user" element={<CreateUser />} />
                    <Route path="existing-users" element={<ExistingUsers />} />
                    <Route path="client-profile/:id" element={<ClientProfile />} />
                </Route>

                {/* ADMIN ROUTES */}

                {/* Shared Layout for all Admin Screens */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/purchase-bill" element={<PurchaseBill />} />
                    <Route path="/sales-bill" element={<SalesBill />} />
                </Route>

                {/* PURCHASE ROUTES */}
                <Route path="/purchase-dashboard" element={<PurchaseDashboard />} />

                {/* BILLING / SALES / COLLECTION */}
                <Route path="/billing" element={<Billing />} />
                <Route path="/daily-collection" element={<DailyCollection />} />
                <Route path="/return-replace" element={<ReturnReplace />} />

                {/* PRINT */}
                <Route path="/print" element={<Print />} />
            </Routes>
        </BrowserRouter>
    );
}

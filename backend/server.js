import "dotenv/config";
import express from "express";
import cors from "cors";
import db, { tenantMiddleware } from "./db.js";
import createSuperAdminTables from "./models/superAdmin.model.js";

// Initialize Tables
createSuperAdminTables();


import authRoutes from "./routes/auth.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import masterdataRoutes from "./routes/masterdata.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import suppliersRoutes from "./routes/suppliers.routes.js";
import supportRoutes from "./routes/support.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import stockAdjustRoutes from "./routes/stockadjust.routes.js";
import returnsRoutes from "./routes/returns.routes.js";
import dayoutRoutes from "./routes/dayout.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";

const app = express();
const PORT = process.env.PORT || 5002;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(tenantMiddleware);

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/masterdata", masterdataRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/purchase", suppliersRoutes); // Handles /api/purchase/suppliers
app.use("/api/support", supportRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/stock", stockAdjustRoutes);
app.use("/api/returns", returnsRoutes);
app.use("/api/dayout", dayoutRoutes);
app.use("/api/superadmin", superAdminRoutes);

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("✅ Backend running successfully");
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT 1");
    res.json({ status: "success", message: "Database connected!", data: rows });
  } catch (err) {
    console.error("❌ Database Test Failed:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Database connection failed", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// (Test route removed as it uses the legacy 'users' table)

/* ================= START SERVER ================= */
// Only listen when running locally (not in Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 backend connected successfully on http://localhost:${PORT}`);
  });
}

export default app;
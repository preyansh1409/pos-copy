import express from "express";
import {
  superAdminLogin,
  registerClient,
  getRegistrations,
  updateClientStatus,
  getClientProfile,
  updateClientProfile,
  getDashboardStats,
  developerLoginAsShop
} from "../controllers/superadmin.controller.js";

const router = express.Router();

router.post("/login", superAdminLogin);
// registerSuperAdmin removed from here as per previous flow, handled via system or separate route if needed
router.post("/register-client", registerClient);
router.get("/registrations", getRegistrations);
router.get("/profile/:id", getClientProfile);
router.put("/profile/:id", updateClientProfile);
router.put("/update-status/:id", updateClientStatus);
router.get("/dashboard-stats", getDashboardStats);
router.post("/login-as-shop/:id", developerLoginAsShop);

export default router;

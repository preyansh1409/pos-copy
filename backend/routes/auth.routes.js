import express from "express";
import {
  login,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  getTenantBranding,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.post("/update-user/:id", updateUser);
router.post("/update-branding", updateBranding);
router.delete("/delete-user/:id", deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/tenant-branding/:username", getTenantBranding);

export default router;

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
  updateClientInfo,
  testMail,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/tenant-branding/:username", getTenantBranding);
router.put("/update-client-info/:id", updateClientInfo);
router.get("/test-mail", testMail);

export default router;

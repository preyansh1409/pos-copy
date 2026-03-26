import express from "express";

import {
  savePurchase,
  getAllPurchases,
  deletePurchaseBill,
  getPurchaseEditCount,
  logPurchaseEdit,
  getPurchaseEditHistory,
  getAllPurchaseEditLogs,
  deletePurchaseEditLog,
  getUniqueSuppliers,
  getUniquePurchaseInvoices
} from "../controllers/purchase.controller.js";
import { updatePurchase } from "../controllers/purchase.update.controller.js";

const router = express.Router();

router.get("/unique-suppliers", getUniqueSuppliers);
router.get("/unique-invoices", getUniquePurchaseInvoices);
router.post("/save", savePurchase);
router.get("/all", getAllPurchases); // ✅ REQUIRED
router.put("/update/:invoice_no", updatePurchase);

// Delete purchase bill
router.delete("/delete/:invoice_no", deletePurchaseBill);

// Purchase edit logs
router.get("/edit-count/:invoice_no", getPurchaseEditCount);
router.post("/log-edit", logPurchaseEdit);
router.get("/edit-history/:invoice_no", getPurchaseEditHistory);
router.get("/all-edit-logs", getAllPurchaseEditLogs);
router.delete("/delete-log/:id", deletePurchaseEditLog);

export default router;

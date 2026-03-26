
import express from "express";
import { saveSalesBill, getAllSales, getBillByInvoice, updateSalesBill, deleteSalesBill, getEditCount, verifyEditCredentials, logEdit, getEditHistory, getAllEditLogs, deleteSalesEditLog, getUniqueClients, getDailySummary } from "../controllers/billing.controller.js";

const router = express.Router();

router.get("/daily-summary", getDailySummary);
router.get("/unique-clients", getUniqueClients);
router.post("/save", saveSalesBill);
router.get("/all", getAllSales);
router.get("/get-bill/:invoice_no", getBillByInvoice);

// Update sales bill
router.put("/update/:invoice_no", updateSalesBill);

// Delete sales bill
router.delete("/delete/:invoice_no", deleteSalesBill);

// Edit logging routes
router.get("/edit-count/:invoice_no", getEditCount);
router.post("/verify-edit", verifyEditCredentials);
router.post("/log-edit", logEdit);
router.get("/edit-history/:invoice_no", getEditHistory);
router.get("/all-edit-logs", getAllEditLogs);
router.delete("/delete-log/:id", deleteSalesEditLog);

export default router;

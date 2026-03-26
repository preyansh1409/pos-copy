import express from "express";
import {
    processReplacement,
    getAllReplacements,
    getReplacementHistory,
    issueRefund,
    searchCreditNote,
    getAllCreditNotes,
    deleteCreditNote,
    searchCashRefund,
    getAllCashRefunds,
    getUnifiedHistory
} from "../controllers/returns.controller.js";

const router = express.Router();

// Replacement process
router.post("/replace", processReplacement);

// Refund process
router.post("/issue-refund", issueRefund);

// Unified Return & Exchange History Log
router.get("/unified-history", getUnifiedHistory);

// Credit Note search & retrieve & delete
router.get("/search-cn/:query", searchCreditNote);
router.get("/credit-notes", getAllCreditNotes);
router.delete("/credit-note/:cn_no", deleteCreditNote);

// Cash Refund search & retrieve
router.get("/search-cash/:query", searchCashRefund);
router.get("/cash-refunds", getAllCashRefunds);

// Fetch history of replacements
router.get("/all", getAllReplacements);
router.get("/history/:invoice_no", getReplacementHistory);

export default router;

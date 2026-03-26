import express from "express";
import db from "../db.js";
import {
    createCashRefund, getAllCashRefunds, deleteCashRefund,
    createReplacement, getAllReplacements, deleteReplacement,
    createCreditNote, getAllCreditNotes, deleteCreditNote,
    getRefundStatus
} from "../controllers/refund.controller.js";

const router = express.Router();

/* ---------- Cash Refund ---------- */
router.post("/cash-refund", createCashRefund);
router.get("/cash-refund/all", getAllCashRefunds);
router.delete("/cash-refund/:id", deleteCashRefund);

/* ---------- Replacement ---------- */
router.post("/replacement", createReplacement);
router.get("/replacement/all", getAllReplacements);
router.delete("/replacement/:id", deleteReplacement);

/* ---------- Credit Note ---------- */
router.post("/credit-note", createCreditNote);
router.get("/credit-note/all", getAllCreditNotes);
router.delete("/credit-note/:id", deleteCreditNote);

/* ---------- Status Check ---------- */
router.get("/status/:invoice_no", getRefundStatus);

/* ---------- Daily Collection ---------- */
router.get("/daily-collection", (req, res) => {
    const day = req.query.date || new Date().toISOString().slice(0, 10);
    const salesSql = `
        SELECT
            COALESCE(SUM(CASE WHEN payment_mode='Cash'   THEN grand_total ELSE 0 END),0) AS cash_total,
            COALESCE(SUM(CASE WHEN payment_mode='Online' THEN grand_total ELSE 0 END),0) AS online_total,
            COALESCE(SUM(CASE WHEN payment_mode='Credit' THEN grand_total ELSE 0 END),0) AS credit_total,
            COALESCE(SUM(grand_total),0) AS grand_total,
            COUNT(*) AS bill_count
        FROM sales_bills WHERE DATE(sale_date) = ?
    `;
    db.query(salesSql, [day], (e1, salesRows) => {
        if (e1) return res.status(500).json({ error: e1.message });
        db.query(`SELECT * FROM cash_refunds  WHERE DATE(refund_date)       = ? ORDER BY refund_date DESC`, [day], (e2, refunds) => {
            if (e2) return res.status(500).json({ error: e2.message });
            db.query(`SELECT * FROM replacements  WHERE DATE(replacement_date)  = ? ORDER BY replacement_date DESC`, [day], (e3, replacements) => {
                if (e3) return res.status(500).json({ error: e3.message });
                db.query(`SELECT * FROM credit_notes  WHERE DATE(credit_date)       = ? ORDER BY credit_date DESC`, [day], (e4, creditNotes) => {
                    if (e4) return res.status(500).json({ error: e4.message });
                    res.json({
                        date: day,
                        sales: salesRows[0] || { cash_total: 0, online_total: 0, credit_total: 0, grand_total: 0, bill_count: 0 },
                        refunds, replacements, creditNotes
                    });
                });
            });
        });
    });
});

export default router;


import express from "express";
import {
    getStockWithAdjustments,
    saveStockAdjustment,
    getAllAdjustments,
    deleteAdjustment
} from "../controllers/stockadjust.controller.js";

const router = express.Router();

router.get("/with-adjustments", getStockWithAdjustments);
router.post("/adjust", saveStockAdjustment);
router.get("/adjustments", getAllAdjustments);
router.delete("/adjust/:id", deleteAdjustment);

export default router;

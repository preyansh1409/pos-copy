import express from "express";
import { getStock, getCalculatedStock, getStockCategories, getStockItems, getStockSizes, getStockForProduct, getSystemStock, adjustStock, getAdjustmentLogs } from "../controllers/stock.controller.js";

const router = express.Router();
router.get("/system", getSystemStock);
router.post("/adjust", adjustStock);
router.get("/logs", getAdjustmentLogs);

router.get("/", getStock);
router.get("/calculated", getCalculatedStock);
router.get("/categories", getStockCategories);
router.get("/items", getStockItems);
router.get("/sizes", getStockSizes);
router.get("/for-product", getStockForProduct);

export default router;
